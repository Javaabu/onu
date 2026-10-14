"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Command as CommandPrimitive } from "cmdk"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useThaanaField, type ThaanaProp } from "../../thaana/use-thaana-field"
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"
import { Command, CommandGroup, CommandItem, CommandList, CommandSeparator } from "../../ui/command"
import { useMergedRef } from "../inputs/text-input"
import { Picker, PickerAnchor, PickerContent, PickerTrigger } from "./_picker"
import { groupOptions, type ChoiceOption } from "./options"
import { registerEnglish } from "../../i18n/english"
import { choice as en_choice } from "../../locales/en/choice"
import { common as en_common } from "../../locales/en/common"

registerEnglish({ choice: en_choice, common: en_common })

/** The bordered box around a select-like trigger (exported for custom pickers). */
export const choiceFieldVariants = cva(
  [
    "group/choice-field min-w-0 gap-1 text-sm relative flex w-full flex-wrap items-center rounded-lg border border-input bg-card transition-colors hover:border-primary-5",
    "has-[[data-slot=choice-trigger]:focus-visible]:border-primary has-[[data-slot=choice-trigger]:focus-visible]:ring-2 has-[[data-slot=choice-trigger]:focus-visible]:ring-primary/20",
    "has-[[data-slot=choice-trigger][aria-invalid=true]]:border-destructive has-[[data-slot=choice-trigger][aria-invalid=true]]:ring-3 has-[[data-slot=choice-trigger][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot=choice-trigger][aria-invalid=true]]:ring-destructive/40",
    "touch:min-h-11 data-disabled:cursor-not-allowed data-disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "min-h-7 py-0.5 ps-2 pe-1.5",
        default: "min-h-8 py-0.5 ps-2.5 pe-2",
        lg: "min-h-10 py-1 ps-3 pe-2.5 text-base",
      },
    },
    defaultVariants: { size: "default" },
  },
)

export type ChoiceSize = NonNullable<VariantProps<typeof choiceFieldVariants>["size"]>

export interface ComboboxClassNames {
  /** The bordered field. */
  root?: string
  trigger?: string
  value?: string
  placeholder?: string
  chip?: string
  clear?: string
  /** The popover or sheet. */
  content?: string
  search?: string
  list?: string
  item?: string
  /** Loading, empty and error messages. */
  status?: string
}

export interface ComboboxPresentationProps {
  placeholder?: string
  searchPlaceholder?: string
  /** Type Thaana in the search field (R13.3). */
  thaana?: ThaanaProp
  /** Show a clear button when a value is set. Hidden on required fields. */
  clearable?: boolean
  size?: ChoiceSize
  disabled?: boolean
  /** Name for the hidden form input(s). Multi-selects submit `name[]`. */
  name?: string
  /** Text when no option matches. */
  emptyText?: string
  /** Custom option rendering in the list. */
  renderOption?: (option: ChoiceOption, state: { selected: boolean }) => React.ReactNode
  /** Custom rendering of the selected value(s) in the trigger. */
  renderValue?: (selected: ChoiceOption[]) => React.ReactNode
  /** Open as a bottom sheet on phones (R3.28). Default `true`. */
  sheet?: boolean
  /** Controlled open state. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  classNames?: ComboboxClassNames
}

export interface ComboboxCoreProps extends ComboboxPresentationProps {
  ref?: React.Ref<HTMLButtonElement>
  multiple: boolean
  selected: ChoiceOption[]
  /** Visible (already filtered) options. */
  options: ChoiceOption[]
  onToggle: (option: ChoiceOption) => void
  onClear: () => void
  onSelectAll?: (options: ChoiceOption[], select: boolean) => void
  query: string
  onQueryChange: (query: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  loading?: boolean
  loadingMore?: boolean
  error?: boolean
  onRetry?: () => void
  /** Message shown instead of the list (e.g. "Type at least 3 characters"). */
  hint?: string
  onReachEnd?: () => void
  create?: { label: string; pending?: boolean; onCreate: () => void } | null
  selectAll?: boolean
  max?: number
  maxVisibleChips?: number
  /** Extra live-region message (e.g. "Created"). */
  announcement?: string
  /** Props for the trigger button (id, aria-*, data-*). */
  triggerProps: React.ComponentProps<"button"> & Record<string, unknown>
  required?: boolean
  dataSlot: string
}

const CREATE_VALUE = "\u0000onu-create"
const SELECT_ALL_VALUE = "\u0000onu-select-all"

/** Search field inside the picker. Mounted with the content so the Thaana keyboard can attach. */
function SearchField({
  value,
  onValueChange,
  placeholder,
  thaana,
  className,
  onKeyDown,
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  thaana?: ThaanaProp
  className?: string
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
}) {
  const ref = React.useRef<HTMLInputElement>(null)
  const { fieldProps } = useThaanaField(ref, thaana)
  return (
    <div data-slot="choice-search" className="p-1 pb-0">
      <div className="h-8 gap-2 px-2 touch:h-11 flex items-center rounded-lg border border-input/30 bg-input/30">
        <Icon name="search" className="size-4 shrink-0 opacity-50" />
        <CommandPrimitive.Input
          ref={ref}
          value={value}
          onValueChange={onValueChange}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          className={cn(
            "min-w-0 text-sm h-full flex-1 bg-transparent outline-hidden placeholder:text-muted-foreground",
            className,
          )}
          {...fieldProps}
        />
      </div>
    </div>
  )
}

function DefaultOption({ option }: { option: ChoiceOption }) {
  return (
    <>
      {option.icon ? <span className="flex shrink-0 items-center">{option.icon}</span> : null}
      <span className="min-w-0 grid flex-1">
        <span className="truncate">{option.label}</span>
        {option.description ? (
          <span className="text-xs truncate text-muted-foreground">{option.description}</span>
        ) : null}
      </span>
    </>
  )
}

/**
 * Shared select-like combobox: a field with the value (or chips), a clear
 * button and a popover/sheet holding a search field and a cmdk list.
 * Searchable, multi, quick-create and API selects are thin wrappers around it.
 */
export function ComboboxCore({
  ref,
  multiple,
  selected,
  options,
  onToggle,
  onClear,
  onSelectAll,
  query,
  onQueryChange,
  open,
  setOpen,
  loading,
  loadingMore,
  error,
  onRetry,
  hint,
  onReachEnd,
  create,
  selectAll,
  max,
  maxVisibleChips,
  announcement,
  triggerProps,
  required,
  dataSlot,
  placeholder,
  searchPlaceholder,
  thaana,
  clearable,
  size = "default",
  disabled,
  name,
  emptyText,
  renderOption,
  renderValue,
  sheet,
  className,
  classNames,
}: ComboboxCoreProps) {
  const { t } = useTranslation()
  const contentId = `${React.useId()}-picker`
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const mergedRef = useMergedRef(triggerRef, ref)
  const listRef = React.useRef<HTMLDivElement>(null)
  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const selectedValues = React.useMemo(() => new Set(selected.map((o) => o.value)), [selected])
  const atMax = multiple && max !== undefined && selected.length >= max
  const placeholderText = placeholder ?? t("choice.placeholder")
  const title = (triggerProps["aria-label"] as string | undefined) ?? placeholderText

  // Load the next page when the end of the list scrolls into view.
  const reachEnd = React.useRef(onReachEnd)
  React.useEffect(() => {
    reachEnd.current = onReachEnd
  })
  const canLoadMore = !!onReachEnd
  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!open || !canLoadMore || !sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) reachEnd.current?.()
      },
      { root: listRef.current, rootMargin: "48px" },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [open, canLoadMore, options.length])

  const onListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 48) onReachEnd?.()
  }

  const handleSelect = (option: ChoiceOption) => {
    onToggle(option)
    if (!multiple) {
      setOpen(false)
      onQueryChange("")
    }
  }

  const clear = () => {
    onClear()
    triggerRef.current?.focus()
  }

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    ;(triggerProps.onKeyDown as React.KeyboardEventHandler<HTMLButtonElement> | undefined)?.(e)
    if (e.defaultPrevented || disabled) return
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      setOpen(true)
    } else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Typing on the closed field starts a search.
      e.preventDefault()
      onQueryChange(e.key)
      setOpen(true)
    } else if ((e.key === "Backspace" || e.key === "Delete") && clearable && !required && selected.length) {
      e.preventDefault()
      onClear()
    }
  }

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (multiple && e.key === "Backspace" && !query && selected.length) {
      const last = selected[selected.length - 1]!
      onToggle(last)
    }
  }

  // Live-region message for the current state (R16.5 "announced to screen readers").
  const enabledVisible = options.filter((o) => !o.disabled)
  let status = ""
  if (open) {
    if (loading) status = t("common.loading")
    else if (error) status = t("choice.loadError")
    else if (hint) status = hint
    else if (!options.length)
      status = emptyText ?? (query ? t("common.noResultsFor", { query }) : t("choice.noOptions"))
    else if (query) status = t("choice.resultsCount", { count: options.length })
  }

  const showClear = clearable && !required && !disabled && selected.length > 0
  const visibleChips = maxVisibleChips !== undefined ? selected.slice(0, maxVisibleChips) : selected
  const hiddenChips = selected.length - visibleChips.length
  const allSelected = enabledVisible.length > 0 && enabledVisible.every((o) => selectedValues.has(o.value))
  const someSelected = enabledVisible.some((o) => selectedValues.has(o.value))

  const valueContent = renderValue ? (
    renderValue(selected)
  ) : !multiple && selected[0] ? (
    <span className={cn("min-w-0 gap-1.5 flex items-center", classNames?.value)}>
      {selected[0].icon ? <span className="flex shrink-0 items-center">{selected[0].icon}</span> : null}
      <span className="truncate">{selected[0].label}</span>
    </span>
  ) : null

  const showPlaceholder = !valueContent && (!multiple || selected.length === 0)

  const trigger = (
    <button
      type="button"
      role="combobox"
      data-slot="choice-trigger"
      aria-expanded={open}
      aria-controls={contentId}
      {...triggerProps}
      ref={mergedRef}
      disabled={disabled}
      aria-required={required || undefined}
      onKeyDown={onTriggerKeyDown}
      className={cn(
        "min-w-16 gap-1.5 flex flex-1 items-center self-stretch text-start outline-none",
        "after:inset-0 after:absolute after:rounded-[inherit] disabled:cursor-not-allowed",
        classNames?.trigger,
      )}
    >
      {showPlaceholder ? (
        <span className={cn("truncate text-muted-foreground", classNames?.placeholder)}>{placeholderText}</span>
      ) : null}
      {multiple && !renderValue && selected.length > 0 ? (
        <span className="sr-only">{t("choice.selectedCount", { count: selected.length })}</span>
      ) : null}
      {valueContent}
    </button>
  )

  const list = (
    <Command
      shouldFilter={false}
      loop
      label={searchPlaceholder ?? t("choice.searchPlaceholder")}
      className="p-0 min-h-0 rounded-none! bg-transparent"
    >
      <SearchField
        value={query}
        onValueChange={onQueryChange}
        placeholder={searchPlaceholder ?? t("choice.searchPlaceholder")}
        thaana={thaana}
        className={classNames?.search}
        onKeyDown={onSearchKeyDown}
      />
      <CommandList
        ref={listRef}
        label={title}
        onScroll={onListScroll}
        className={cn("p-1 max-h-72 touch:max-h-[60vh]", classNames?.list)}
      >
        {atMax ? (
          <div data-slot="choice-max" className="px-2 py-1.5 text-xs text-muted-foreground">
            {t("choice.maxReached", { count: max })}
          </div>
        ) : null}
        {loading ? (
          <div
            data-slot="choice-status"
            className={cn(
              "gap-2 py-6 text-sm flex items-center justify-center text-muted-foreground",
              classNames?.status,
            )}
          >
            <Icon name="loading" className="size-4 animate-spin" />
            {t("common.loading")}
          </div>
        ) : error ? (
          <div
            data-slot="choice-status"
            className={cn("gap-2 py-4 text-sm flex flex-col items-center text-center", classNames?.status)}
          >
            <span className="gap-1.5 flex items-center text-destructive">
              <Icon name="error" className="size-4" />
              {t("choice.loadError")}
            </span>
            {onRetry ? (
              <Button type="button" variant="outline" size="sm" onClick={onRetry} className="touch:min-h-11">
                <Icon name="refresh" />
                {t("common.retry")}
              </Button>
            ) : null}
          </div>
        ) : hint ? (
          <div
            data-slot="choice-status"
            className={cn("py-6 px-2 text-sm text-center text-muted-foreground", classNames?.status)}
          >
            {hint}
          </div>
        ) : options.length === 0 && !create ? (
          <div data-slot="choice-status" className={cn("py-6 px-2 text-sm text-center", classNames?.status)}>
            {emptyText ?? (query ? t("common.noResultsFor", { query }) : t("choice.noOptions"))}
          </div>
        ) : null}
        {!loading && !error && !hint ? (
          <>
            {multiple && selectAll && enabledVisible.length > 1 && (max === undefined || allSelected) ? (
              <>
                <CommandGroup>
                  <CommandItem
                    value={SELECT_ALL_VALUE}
                    data-checked={allSelected}
                    aria-checked={allSelected ? true : someSelected ? "mixed" : false}
                    onSelect={() => onSelectAll?.(enabledVisible, !allSelected)}
                    className={cn("font-medium touch:min-h-11", classNames?.item)}
                  >
                    {allSelected ? t("choice.deselectAll") : t("common.selectAll")}
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            ) : null}
            {groupOptions(options).map((group, gi) => (
              <CommandGroup key={group.group ?? `__${gi}`} heading={group.group}>
                {group.options.map((option) => {
                  const isSelected = selectedValues.has(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled || (atMax && !isSelected)}
                      data-checked={isSelected}
                      aria-checked={multiple ? isSelected : undefined}
                      onSelect={() => handleSelect(option)}
                      className={cn("touch:min-h-11", classNames?.item)}
                    >
                      {renderOption ? (
                        renderOption(option, { selected: isSelected })
                      ) : (
                        <DefaultOption option={option} />
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
            {create ? (
              <CommandGroup>
                <CommandItem
                  value={CREATE_VALUE}
                  disabled={create.pending}
                  onSelect={create.onCreate}
                  data-slot="choice-create"
                  className={cn("touch:min-h-11", classNames?.item)}
                >
                  <Icon name={create.pending ? "loading" : "plus"} className={cn(create.pending && "animate-spin")} />
                  <span className="truncate">{create.label}</span>
                </CommandItem>
              </CommandGroup>
            ) : null}
            {loadingMore ? (
              <div className="gap-2 py-2 text-xs flex items-center justify-center text-muted-foreground">
                <Icon name="loading" className="size-3.5 animate-spin" />
                {t("choice.loadingMore")}
              </div>
            ) : null}
            {onReachEnd ? <div ref={sentinelRef} aria-hidden="true" className="h-px" /> : null}
          </>
        ) : null}
      </CommandList>
    </Command>
  )

  return (
    <div data-slot={dataSlot} className="min-w-0 w-full">
      <Picker
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) onQueryChange("")
        }}
        sheet={sheet}
      >
        <PickerAnchor>
          <div
            data-slot="choice-field"
            data-disabled={disabled || undefined}
            data-size={size}
            className={cn(choiceFieldVariants({ size }), classNames?.root, className)}
          >
            {multiple && !renderValue
              ? visibleChips.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    data-slot="choice-chip"
                    className={cn("h-6 gap-1 pe-0.5 ps-2 relative z-10 max-w-full", classNames?.chip)}
                  >
                    <span className="truncate">{option.label}</span>
                    <button
                      type="button"
                      disabled={disabled}
                      aria-label={t("choice.removeItem", { label: option.label })}
                      onClick={() => onToggle(option)}
                      className="size-5 flex shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <Icon name="close" className="size-3" />
                    </button>
                  </Badge>
                ))
              : null}
            {hiddenChips > 0 ? (
              <Badge variant="outline" className="h-6 relative z-10">
                {t("choice.moreSelected", { count: hiddenChips })}
              </Badge>
            ) : null}
            <PickerTrigger>{trigger}</PickerTrigger>
            {showClear ? (
              <button
                type="button"
                data-slot="choice-clear"
                aria-label={t("choice.clearSelection")}
                onClick={clear}
                className={cn(
                  "size-6 touch:size-9 relative z-10 flex shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                  classNames?.clear,
                )}
              >
                <Icon name="close" className="size-3.5" />
              </button>
            ) : null}
            <Icon name="chevron-down" className="size-4 pointer-events-none shrink-0 text-muted-foreground" />
          </div>
        </PickerAnchor>
        <PickerContent id={contentId} title={title} className={classNames?.content}>
          {list}
        </PickerContent>
      </Picker>
      {name ? (
        multiple ? (
          selected.map((o) => (
            <input key={o.value} type="hidden" name={name.endsWith("[]") ? name : `${name}[]`} value={o.value} />
          ))
        ) : (
          <input type="hidden" name={name} value={selected[0]?.value ?? ""} />
        )
      ) : null}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement || status}
      </span>
    </div>
  )
}
