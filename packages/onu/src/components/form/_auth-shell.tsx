"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useLinkComponent } from "../../providers/onu-provider"
import { Checkbox } from "../../ui/checkbox"
import { Card, type CardProps } from "../layout/card"
import { FieldErrors } from "./field-errors"
import { Form, type FormValues } from "./form"
import { useFieldErrors, useFormDisabled, type FormErrors } from "./form-context"
import { Label } from "./label"
import { SubmitButton } from "./submit-button"

/**
 * What an auth form submits: its built-in fields, typed, plus any other named
 * fields (from `extraFields`) as `FormData` values (`string`, `File` or arrays).
 */
export type AuthFormValues<V> = V & Record<string, unknown>

export interface AuthFormProps<V> extends Omit<
  CardProps,
  "onSubmit" | "children" | "title" | "onError" | "href" | "external" | "asChild" | "classNames"
> {
  /**
   * Called with the typed values, plus every other named field in the form
   * (e.g. from `extraFields`) as submitted. May return a promise; throw a
   * Laravel 422 body to show errors.
   */
  onSubmit?: (values: AuthFormValues<V>) => unknown
  /** Server errors by field name (Laravel / Inertia `errors`). */
  errors?: FormErrors | null
  /** Show the submitting state (e.g. Inertia's `processing`). */
  processing?: boolean
  title?: React.ReactNode
  /** A status message above the form, e.g. "We have emailed your password reset link." */
  status?: React.ReactNode
  /** Logo or illustration above the title. */
  logo?: React.ReactNode
  defaultValues?: Partial<V>
  /** Submit button label. */
  submitLabel?: React.ReactNode
  /** Extra fields rendered before the submit button. */
  extraFields?: React.ReactNode
  /** Native form props (`action`, `method`, …) for non-JS submission. */
  formProps?: Omit<React.ComponentProps<"form">, "onSubmit" | "onError" | "children">
  /** The `Card` slots, plus the form's own parts. `sso` is on `SignInForm` only. */
  classNames?: CardProps["classNames"] & {
    root?: string
    form?: string
    status?: string
    submit?: string
    sso?: string
  }
}

export function str(values: FormValues, key: string) {
  const v = values[key]
  return typeof v === "string" ? v : ""
}

export function AuthLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  const LinkComponent = useLinkComponent()
  // createElement: the link component comes from context (Inertia/Next Link), not created here.
  return React.createElement(
    LinkComponent,
    {
      href,
      className: cn(
        "font-medium rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      ),
    },
    children,
  )
}

export function CheckboxRow({
  name,
  label,
  defaultChecked,
  required,
  aside,
}: {
  name: string
  label: React.ReactNode
  defaultChecked?: boolean
  required?: boolean
  aside?: React.ReactNode
}) {
  const id = React.useId()
  const errors = useFieldErrors(name)
  const disabled = useFormDisabled()
  const errorId = errors.length ? `${id}-error` : undefined
  return (
    <div className="gap-1.5 grid">
      <div className="gap-x-2 gap-y-1 flex flex-wrap items-center">
        <Checkbox
          id={id}
          name={name}
          value="1"
          defaultChecked={defaultChecked}
          required={required}
          disabled={disabled}
          aria-invalid={errors.length ? true : undefined}
          aria-describedby={errorId}
          className="touch:size-5"
        />
        <Label htmlFor={id} required={required} className="font-normal leading-snug">
          {label}
        </Label>
        {aside}
      </div>
      <FieldErrors id={errorId} errors={errors} />
    </div>
  )
}

export function AuthShell<V>({
  title,
  description,
  status,
  logo,
  errors,
  processing,
  onSubmit,
  toValues,
  formProps,
  children,
  submit,
  after,
  className,
  classNames,
  defaultValues: _defaultValues,
  submitLabel: _submitLabel,
  extraFields: _extraFields,
  ...props
}: AuthFormProps<V> & {
  description: React.ReactNode
  toValues: (values: FormValues) => V
  children: React.ReactNode
  submit: React.ReactNode
  after?: React.ReactNode
}) {
  const titleId = React.useId()
  return (
    <Card
      asChild
      title={<span id={titleId}>{title}</span>}
      description={description}
      media={logo}
      width="sm"
      centered
      headingLevel={2}
      className={cn("@container/auth", classNames?.root, className)}
      classNames={classNames}
      {...props}
    >
      {/* The card is a region named by its title. */}
      <section aria-labelledby={titleId}>
        <Form
          errors={errors}
          processing={processing}
          onSubmit={onSubmit ? (values: FormValues) => onSubmit({ ...values, ...toValues(values) }) : undefined}
          // asChild leaves the content unpadded: pad the form like CardContent.
          className={cn("gap-5 px-(--card-spacing)", classNames?.form)}
          {...formProps}
        >
          {status ? (
            <p
              role="status"
              className={cn(
                "gap-2 p-3 text-sm flex items-start rounded-lg border border-success/30 bg-success/10 text-foreground",
                classNames?.status,
              )}
            >
              <Icon name="success" className="mt-0.5 size-4 shrink-0 text-success" />
              <span>{status}</span>
            </p>
          ) : null}
          {children}
          <SubmitButton size="lg" className={cn("touch:min-h-11 w-full", classNames?.submit)}>
            {submit}
          </SubmitButton>
          {after}
        </Form>
      </section>
    </Card>
  )
}
