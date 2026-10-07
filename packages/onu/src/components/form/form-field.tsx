"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import type { LabelLayout } from "../../providers/onu-provider"
import { Label } from "../../ui/label"
import { FieldErrors } from "./field-errors"
import { toArray, useFieldErrors, useFormDisabled, useLabelLayout } from "./form-context"
import { HelpText } from "./help-text"
import { RequiredMarker } from "./required-marker"

interface FormFieldContextValue {
  id: string
  name?: string
  labelId: string
  helpId?: string
  errorId?: string
  invalid: boolean
  required: boolean
  disabled: boolean
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

/** The current FormField, or `null` outside one. */
export function useFormField() {
  return React.useContext(FormFieldContext)
}

/**
 * Props a control spreads to be wired to its FormField: `id`, `name`,
 * `aria-describedby`, `aria-invalid`, `aria-required`, `disabled` (R14.7).
 * Explicit props passed to the control win.
 */
export function useFormFieldControl<P extends Record<string, unknown>>(props: P = {} as P) {
  const field = useFormField()
  if (!field) return props
  const describedBy = [props["aria-describedby"], field.helpId, field.errorId].filter(Boolean).join(" ") || undefined
  return {
    ...props,
    id: (props.id as string | undefined) ?? field.id,
    name: (props.name as string | undefined) ?? field.name,
    "aria-describedby": describedBy,
    "aria-invalid": (props["aria-invalid"] as boolean | undefined) ?? (field.invalid || undefined),
    "aria-required": (props["aria-required"] as boolean | undefined) ?? (field.required || undefined),
    required: (props.required as boolean | undefined) ?? (field.required || undefined),
    disabled: (props.disabled as boolean | undefined) ?? (field.disabled || undefined),
  }
}

export interface FormFieldProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Visible label. */
  label?: React.ReactNode
  /** Field name: wires `name` and looks up server errors (R16.3). */
  name?: string
  /** Control id. Generated when omitted. */
  id?: string
  /** Help text under the control. */
  help?: React.ReactNode
  /** Error message(s). Merged with server errors for `name`. */
  error?: string | string[] | null
  required?: boolean
  disabled?: boolean
  /** `stacked` (label above) or `inline` (label beside, R3.31). Defaults to the form or OnuProvider setting. */
  labelLayout?: LabelLayout
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean
  /** Extra content beside the label, e.g. a "Forgot password?" link. */
  labelAside?: React.ReactNode
  classNames?: { label?: string; control?: string; help?: string; error?: string }
  children: React.ReactNode
}

/**
 * Label + control + help text + errors, with stacked or inline label layouts.
 * Inline labels fall back to stacked in narrow containers (R3.33).
 */
export function FormField({
  label,
  name,
  id: idProp,
  help,
  error,
  required = false,
  disabled: disabledProp,
  labelLayout: labelLayoutProp,
  hideLabel,
  labelAside,
  className,
  classNames,
  children,
  ...props
}: FormFieldProps) {
  const generated = React.useId()
  const id = idProp ?? `field-${generated}`
  const layout = useLabelLayout(labelLayoutProp)
  const formDisabled = useFormDisabled()
  const disabled = disabledProp ?? formDisabled
  const serverErrors = useFieldErrors(name)
  const errors = [...toArray(error), ...serverErrors]
  const invalid = errors.length > 0
  const helpId = help ? `${id}-help` : undefined
  const errorId = invalid ? `${id}-error` : undefined

  const ctx = React.useMemo<FormFieldContextValue>(
    () => ({ id, name, labelId: `${id}-label`, helpId, errorId, invalid, required, disabled }),
    [id, name, helpId, errorId, invalid, required, disabled],
  )

  const inline = layout === "inline"

  return (
    <FormFieldContext.Provider value={ctx}>
      <div
        data-slot="form-field"
        data-label-layout={layout}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={cn("@container/form-field w-full", className)}
        {...props}
      >
        <div
          className={cn(
            "gap-2 grid",
            inline && "@md/form-field:grid-cols-[var(--onu-label-width)_minmax(0,1fr)] @md/form-field:gap-x-4",
          )}
        >
          {label ? (
            <div
              className={cn(
                "gap-2 flex items-center justify-between",
                inline && "@md/form-field:min-h-8 @md/form-field:items-start @md/form-field:pt-1.5",
                hideLabel && "sr-only",
              )}
            >
              <Label
                id={ctx.labelId}
                htmlFor={id}
                className={cn(invalid && "text-destructive", disabled && "opacity-50", classNames?.label)}
              >
                {label}
                {required ? <RequiredMarker /> : null}
              </Label>
              {labelAside && !inline ? <div className="text-sm">{labelAside}</div> : null}
            </div>
          ) : null}
          <div
            className={cn("min-w-0 gap-1.5 grid", inline && label && "@md/form-field:col-start-2", classNames?.control)}
          >
            {children}
            {help ? (
              <HelpText id={helpId} className={classNames?.help}>
                {help}
              </HelpText>
            ) : null}
            <FieldErrors id={errorId} errors={errors} className={classNames?.error} />
            {labelAside && inline ? <div className="text-sm">{labelAside}</div> : null}
          </div>
        </div>
      </div>
    </FormFieldContext.Provider>
  )
}
