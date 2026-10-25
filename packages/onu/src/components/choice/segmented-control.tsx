"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useFormField, useFormFieldControl } from "../form/form-field"
import { useControllableState } from "./_hooks"
import { normalizeOptions, type ChoiceOptionInput } from "./options"
import { registerEnglish } from "../../i18n/english"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ listing: en_listing })

export const segmentedControlVariants = cva(
  // Scrolls sideways instead of truncating labels when space runs out; the
  // scrollbar is hidden because a focused or swiped segment scrolls into view.
  "gap-0.5 p-0.5 min-w-0 inline-flex max-w-full [scrollbar-width:none] items-stretch overflow-x-auto rounded-lg bg-layout text-muted-foreground [&::-webkit-scrollbar]:hidden",
  {
    variants: {
      size: {
        sm: "h-7 text-xs",
        default: "h-8 text-sm",
        lg: "h-10 text-sm",
      },
      fullWidth: { true: "flex w-full", false: "" },
    },
    defaultVariants: { size: "default", fullWidth: false },
  },
)

const itemClasses = [
  // Segments size to their label (never truncated) and share any spare room evenly.
  "relative inline-flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 font-normal outline-none transition-[color,background-color,box-shadow]",
  "hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm dark:data-[state=on]:bg-input/50",
  "[&_svg]:size-4 [&_svg]:shrink-0 touch:min-h-11 touch:min-w-11",
]

export interface SegmentedControlProps
  extends
    Omit<
      React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
      "type" | "value" | "defaultValue" | "onValueChange" | "children"
    >,
    Omit<VariantProps<typeof segmentedControlVariants>, "fullWidth"> {
  options: ReadonlyArray<ChoiceOptionInput>
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Stretch to the container width, segments sharing the space. */
  fullWidth?: boolean
  /**
   * Show only the icon of options that have one. The label stays as the
   * segment's accessible name and tooltip.
   */
  iconOnly?: boolean
  classNames?: { item?: string }
}

/**
 * Pick one of a few options shown side by side (shadcn toggle group, single
 * mode). One segment is always selected; arrow keys move between segments in
 * visual order, also in RTL.
 */
export function SegmentedControl({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  size,
  fullWidth = false,
  iconOnly = false,
  className,
  classNames,
  ...props
}: SegmentedControlProps) {
  const items = normalizeOptions(options)
  const [value, setValue] = useControllableState<string>(
    valueProp,
    defaultValue ?? items[0]?.value ?? "",
    onValueChange,
  )
  const control = useFormFieldControl(props as Record<string, unknown>) as Omit<
    React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
    "type" | "value" | "defaultValue" | "onValueChange"
  > & { name?: string; required?: boolean }
  // A segmented control always has a value, so `required` adds nothing.
  const { name, required: _required, "aria-required": _ariaRequired, ...rootProps } = control
  const field = useFormField()
  const labelledBy = rootProps["aria-labelledby"] ?? (field && !rootProps["aria-label"] ? field.labelId : undefined)

  return (
    <>
      <ToggleGroupPrimitive.Root
        data-slot="segmented-control"
        data-size={size ?? "default"}
        {...rootProps}
        aria-labelledby={labelledBy}
        type="single"
        value={value}
        // A segmented control always has a value: ignore attempts to deselect.
        onValueChange={(next: string) => {
          if (next) setValue(next)
        }}
        className={cn(segmentedControlVariants({ size, fullWidth }), className)}
      >
        {items.map((o) => (
          <ToggleGroupPrimitive.Item
            key={o.value}
            value={o.value}
            disabled={o.disabled}
            aria-label={iconOnly && o.icon ? o.label : undefined}
            title={iconOnly && o.icon ? o.label : undefined}
            className={cn(itemClasses, classNames?.item)}
          >
            {o.icon}
            {iconOnly && o.icon ? null : <span>{o.label}</span>}
          </ToggleGroupPrimitive.Item>
        ))}
      </ToggleGroupPrimitive.Root>
      {name ? <input type="hidden" name={name} value={value} /> : null}
    </>
  )
}

export type ListingView = "table" | "list" | "grid" | "kanban" | (string & {})

export interface ViewOption {
  value: ListingView
  label: string
  /** Semantic icon name. */
  icon: string
}

export interface ViewSwitcherProps extends Omit<
  SegmentedControlProps,
  "options" | "value" | "defaultValue" | "onValueChange" | "iconOnly"
> {
  value?: ListingView
  defaultValue?: ListingView
  onValueChange?: (view: ListingView) => void
  /** Which views to offer. Default table, list, grid and kanban. Strings use the built-in labels and icons. */
  views?: (ListingView | ViewOption)[]
  /** Show the labels next to the icons. Default `false` (labels are still the accessible names). */
  showLabels?: boolean
}

const BUILT_IN_VIEWS: Record<string, { icon: string; key: string }> = {
  table: { icon: "table", key: "listing.viewTable" },
  list: { icon: "list", key: "listing.viewList" },
  grid: { icon: "grid", key: "listing.viewGrid" },
  kanban: { icon: "kanban", key: "listing.viewKanban" },
}

/**
 * `SegmentedControl` with `iconOnly` and built-in table, list, grid and board
 * options, named "View": switches a listing between views.
 */
export function ViewSwitcher({
  defaultValue = "table",
  views = ["table", "list", "grid", "kanban"],
  showLabels = false,
  size = "sm",
  className,
  ...props
}: ViewSwitcherProps) {
  const { t } = useTranslation()
  const options = views.map((view) => {
    const known = typeof view === "string" ? BUILT_IN_VIEWS[view] : undefined
    const option: ViewOption =
      typeof view === "string" ? { value: view, label: known ? t(known.key) : view, icon: known?.icon ?? "grid" } : view
    return { value: option.value, label: option.label, icon: <Icon name={option.icon} /> }
  })
  return (
    <SegmentedControl
      data-slot="view-switcher"
      aria-label={t("listing.view")}
      defaultValue={defaultValue}
      size={size}
      className={cn("w-fit", className)}
      {...props}
      options={options}
      iconOnly={!showLabels}
    />
  )
}
