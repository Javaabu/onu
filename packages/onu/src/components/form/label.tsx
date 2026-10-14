"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Label as BaseLabel } from "../../ui/label"
import { RequiredMarker } from "./required-marker"
import { registerEnglish } from "../../i18n/english"
import { form as en_form } from "../../locales/en/form"

registerEnglish({ form: en_form })

export interface LabelProps extends React.ComponentProps<typeof BaseLabel> {
  /** Add the required marker (`*`, hidden from screen readers). */
  required?: boolean
  /** Add a muted "(optional)" note instead, for forms where most fields are required. */
  optional?: boolean
  /** Style as invalid (destructive colour). */
  invalid?: boolean
}

/** shadcn's `Label` with required / optional markers. Use `FormField` for a complete field. */
export function Label({ required, optional, invalid, className, children, ...props }: LabelProps) {
  const { t } = useTranslation()
  return (
    <BaseLabel
      data-invalid={invalid || undefined}
      className={cn("gap-1 data-invalid:text-destructive", className)}
      {...props}
    >
      {children}
      {required ? <RequiredMarker /> : null}
      {!required && optional ? (
        <span data-slot="label-optional" className="font-normal text-muted-foreground">
          {t("form.optional")}
        </span>
      ) : null}
    </BaseLabel>
  )
}
