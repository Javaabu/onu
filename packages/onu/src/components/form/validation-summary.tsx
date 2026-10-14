"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import type { FormErrors } from "./form-context"
import { errorEntries, findField, focusField, isValidationPayload, type ValidationPayload } from "./validation"
import { registerEnglish } from "../../i18n/english"
import { form as en_form } from "../../locales/en/form"

registerEnglish({ form: en_form })

export interface ValidationSummaryProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Errors keyed by field name, or a whole Laravel 422 body (`{ message, errors }`). */
  errors?: FormErrors | ValidationPayload | null
  /** A general message, shown when there are no field errors (e.g. "The form could not be submitted."). */
  message?: React.ReactNode
  /** Heading. Defaults to "There are N problems with this form". */
  title?: React.ReactNode
  /** Where to look for the fields the links point at. Defaults to the closest `<form>`, then the document. */
  root?: React.RefObject<HTMLElement | null>
  /** Move focus to the summary when it appears. Default `false` (`Form` focuses the first invalid field). */
  focusOnShow?: boolean
  /** Field labels by name, shown before each message: `{ email: "Email" }`. */
  labels?: Record<string, React.ReactNode>
  classNames?: { title?: string; list?: string; item?: string; link?: string; message?: string }
}

/**
 * An error summary for the top of a form (AJAX validation errors, R16.3):
 * lists every error, and each one links to (and focuses) its field.
 * Accepts Laravel's 422 payload as is.
 */
export function ValidationSummary({
  errors,
  message,
  title,
  root,
  focusOnShow = false,
  labels,
  className,
  classNames,
  ref,
  ...props
}: ValidationSummaryProps) {
  const { t } = useTranslation()
  const local = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()
  const payload = isValidationPayload(errors) ? errors : null
  const entries = errorEntries(payload ? payload.errors : (errors as FormErrors | null | undefined))
  const count = entries.reduce((sum, [, messages]) => sum + messages.length, 0)
  const general = message ?? payload?.message
  const visible = count > 0 || !!general
  // Laravel's own `message` repeats the first error, so with a list we show a hint instead.
  const description = count > 0 ? (message ?? t("form.errorSummaryHint")) : title ? general : null

  React.useEffect(() => {
    if (focusOnShow && visible) local.current?.focus()
  }, [focusOnShow, visible])

  if (!visible) return null

  const scope = () => root?.current ?? local.current?.closest("form") ?? document

  function go(event: React.MouseEvent<HTMLAnchorElement>, name: string) {
    const field = findField(scope(), name)
    if (!field) return
    event.preventDefault()
    focusField(field)
  }

  return (
    <div
      ref={(node) => {
        local.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      data-slot="validation-summary"
      role="alert"
      tabIndex={-1}
      aria-labelledby={titleId}
      className={cn(
        "gap-2 p-3 text-sm grid rounded-lg border border-destructive/40 bg-destructive/5 text-foreground outline-none focus-visible:ring-3 focus-visible:ring-destructive/30",
        className,
      )}
      {...props}
    >
      <p id={titleId} className={cn("gap-2 font-medium flex items-start text-destructive", classNames?.title)}>
        <Icon name="error" className="mt-0.5 size-4 shrink-0" />
        <span>{title ?? (count > 0 ? t("form.errorSummaryTitle", { count }) : general)}</span>
      </p>
      {count > 0 ? (
        <ul className={cn("ps-6 gap-1 grid list-disc marker:text-destructive", classNames?.list)}>
          {entries.flatMap(([name, messages]) =>
            messages.map((text, i) => (
              <li key={`${name}-${i}`} className={classNames?.item}>
                <a
                  href={`#${name}`}
                  data-field={name}
                  onClick={(event) => go(event, name)}
                  className={cn(
                    "rounded-sm text-destructive underline underline-offset-4 outline-none hover:no-underline focus-visible:ring-3 focus-visible:ring-ring/50",
                    classNames?.link,
                  )}
                >
                  {labels?.[name] ? <span className="font-medium">{labels[name]}: </span> : null}
                  {text}
                </a>
              </li>
            )),
          )}
        </ul>
      ) : null}
      {description ? <p className={cn("ps-6 text-muted-foreground", classNames?.message)}>{description}</p> : null}
    </div>
  )
}

/** Alias matching the build-list name (R22, "AJAX validation errors"). */
export const AjaxValidationErrors = ValidationSummary
