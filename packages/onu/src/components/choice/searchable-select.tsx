"use client"

import * as React from "react"

import { useTranslation } from "../../providers/onu-provider"
import { useFormFieldControl } from "../form/form-field"
import { ComboboxCore, type ComboboxPresentationProps } from "./_combobox"
import { useQuickCreate, type QuickCreateProps } from "./_create"
import { useChoiceSelection, useOpenState, type SelectionProps } from "./_selection"
import { filterOptions, normalizeOptions, type ChoiceOption, type ChoiceOptionInput } from "./options"

type TriggerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "children" | "name" | "disabled" | "className" | "ref"
>

export type SearchableSelectBaseProps = ComboboxPresentationProps &
  TriggerProps & {
    ref?: React.Ref<HTMLButtonElement>
    options: ReadonlyArray<ChoiceOptionInput>
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

export type SearchableSelectProps = SelectionProps & SearchableSelectBaseProps

type InternalProps = SearchableSelectProps & QuickCreateProps & { dataSlot?: string }

/** @internal Shared by SearchableSelect, MultiSelect and QuickCreateSelect. */
export function LocalCombobox(props: InternalProps) {
  const {
    multiple,
    value,
    defaultValue,
    onValueChange,
    options: optionsInput,
    filter,
    selectAll,
    max,
    maxVisibleChips,
    onCreate,
    renderCreateDialog,
    onCreated,
    dataSlot = "searchable-select",
    placeholder,
    searchPlaceholder,
    thaana,
    clearable,
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
  const { name, required, disabled, ...triggerProps } = control
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange)
  const [query, setQuery] = React.useState("")
  const options = React.useMemo(() => normalizeOptions(optionsInput), [optionsInput])
  const selection = useChoiceSelection({ multiple, value, defaultValue, onValueChange } as SelectionProps, options)
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
 * Pass `multiple` for several values.
 */
export function SearchableSelect(props: SearchableSelectProps) {
  return <LocalCombobox {...props} />
}
