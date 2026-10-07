"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { useCopyToClipboard } from "./_utils"

export type DescriptionListLayout = "auto" | "stacked" | "inline"

const DescriptionListContext = React.createContext<{ layout: DescriptionListLayout; striped: boolean }>({
  layout: "auto",
  striped: false,
})

/** True for values that should show "—": `null`, `undefined`, `""`, empty arrays. */
export function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)
}

export interface DescriptionListItemData {
  /** React key; defaults to the label when it is a string. */
  id?: string
  label: React.ReactNode
  value?: React.ReactNode
  /** Show a copy button. Copies `copyValue`, or the value when it is a string or number. */
  copyable?: boolean
  copyValue?: string
  /** Span both columns in the inline layout (long text). */
  fullWidth?: boolean
}

export interface DescriptionListProps extends React.ComponentProps<"dl"> {
  /** Items to render. You can also compose `DescriptionListItem`s as children. */
  items?: DescriptionListItemData[]
  /**
   * `stacked`: label above value. `inline`: label beside value.
   * `auto` (default): stacked on narrow containers, inline from 28rem wide.
   */
  layout?: DescriptionListLayout
  /** Alternate row backgrounds. */
  striped?: boolean
  /** Lines between items. Default `true`. */
  divided?: boolean
}

/**
 * Label–value pairs for record views ("Email: jane@example.com"). Missing
 * values show "—" (§25.8). Stacks on narrow containers and goes side by side
 * on wider ones; values can be copyable.
 */
export function DescriptionList({
  items,
  layout = "auto",
  striped = false,
  divided = true,
  className,
  children,
  ...props
}: DescriptionListProps) {
  const value = React.useMemo(() => ({ layout, striped }), [layout, striped])
  return (
    <div data-slot="description-list-container" className="@container">
      <dl
        data-slot="description-list"
        data-layout={layout}
        className={cn("text-sm grid", divided && "divide-y", className)}
        {...props}
      >
        <DescriptionListContext.Provider value={value}>
          {items?.map((item, i) => (
            <DescriptionListItem
              key={item.id ?? (typeof item.label === "string" ? item.label : i)}
              label={item.label}
              copyable={item.copyable}
              copyValue={item.copyValue}
              fullWidth={item.fullWidth}
            >
              {item.value}
            </DescriptionListItem>
          ))}
          {children}
        </DescriptionListContext.Provider>
      </dl>
    </div>
  )
}

export interface DescriptionListItemProps extends Omit<React.ComponentProps<"div">, "children"> {
  label: React.ReactNode
  children?: React.ReactNode
  copyable?: boolean
  copyValue?: string
  fullWidth?: boolean
  classNames?: { label?: string; value?: string; copy?: string }
}

function plainText(label: React.ReactNode): string {
  return typeof label === "string" || typeof label === "number" ? String(label) : ""
}

/** One label–value pair inside a `DescriptionList`. */
export function DescriptionListItem({
  label,
  children,
  copyable,
  copyValue,
  fullWidth,
  className,
  classNames,
  ...props
}: DescriptionListItemProps) {
  const { t } = useTranslation()
  const { layout, striped } = React.useContext(DescriptionListContext)
  const { copied, copy } = useCopyToClipboard()
  const empty = isEmptyValue(children)
  const text =
    copyValue ?? (typeof children === "string" || typeof children === "number" ? String(children) : undefined)

  return (
    <div
      data-slot="description-list-item"
      className={cn(
        "gap-x-4 gap-y-1 py-3 grid",
        layout === "inline" && !fullWidth && "grid-cols-[minmax(0,var(--onu-dl-label-width,12rem))_minmax(0,1fr)]",
        layout === "auto" && !fullWidth && "@md:grid-cols-[minmax(0,var(--onu-dl-label-width,12rem))_minmax(0,1fr)]",
        striped && "px-3 even:bg-muted/40",
        className,
      )}
      {...props}
    >
      <dt data-slot="description-list-label" className={cn("font-medium text-muted-foreground", classNames?.label)}>
        {label}
      </dt>
      <dd
        data-slot="description-list-value"
        className={cn("gap-2 min-w-0 flex items-start break-words text-foreground", classNames?.value)}
      >
        {empty ? (
          <span className="text-muted-foreground">
            <span aria-hidden>{t("common.emptyValue")}</span>
            <span className="sr-only">{t("display.notSet")}</span>
          </span>
        ) : (
          <div className="min-w-0 flex-1">{children}</div>
        )}
        {copyable && !empty && text !== undefined ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            data-slot="description-list-copy"
            className={cn("-my-0.5 touch:size-9 shrink-0", classNames?.copy)}
            aria-label={copied ? t("common.copied") : t("display.copyValue", { label: plainText(label) || text })}
            onClick={() => void copy(text)}
          >
            <Icon name={copied ? "check" : "copy"} />
          </Button>
        ) : null}
        {copyable ? (
          <span aria-live="polite" className="sr-only">
            {copied ? t("common.copied") : ""}
          </span>
        ) : null}
      </dd>
    </div>
  )
}
