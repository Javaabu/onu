"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { useIsMobile } from "../../hooks/use-mobile"
import { Icon } from "../../icons/icon"
import type { SemanticIconName } from "../../icons/types"
import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { useFormField, useFormFieldControl } from "../form/form-field"
import { useControllableState } from "./_use-controllable-state"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"

registerEnglish({ common: en_common })

const DetachedContext = React.createContext(false)

/** Pickers inside ignore the surrounding `FormField` (used by composite pickers such as the date range). */
export function DetachFromFormField({ children }: { children: React.ReactNode }) {
  return <DetachedContext.Provider value={true}>{children}</DetachedContext.Provider>
}

/** Styles of the field that opens a picker. It looks like a text input. */
export const pickerTriggerVariants = cva(
  [
    "gap-2 text-base md:text-sm rounded-lg border border-input bg-card text-start transition-colors hover:border-primary-5",
    "min-w-0 touch:min-h-11 flex w-full items-center outline-none",
    "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    "disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:disabled:bg-input/80",
    "data-[state=open]:border-primary",
  ],
  {
    variants: {
      size: {
        sm: "h-7 px-2 text-sm",
        default: "h-8 px-2.5",
        lg: "h-10 px-3",
      },
    },
    defaultVariants: { size: "default" },
  },
)

/** Props shared by every picker field (date, time, month, week, …). */
export interface PickerFieldProps extends VariantProps<typeof pickerTriggerVariants> {
  id?: string
  /** Renders hidden input(s) with ISO values for plain HTML / Laravel forms. */
  name?: string
  placeholder?: string
  disabled?: boolean
  /** Required fields hide the Clear button (§25.1). */
  required?: boolean
  /** Show Clear. Defaults to `!required`. */
  clearable?: boolean
  /** Panel open state (controlled). */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** `auto` (default) opens a bottom sheet on phones and a popover elsewhere (R3.28). */
  sheet?: "auto" | boolean
  /** Pins "today" (tests, demos, or server time). */
  today?: Date
  className?: string
  classNames?: { trigger?: string; content?: string; footer?: string; value?: string; icon?: string }
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean | "true" | "false"
  "aria-required"?: boolean | "true" | "false"
  /** Ref to the trigger button. */
  ref?: React.Ref<HTMLButtonElement>
}

interface PickerShellProps extends PickerFieldProps {
  /** Formatted value, or `null` for the placeholder. */
  display: React.ReactNode | null
  /** Text read out when the value changes. */
  announcement?: string
  icon?: SemanticIconName
  /** Name of the panel (dialog). */
  panelLabel: string
  /** Hidden form inputs for a field name. */
  hidden?: (name: string) => React.ReactNode
  onClear?: () => void
  /** Extra footer content at the start. */
  footerStart?: React.ReactNode
  hideFooter?: boolean
  dataSlot: string
  /** The panel. A function gets a `close` callback. */
  children: React.ReactNode | ((api: { close: () => void; sheet: boolean }) => React.ReactNode)
}

/**
 * The field + popover (or bottom sheet on phones) every picker uses: trigger,
 * hidden inputs, footer with Clear/Done, focus return and value announcements.
 */
export function PickerShell(props: PickerShellProps) {
  const {
    display,
    announcement,
    icon = "calendar",
    panelLabel,
    hidden,
    onClear,
    footerStart,
    hideFooter,
    dataSlot,
    children,
    placeholder,
    clearable,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    sheet = "auto",
    size,
    className,
    classNames,
    ref,
    today: _today,
    ...rest
  } = props
  const { t, dir } = useOnu()
  const detached = React.useContext(DetachedContext)
  const formField = useFormField()
  const field = detached ? null : formField
  const wired = useFormFieldControl(rest as Record<string, unknown>)
  const control = (detached ? rest : wired) as {
    id?: string
    name?: string
    disabled?: boolean
    required?: boolean
    "aria-label"?: string
    "aria-labelledby"?: string
    "aria-describedby"?: string
    "aria-invalid"?: boolean | "true" | "false"
    "aria-required"?: boolean | "true" | "false"
  }
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange)
  const isMobile = useIsMobile()
  const useSheet = sheet === true || (sheet === "auto" && isMobile)
  const showClear = clearable ?? !control.required

  const uid = React.useId()
  const valueId = `${uid}-value`
  const ownLabelId = `${uid}-label`
  const panelId = `${uid}-panel`
  let labelledBy = control["aria-labelledby"]
  if (!labelledBy && control["aria-label"]) labelledBy = `${ownLabelId} ${valueId}`
  else if (!labelledBy && field) labelledBy = `${field.labelId} ${valueId}`

  const close = () => setOpen(false)
  const content = typeof children === "function" ? children({ close, sheet: useSheet }) : children

  const trigger = (
    <button
      ref={ref}
      type="button"
      // A combobox that opens a dialog (like shadcn's select trigger), so it can carry
      // aria-invalid / aria-required and expose its value (R14.7).
      role="combobox"
      id={control.id}
      disabled={control.disabled}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={panelId}
      aria-labelledby={labelledBy}
      aria-describedby={control["aria-describedby"]}
      aria-invalid={control["aria-invalid"]}
      aria-required={control["aria-required"] ?? control.required}
      data-slot={dataSlot}
      data-state={open ? "open" : "closed"}
      data-empty={display === null || undefined}
      className={cn(pickerTriggerVariants({ size }), classNames?.trigger, className)}
    >
      <span
        id={valueId}
        data-slot="picker-value"
        className={cn("min-w-0 flex-1 truncate", display === null && "text-muted-foreground", classNames?.value)}
      >
        {display ?? placeholder}
      </span>
      <Icon name={icon} className={cn("size-4 shrink-0 text-muted-foreground", classNames?.icon)} />
    </button>
  )

  const footer = hideFooter ? null : (
    <div
      data-slot="picker-footer"
      className={cn("gap-2 p-2 flex items-center justify-end border-t", useSheet && "p-4", classNames?.footer)}
    >
      {footerStart}
      {showClear && onClear ? (
        <Button
          type="button"
          variant="ghost"
          size={useSheet ? "lg" : "sm"}
          className="me-auto"
          onClick={() => {
            onClear()
            close()
          }}
        >
          {t("common.clear")}
        </Button>
      ) : null}
      <Button type="button" size={useSheet ? "lg" : "sm"} onClick={close}>
        {t("common.done")}
      </Button>
    </div>
  )

  const extras = (
    <>
      {control["aria-label"] && !control["aria-labelledby"] ? (
        <span id={ownLabelId} hidden>
          {control["aria-label"]}
        </span>
      ) : null}
      {control.name && hidden ? hidden(control.name) : null}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </>
  )

  if (useSheet) {
    return (
      <>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
          <DrawerContent
            id={panelId}
            dir={dir}
            aria-label={panelLabel}
            className={cn("[--cell-size:--spacing(11)]", classNames?.content)}
          >
            <DrawerHeader className="pb-0">
              <DrawerTitle>{panelLabel}</DrawerTitle>
              <DrawerDescription className="sr-only">{placeholder ?? panelLabel}</DrawerDescription>
            </DrawerHeader>
            <div data-slot="picker-panel" className="px-2 flex justify-center overflow-y-auto">
              {content}
            </div>
            {footer}
            <div className="pb-[env(safe-area-inset-bottom)]" />
          </DrawerContent>
        </Drawer>
        {extras}
      </>
    )
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          id={panelId}
          dir={dir}
          align="start"
          aria-label={panelLabel}
          data-slot="picker-content"
          className={cn("gap-0 p-0 w-auto max-w-[calc(100vw-2rem)]", classNames?.content)}
        >
          <div data-slot="picker-panel">{content}</div>
          {footer}
        </PopoverContent>
      </Popover>
      {extras}
    </>
  )
}

/** Hidden `<input>` for plain form posts. */
export function HiddenInput({ name, value }: { name: string; value: string }) {
  return <input type="hidden" name={name} value={value} data-slot="picker-hidden-input" />
}
