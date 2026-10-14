"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { Spinner } from "../../ui/spinner"
import { registerEnglish } from "../../i18n/english"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ listing: en_listing })

export type ExportFormat = "csv" | "excel" | "pdf" | (string & {})

export interface ExportOption {
  format: ExportFormat
  /** Defaults to the built-in label for csv / excel / pdf. */
  label?: string
  /** Semantic icon name. */
  icon?: string
  description?: string
  disabled?: boolean
}

export interface ExportMenuProps extends Omit<React.ComponentProps<"button">, "onClick"> {
  /** Called with the chosen format. Return a promise to show a spinner until the file is ready. */
  onExport: (format: ExportFormat) => void | Promise<unknown>
  /** Formats on offer. Default CSV, Excel and PDF. */
  options?: (ExportFormat | ExportOption)[]
  /** Text shown above the options, e.g. "312 users, current filters". */
  scopeLabel?: React.ReactNode
  classNames?: { trigger?: string; content?: string; item?: string }
}

const LABEL_KEYS: Record<string, string> = {
  csv: "listing.exportCsv",
  excel: "listing.exportExcel",
  pdf: "listing.exportPdf",
}

/**
 * Export button with a menu of formats (CSV, Excel, PDF). The menu does not build
 * the file: `onExport` does, either by calling the server with the current filters
 * or in the browser with `exportRows` from `@javaabu/onu/export`:
 * `onExport={(format) => exportRows({ format, rows, columns, filename: "users" })}`.
 */
export function ExportMenu({
  onExport,
  options = ["csv", "excel", "pdf"],
  scopeLabel,
  className,
  classNames,
  disabled,
  ...props
}: ExportMenuProps) {
  const { t } = useTranslation()
  const [busy, setBusy] = React.useState<ExportFormat | null>(null)
  const [status, setStatus] = React.useState("")

  const items: ExportOption[] = options.map((o) => (typeof o === "string" ? { format: o } : o))
  const labelOf = (o: ExportOption) => o.label ?? (LABEL_KEYS[o.format] ? t(LABEL_KEYS[o.format] as string) : o.format)

  const run = async (option: ExportOption) => {
    setBusy(option.format)
    setStatus(t("listing.exporting"))
    try {
      await onExport(option.format)
      setStatus(t("listing.exported"))
    } catch {
      setStatus(t("listing.bulkFailed"))
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            data-slot="export-menu"
            disabled={disabled || busy !== null}
            aria-busy={busy !== null || undefined}
            className={cn("touch:min-h-11", classNames?.trigger, className)}
            {...props}
          >
            {busy ? <Spinner /> : <Icon name="download" />}
            {busy ? t("listing.exporting") : t("listing.export")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn("min-w-48 w-auto", classNames?.content)}>
          {scopeLabel ? (
            <>
              <DropdownMenuLabel className="font-normal text-muted-foreground">{scopeLabel}</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {items.map((option) => (
            <DropdownMenuItem
              key={option.format}
              disabled={option.disabled}
              className={cn("touch:min-h-11", classNames?.item)}
              onSelect={() => void run(option)}
            >
              <Icon name={option.icon ?? "file"} />
              <span className="grid">
                <span>{labelOf(option)}</span>
                {option.description ? (
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                ) : null}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
    </>
  )
}
