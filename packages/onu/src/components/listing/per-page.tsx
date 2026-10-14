"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { DEFAULT_PER_PAGE_OPTIONS } from "./use-listing-state"
import { registerEnglish } from "../../i18n/english"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ listing: en_listing })

export interface PerPageProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  value: number
  /** Called with the new page size. Listings go back to page 1 (§25.6). */
  onValueChange: (perPage: number) => void
  /** Default `[10, 25, 50, 100]`. */
  options?: number[]
  /** Visible label. Defaults to "Rows per page". Pass `null` to hide it (it stays as the accessible name). */
  label?: React.ReactNode
  disabled?: boolean
  size?: "sm" | "default"
  classNames?: { root?: string; label?: string; trigger?: string; content?: string }
}

/** Rows-per-page select. */
export function PerPage({
  value,
  onValueChange,
  options = DEFAULT_PER_PAGE_OPTIONS,
  label,
  disabled,
  size = "default",
  className,
  classNames,
  ...props
}: PerPageProps) {
  const { t, locale } = useTranslation()
  const id = React.useId()
  const format = new Intl.NumberFormat(locale.numberLocale)
  const all = options.includes(value) ? options : [...options, value].sort((a, b) => a - b)
  const text = t("listing.rowsPerPage")

  return (
    <div data-slot="per-page" className={cn("gap-2 flex items-center", classNames?.root, className)} {...props}>
      <span
        id={id}
        className={cn(
          "text-sm whitespace-nowrap text-muted-foreground",
          label === null && "sr-only",
          classNames?.label,
        )}
      >
        {label ?? text}
      </span>
      <Select value={String(value)} onValueChange={(v) => onValueChange(Number(v))} disabled={disabled}>
        <SelectTrigger
          size={size}
          aria-labelledby={id}
          className={cn("min-w-16 touch:min-h-11 tabular-nums", classNames?.trigger)}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={classNames?.content}>
          {all.map((option) => (
            <SelectItem key={option} value={String(option)} className="touch:min-h-11 tabular-nums">
              {format.format(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
