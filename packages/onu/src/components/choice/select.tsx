"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import {
  Select as SelectRoot,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { useFormFieldControl } from "../form/form-field"
import { useMergedRef } from "../inputs/text-input"
import { useControllableState } from "./_hooks"
import { groupOptions, normalizeOptions, type ChoiceOptionInput } from "./options"

type RootProps = React.ComponentProps<typeof SelectPrimitive.Root>
type TriggerProps = Omit<React.ComponentProps<"button">, "value" | "defaultValue" | "dir" | "children" | "ref">

export interface SelectProps extends Omit<RootProps, "children">, Omit<TriggerProps, keyof RootProps> {
  /** Options as an array. Alternatively pass `SelectItem` / `SelectGroup` children. */
  options?: ReadonlyArray<ChoiceOptionInput>
  /** Text shown when nothing is selected. */
  placeholder?: string
  /** Show a clear button when a value is set. Hidden on required fields. */
  clearable?: boolean
  size?: "sm" | "default" | "lg"
  /** Where the list opens: over the trigger (`item-aligned`, default) or below it (`popper`). */
  position?: "item-aligned" | "popper"
  /** Ref to the trigger button. */
  ref?: React.Ref<HTMLButtonElement>
  /** Classes for the trigger (the visible field). */
  className?: string
  classNames?: { root?: string; trigger?: string; content?: string; item?: string; clear?: string }
  children?: React.ReactNode
}

const PRIMITIVE_PARTS = new Set<unknown>([
  SelectTrigger,
  SelectContent,
  SelectPrimitive.Trigger,
  SelectPrimitive.Content,
])

/** True when children are a full shadcn composition (trigger + content). */
function isComposed(children: React.ReactNode): boolean {
  let found = false
  React.Children.forEach(children, (child) => {
    if (found || !React.isValidElement(child)) return
    if (PRIMITIVE_PARTS.has(child.type)) found = true
    else if (child.type === React.Fragment) found = isComposed((child.props as { children?: React.ReactNode }).children)
  })
  return found
}

/**
 * A select for short lists (shadcn/Radix select). Pass `options`, or
 * `SelectItem` children; it also accepts the full shadcn composition
 * (`SelectTrigger` + `SelectContent`) unchanged. Optional fields can be cleared.
 */
export function Select({
  options,
  placeholder,
  clearable = false,
  size = "default",
  position = "item-aligned",
  value: valueProp,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  dir,
  name,
  autoComplete,
  disabled: disabledProp,
  required: requiredProp,
  form,
  className,
  classNames,
  children,
  ref,
  ...triggerRest
}: SelectProps) {
  const { t } = useTranslation()
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const mergedRef = useMergedRef(triggerRef, ref)
  const [value, setValue] = useControllableState<string>(valueProp, defaultValue ?? "", onValueChange)
  const control = useFormFieldControl({
    ...triggerRest,
    name,
    disabled: disabledProp,
    required: requiredProp,
  } as Record<string, unknown>) as TriggerProps & { name?: string; disabled?: boolean; required?: boolean }
  const { name: fieldName, disabled, required, ...triggerProps } = control

  const rootProps = {
    value,
    onValueChange: setValue,
    open,
    defaultOpen,
    onOpenChange,
    dir,
    name: fieldName,
    autoComplete,
    disabled,
    required,
    form,
  }

  if (isComposed(children)) {
    return <SelectRoot {...rootProps}>{children}</SelectRoot>
  }

  const items = normalizeOptions(options)
  const showClear = clearable && !required && !disabled && value !== ""

  return (
    <SelectRoot {...rootProps}>
      <div data-slot="select-field" className={cn("min-w-0 relative w-full", classNames?.root)}>
        <SelectTrigger
          ref={mergedRef}
          size={size === "sm" ? "sm" : "default"}
          data-size={size}
          aria-required={required || undefined}
          {...triggerProps}
          className={cn(
            "touch:min-h-11 data-[size=lg]:h-10 data-[size=lg]:text-base w-full",
            showClear && "*:data-[slot=select-value]:pe-7",
            classNames?.trigger,
            className,
          )}
        >
          <SelectValue placeholder={placeholder ?? t("choice.placeholder")} />
        </SelectTrigger>
        {showClear ? (
          <button
            type="button"
            data-slot="select-clear"
            aria-label={t("choice.clearSelection")}
            onClick={() => {
              setValue("")
              triggerRef.current?.focus()
            }}
            className={cn(
              "end-7 size-6 absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
              classNames?.clear,
            )}
          >
            <Icon name="close" className="size-3.5" />
          </button>
        ) : null}
      </div>
      <SelectContent position={position} className={classNames?.content}>
        {children}
        {groupOptions(items).map((group, gi) => {
          const rendered = group.options.map((o) => (
            <SelectItem
              key={o.value}
              value={o.value}
              disabled={o.disabled}
              className={cn("touch:min-h-11", classNames?.item)}
            >
              {o.icon ? <span className="flex shrink-0 items-center">{o.icon}</span> : null}
              {o.label}
            </SelectItem>
          ))
          return group.group ? (
            <SelectGroup key={group.group}>
              <SelectLabel>{group.group}</SelectLabel>
              {rendered}
            </SelectGroup>
          ) : (
            <React.Fragment key={`__${gi}`}>{rendered}</React.Fragment>
          )
        })}
      </SelectContent>
    </SelectRoot>
  )
}
