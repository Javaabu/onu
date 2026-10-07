"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useFormField } from "../form/form-field"
import { RadioGroup, type RadioGroupProps } from "./radio-group"
import { Radio } from "./radio"

/** The built-in BML gateways (R16.8). */
export type BmlPaymentMethodId = "bml-transfer" | "bml-connect"
/** A BML gateway or a project-defined method such as `"cash"` (give it a `label`). */
export type PaymentMethodId = BmlPaymentMethodId | (string & {})

/** Text in one string, or per locale code: `{ en: "Bank transfer", dv: "ބޭންކް ޓްރާންސްފަރ" }`. */
export type LocalizedText = string | Partial<Record<string, string>>

export interface PaymentMethodConfig {
  id: PaymentMethodId
  label?: LocalizedText
  description?: LocalizedText
  /**
   * The gateway's logo. Use the asset supplied by BML under its branding
   * guidelines (R16.8); Onu ships only a neutral placeholder.
   */
  logo?: React.ReactNode
  /** Semantic icon for the placeholder logo of a custom method. Default `"credit-card"`. */
  icon?: string
  /** Content at the end of the card, e.g. a fee. */
  aside?: React.ReactNode
  disabled?: boolean
}

export interface PaymentMethodSelectorProps extends Omit<
  RadioGroupProps,
  "options" | "variant" | "children" | "value" | "defaultValue" | "onValueChange"
> {
  /** Which gateways to offer, in order. Default: both. */
  methods?: ReadonlyArray<PaymentMethodId | PaymentMethodConfig>
  value?: PaymentMethodId
  defaultValue?: PaymentMethodId
  onValueChange?: (value: PaymentMethodId) => void
}

const PLACEHOLDER_ICONS: Record<BmlPaymentMethodId, string> = {
  "bml-transfer": "bank",
  "bml-connect": "credit-card",
}

const DEFAULT_TEXT: Partial<Record<string, { label: string; description: string }>> = {
  "bml-transfer": { label: "choice.bmlTransfer", description: "choice.bmlTransferDescription" },
  "bml-connect": { label: "choice.bmlConnect", description: "choice.bmlConnectDescription" },
}

/** A neutral placeholder shown until the project supplies the gateway's real logo. */
function LogoPlaceholder({ id, icon }: { id: PaymentMethodId; icon?: string }) {
  return (
    <span
      data-slot="payment-logo-placeholder"
      className="size-10 group-data-[size=lg]/radio-card:size-12 flex items-center justify-center rounded-md border border-border bg-muted text-muted-foreground"
    >
      <Icon name={icon ?? PLACEHOLDER_ICONS[id as BmlPaymentMethodId] ?? "credit-card"} className="size-5" />
    </span>
  )
}

/**
 * Choose how to pay: BML Transfer and/or BML Connect (plus any project-defined
 * methods such as cash, with their own `label`) as a radio group of large
 * cards (R16.8). Selection only; redirects and callbacks belong to the app.
 * Labels and descriptions can be replaced per locale, and each method takes
 * the gateway's own `logo`.
 */
export function PaymentMethodSelector({
  methods = ["bml-transfer", "bml-connect"],
  value,
  defaultValue,
  onValueChange,
  size = "lg",
  className,
  ...props
}: PaymentMethodSelectorProps) {
  const { t, locale } = useTranslation()
  const field = useFormField()
  const localize = (text: LocalizedText | undefined, fallback: string) => {
    if (text === undefined) return fallback
    if (typeof text === "string") return text
    return text[locale.code] ?? text.en ?? Object.values(text).find(Boolean) ?? fallback
  }
  const items = methods.map((m) => (typeof m === "string" ? { id: m } : m)) as PaymentMethodConfig[]
  const named = props["aria-label"] || props["aria-labelledby"] || field

  return (
    <RadioGroup
      data-slot="payment-method-selector"
      variant="card"
      size={size}
      aria-label={named ? props["aria-label"] : t("choice.paymentMethod")}
      {...props}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange as ((value: string) => void) | undefined}
      className={cn("gap-3", className)}
    >
      {items.map((m) => (
        <Radio
          key={m.id}
          value={m.id}
          data-method={m.id}
          label={localize(m.label, DEFAULT_TEXT[m.id] ? t(DEFAULT_TEXT[m.id]!.label) : m.id)}
          description={localize(m.description, DEFAULT_TEXT[m.id] ? t(DEFAULT_TEXT[m.id]!.description) : "")}
          media={m.logo ?? <LogoPlaceholder id={m.id} icon={m.icon} />}
          aside={m.aside}
          disabled={m.disabled}
          className="touch:min-h-20 items-center"
        />
      ))}
    </RadioGroup>
  )
}
