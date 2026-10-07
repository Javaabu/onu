"use client"

import * as React from "react"
import { FormProvider, type FieldValues, type UseFormReturn } from "react-hook-form"

import { cn } from "../../lib/utils"
import type { LabelLayout } from "../../providers/onu-provider"
import { useTranslation } from "../../providers/onu-provider"
import { FormErrorsProvider, FormLayoutProvider, toDotNotation, type FormErrors } from "./form-context"
import {
  errorEntries,
  flattenFieldErrors,
  focusFirstInvalid,
  readValidationErrors,
  type ValidationPayload,
} from "./validation"
import { ValidationSummary } from "./validation-summary"

/** Values of a form without react-hook-form: `FormData` as an object (repeated names become arrays). */
export type FormValues = Record<string, FormDataEntryValue | FormDataEntryValue[]>

export type FormStatus = "idle" | "submitting" | "success" | "error"

export interface FormContextValue {
  /** `true` while the submit handler runs, or when the `processing` prop is set. */
  processing: boolean
  status: FormStatus
  /** Every current error: server errors, react-hook-form errors and the `errors` prop. */
  errors: FormErrors
  /** A general message for errors not tied to a field. */
  formError: string | null
  /** Show server errors, e.g. from a custom request. Focuses the first invalid field. */
  setErrors: (errors: FormErrors | null, message?: string | null) => void
  formRef: React.RefObject<HTMLFormElement | null>
}

const FormContext = React.createContext<FormContextValue | null>(null)

/** The nearest Onu `Form`'s state (processing, status, errors), or `null` outside one. */
export function useOnuForm() {
  return React.useContext(FormContext)
}

/** Reads a `<form>`'s values into an object. Repeated names (checkbox groups, `tags[]`) become arrays. */
export function formDataToObject(data: FormData): FormValues {
  const out: FormValues = {}
  data.forEach((value, key) => {
    const existing = out[key]
    if (existing === undefined) out[key] = value
    else out[key] = Array.isArray(existing) ? [...existing, value] : [existing, value]
  })
  return out
}

export type FormSubmitHandler<T> = (values: T, event: React.FormEvent<HTMLFormElement>) => unknown

export interface FormProps<T extends FieldValues = FormValues> extends Omit<
  React.ComponentProps<"form">,
  "onSubmit" | "onError"
> {
  /** A react-hook-form `useForm()` result. Renders its `FormProvider` and submits through `handleSubmit`. */
  form?: UseFormReturn<T>
  /**
   * Called with the values (from react-hook-form, or the form's `FormData`).
   * May return a promise: the form shows a processing state until it settles.
   * Throw (or reject with) a Laravel 422 body, an axios error or a 422 `Response`
   * to show field errors. Without `onSubmit` the form submits natively.
   */
  onSubmit?: FormSubmitHandler<T>
  /** Server errors to show, e.g. Inertia's `form.errors`. Merged with errors from `onSubmit`. */
  errors?: FormErrors | null
  /** Mark the form as processing (e.g. Inertia's `form.processing`). */
  processing?: boolean
  /** Label layout for every field inside (R3.32). */
  labelLayout?: LabelLayout
  /** Disable every field. */
  disabled?: boolean
  /** Disable fields while processing. Default `true`. */
  disableWhileProcessing?: boolean
  /** Show the error summary at the top. Default `true`. */
  summary?: boolean
  summaryTitle?: React.ReactNode
  /** Focus the first invalid field when errors arrive. Default `true`. */
  focusOnError?: boolean
  onSuccess?: (result: unknown) => void
  onError?: (error: unknown, payload: ValidationPayload | null) => void
  classNames?: { summary?: string }
}

const EMPTY: FormErrors = {}

/**
 * `<form>` with label layout, disabled-while-processing, server errors and an
 * error summary. Works on its own, with Inertia (`errors`/`processing` props)
 * or with react-hook-form (`form`).
 */
export function Form<T extends FieldValues = FormValues>({
  form,
  onSubmit,
  errors: errorsProp,
  processing: processingProp,
  labelLayout,
  disabled,
  disableWhileProcessing = true,
  summary = true,
  summaryTitle,
  focusOnError = true,
  onSuccess,
  onError,
  className,
  classNames,
  children,
  ref,
  onChange,
  noValidate,
  ...props
}: FormProps<T>) {
  const { t } = useTranslation()
  const formRef = React.useRef<HTMLFormElement>(null)
  const busy = React.useRef(false)
  const pendingFocus = React.useRef(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [status, setStatus] = React.useState<FormStatus>("idle")
  const [serverErrors, setServerErrors] = React.useState<FormErrors | null>(null)
  const [formError, setFormError] = React.useState<string | null>(null)

  // react-hook-form mutates its errors object in place, so compare by content to keep a stable identity.
  const merged: FormErrors = {
    ...(form ? flattenFieldErrors(form.formState.errors) : EMPTY),
    ...serverErrors,
    ...errorsProp,
  }
  const errorsKey = JSON.stringify(merged)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const errors = React.useMemo<FormErrors>(() => merged, [errorsKey])

  const processing = !!processingProp || submitting

  const setErrors = React.useCallback(
    (next: FormErrors | null, message?: string | null) => {
      const entries = errorEntries(next)
      if (form) {
        for (const [name, messages] of entries)
          form.setError(toDotNotation(name) as never, { type: "server", message: messages.join(" ") })
      } else {
        setServerErrors(entries.length ? Object.fromEntries(entries) : null)
      }
      setFormError(message ?? null)
      if (entries.length || message) {
        pendingFocus.current = true
        setStatus("error")
      }
    },
    [form],
  )

  // Errors that arrive through the `errors` prop (e.g. after an Inertia visit) also move focus.
  React.useEffect(() => {
    if (errorEntries(errorsProp).length) pendingFocus.current = true
  }, [errorsProp])

  React.useEffect(() => {
    if (!pendingFocus.current) return
    pendingFocus.current = false
    if (!focusOnError) return
    if (!focusFirstInvalid(formRef.current, errors)) {
      formRef.current?.querySelector<HTMLElement>("[data-slot=validation-summary]")?.focus()
    }
  })

  async function run(values: T, event: React.FormEvent<HTMLFormElement>) {
    busy.current = true
    setSubmitting(true)
    setStatus("submitting")
    setServerErrors(null)
    setFormError(null)
    try {
      const result = await onSubmit!(values, event)
      setStatus("success")
      onSuccess?.(result)
    } catch (error) {
      const payload = await readValidationErrors(error)
      if (payload) setErrors(payload.errors, null)
      else {
        setFormError(t("form.submitFailed"))
        pendingFocus.current = true
      }
      setStatus("error")
      onError?.(error, payload)
    } finally {
      busy.current = false
      setSubmitting(false)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (busy.current || processingProp) {
      event.preventDefault() // no double submits (§25.9)
      return
    }
    if (!onSubmit) return
    event.preventDefault()
    if (form) {
      form.clearErrors()
      void form.handleSubmit(
        (values) => run(values as T, event),
        () => setStatus("error"),
      )(event)
    } else {
      void run(formDataToObject(new FormData(event.currentTarget)) as unknown as T, event)
    }
  }

  // Editing a field clears its server error.
  function handleChange(event: React.ChangeEvent<HTMLFormElement>) {
    onChange?.(event)
    const name = (event.target as unknown as HTMLInputElement).name
    if (!name || !serverErrors) return
    const key = Object.keys(serverErrors).find((k) => toDotNotation(k) === toDotNotation(name))
    if (key) {
      const { [key]: _removed, ...rest } = serverErrors
      setServerErrors(Object.keys(rest).length ? rest : null)
    }
  }

  const ctx = React.useMemo<FormContextValue>(
    () => ({ processing, status, errors, formError, setErrors, formRef }),
    [processing, status, errors, formError, setErrors],
  )

  const content = (
    <FormContext.Provider value={ctx}>
      <FormLayoutProvider labelLayout={labelLayout} disabled={disabled || (disableWhileProcessing && processing)}>
        <FormErrorsProvider errors={errors}>
          <form
            ref={(node) => {
              formRef.current = node
              if (typeof ref === "function") ref(node)
              else if (ref) ref.current = node
            }}
            data-slot="form"
            data-status={status}
            aria-busy={processing || undefined}
            noValidate={noValidate ?? !!form}
            className={cn("gap-6 grid", className)}
            onSubmit={handleSubmit}
            onChange={handleChange}
            {...props}
          >
            {summary ? (
              <ValidationSummary
                errors={errors}
                message={formError}
                title={summaryTitle}
                className={classNames?.summary}
              />
            ) : null}
            {children}
          </form>
        </FormErrorsProvider>
      </FormLayoutProvider>
    </FormContext.Provider>
  )

  return form ? <FormProvider {...form}>{content}</FormProvider> : content
}
