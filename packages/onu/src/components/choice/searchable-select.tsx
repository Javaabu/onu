"use client"

import * as React from "react"

import { useTranslation } from "../../providers/onu-provider"
import { useFormFieldControl } from "../form/form-field"
import { ComboboxCore, type ComboboxPresentationProps } from "./_combobox"
import { useQuickCreate, type QuickCreateProps } from "./_create"
import { useOnChange, useParentField, type ParentFieldProps } from "./_hooks"
import { useChoiceSelection, useOpenState, type MultipleSelectionProps, type SelectionProps } from "./_selection"
import { filterOptions, normalizeOptions, type ChoiceOption, type ChoiceOptionInput } from "./options"

type TriggerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "children" | "name" | "disabled" | "className" | "ref"
>

/**
 * Options, or for a dependent field (`parentValue`) the options per parent
 * value: a map keyed by the parent value, or a function of it.
 */
export type SearchableSelectOptions =
  | ReadonlyArray<ChoiceOptionInput>
  | Readonly<Record<string, ReadonlyArray<ChoiceOptionInput>>>
  | ((parentValue: string) => ReadonlyArray<ChoiceOptionInput>)

export type SearchableSelectBaseProps = ComboboxPresentationProps &
  TriggerProps &
  ParentFieldProps & {
    ref?: React.Ref<HTMLButtonElement>
    options: SearchableSelectOptions
    required?: boolean
    /** Replace the default `Intl.Collator` matching. */
    filter?: (option: ChoiceOption, query: string) => boolean
    /** Multi only: show a "Select all" row for the visible options. */
    selectAll?: boolean
    /** Multi only: maximum number of values. */
    max?: number
    /** Multi only: collapse chips after this many into "+N more". */
    maxVisibleChips?: number
  }

export type { CreateDialogRenderProps, QuickCreateProps } from "./_create"

export type SearchableSelectProps = SelectionProps & SearchableSelectBaseProps & QuickCreateProps

type InternalProps = SearchableSelectProps & { dataSlot?: string }

/** @internal Shared by SearchableSelect and its presets. */
export function LocalCombobox(props: InternalProps) {
  const {
    multiple,
    value,
    defaultValue,
    onValueChange,
    options: optionsInput,
    filter,
    selectAll = true,
    max,
    maxVisibleChips,
    onCreate,
    renderCreateDialog,
    onCreated,
    dataSlot = "searchable-select",
    parentValue: _parentValue,
    parentLabel: _parentLabel,
    placeholder: placeholderProp,
    searchPlaceholder,
    thaana,
    clearable = multiple === true,
    size,
    emptyText,
    renderOption,
    renderValue,
    sheet,
    open: openProp,
    defaultOpen,
    onOpenChange,
    className,
    classNames,
    ref,
    ...rest
  } = props
  const { locale } = useTranslation()
  const control = useFormFieldControl(rest as Record<string, unknown>) as TriggerProps & {
    name?: string
    required?: boolean
    disabled?: boolean
  }
  const { name, required, disabled: disabledProp, ...triggerProps } = control
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange)
  const [query, setQuery] = React.useState("")
  const { parent, waiting, placeholder } = useParentField(props, placeholderProp)
  const disabled = disabledProp || waiting
  const options = React.useMemo(() => {
    if (Array.isArray(optionsInput)) return normalizeOptions(optionsInput as ReadonlyArray<ChoiceOptionInput>)
    if (parent === null) return []
    const list =
      typeof optionsInput === "function"
        ? optionsInput(parent)
        : (optionsInput as Readonly<Record<string, ReadonlyArray<ChoiceOptionInput>>>)[parent]
    return normalizeOptions(list ?? [])
  }, [optionsInput, parent])
  const selection = useChoiceSelection({ multiple, value, defaultValue, onValueChange } as SelectionProps, options)
  // A new parent value: clear the child (R16.5).
  useOnChange(parent, () => {
    if (selection.values.length) selection.clear()
    setQuery("")
  })
  const create = useQuickCreate({
    config: { onCreate, renderCreateDialog, onCreated },
    query,
    options,
    select: (o) => {
      selection.select(o)
      setQuery("")
    },
    close: () => setOpen(false),
    multiple: selection.multiple,
  })
  const all = React.useMemo(() => [...options, ...create.created], [options, create.created])
  const visible = React.useMemo(
    () => (filter ? all.filter((o) => !query || filter(o, query)) : filterOptions(all, query, locale.code)),
    [all, filter, query, locale.code],
  )

  return (
    <>
      <ComboboxCore
        ref={ref}
        dataSlot={dataSlot}
        multiple={selection.multiple}
        selected={selection.selected}
        options={visible}
        onToggle={selection.toggle}
        onClear={selection.clear}
        onSelectAll={(opts, select) =>
          selection.setMany(
            select && max !== undefined ? opts.slice(0, Math.max(0, max - selection.values.length)) : opts,
            select,
          )
        }
        query={query}
        onQueryChange={setQuery}
        open={open}
        setOpen={setOpen}
        create={create.createItem}
        announcement={create.announcement}
        selectAll={selectAll}
        max={max}
        maxVisibleChips={maxVisibleChips}
        triggerProps={triggerProps}
        required={required}
        disabled={disabled}
        name={name}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        thaana={thaana}
        clearable={clearable}
        size={size}
        emptyText={emptyText}
        renderOption={renderOption}
        renderValue={renderValue}
        sheet={sheet}
        className={className}
        classNames={classNames}
      />
      {create.dialog}
    </>
  )
}

/**
 * A select with a search field: a button that opens a searchable list
 * (Popover + Command, a bottom sheet on phones). Matching uses `Intl.Collator`
 * so it handles accents and Thaana (R12.8); the search field accepts `thaana`.
 *
 * - `multiple`: chips in the field (each removable), a "Select all" row and an
 *   optional `max`; Backspace in the empty search removes the last chip.
 *   Submits `name[]` for Laravel.
 * - `onCreate` / `renderCreateDialog`: when nothing matches the search exactly,
 *   a "Create “x”" row creates the option inline or through your own dialog.
 *   The new option is added, selected and announced.
 */
export function SearchableSelect(props: SearchableSelectProps) {
  return <LocalCombobox {...props} />
}

export type MultiSelectProps = Omit<MultipleSelectionProps, "multiple"> & SearchableSelectBaseProps & QuickCreateProps

/** `SearchableSelect` with `multiple`. */
export function MultiSelect(props: MultiSelectProps) {
  return <LocalCombobox {...props} multiple dataSlot="multi-select" />
}

export type QuickCreateSelectProps = SearchableSelectProps

/** `SearchableSelect` for lists that grow: pass `onCreate` or `renderCreateDialog`. */
export function QuickCreateSelect(props: QuickCreateSelectProps) {
  return <LocalCombobox {...props} dataSlot="quick-create-select" />
}
