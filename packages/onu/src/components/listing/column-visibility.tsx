"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"

export interface ColumnVisibilityColumn {
  id: string
  /** Text label (a column's `header`). */
  header: string
  /** `false` keeps the column always visible. Default `true`; `primary` columns can't be hidden. */
  hideable?: boolean
  primary?: boolean
}

export interface ColumnVisibilityProps extends Omit<React.ComponentProps<"button">, "value" | "onChange"> {
  columns: ColumnVisibilityColumn[]
  /** `{ email: false }` hides the email column. Missing ids are visible. */
  value: Record<string, boolean>
  onValueChange: (value: Record<string, boolean>) => void
  /** Show the "Columns" text next to the icon. Default `true` from 640px wide. */
  showLabel?: boolean
  classNames?: { trigger?: string; content?: string; item?: string }
}

/** "Columns" menu with a checkbox per column, to show or hide table columns. */
export function ColumnVisibility({
  columns,
  value,
  onValueChange,
  showLabel = true,
  className,
  classNames,
  ...props
}: ColumnVisibilityProps) {
  const { t } = useTranslation()
  const hideable = columns.filter((c) => c.hideable !== false && !c.primary)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          data-slot="column-visibility"
          aria-label={showLabel ? undefined : t("listing.toggleColumns")}
          className={cn("touch:min-h-11", classNames?.trigger, className)}
          {...props}
        >
          <Icon name="columns" />
          {showLabel ? <span className="sm:inline hidden">{t("listing.columns")}</span> : null}
          {showLabel ? <span className="sm:hidden sr-only">{t("listing.toggleColumns")}</span> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("min-w-48 w-auto", classNames?.content)}>
        <DropdownMenuLabel>{t("listing.toggleColumns")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideable.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={value[column.id] !== false}
            className={cn("touch:min-h-11", classNames?.item)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={(checked) => onValueChange({ ...value, [column.id]: checked === true })}
          >
            {column.header}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
