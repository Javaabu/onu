"use client"

import * as React from "react"
import { format as formatDate, isValid, parseISO } from "date-fns"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useOnu, useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Calendar } from "../../ui/calendar"
import { Checkbox } from "../../ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../ui/command"
import { Label } from "../../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { TextInput } from "../inputs/text-input"
import { formatFilterDate, optionText } from "./_filter-format"
import type {
  BooleanFilterDefinition,
  DateRangeFilterDefinition,
  DateRangeFilterValue,
  FilterDefinition,
  FilterRenderProps,
  FilterValue,
  SelectFilterDefinition,
  TextFilterDefinition,
} from "./listing-types"

const ANY = "__any__"

interface ControlProps<D extends FilterDefinition, V extends FilterValue = FilterValue> {
  definition: D
  value: V | undefined
  onChange: (value: V | undefined) => void
  id: string
  labelId: string
}

/** Multi or single select. Short lists show checkboxes; long or searchable lists use a searchable popover. */
function SelectControl({ definition, value, onChange, id, labelId }: ControlProps<SelectFilterDefinition>) {
  const { t } = useTranslation()
  const multiple = definition.multiple !== false
  const searchable = definition.searchable ?? definition.options.length > 7
  const selected: string[] = Array.isArray(value) ? value : typeof value === "string" && value ? [value] : []
  const [open, setOpen] = React.useState(false)

  const toggle = (option: string) => {
    if (!multiple) {
      onChange(selected[0] === option ? undefined : option)
      setOpen(false)
      return
    }
    const next = selected.includes(option) ? selected.filter((v) => v !== option) : [...selected, option]
    onChange(next.length ? next : undefined)
  }

  if (!searchable && multiple && definition.options.length <= 6) {
    return (
      <div role="group" aria-labelledby={labelId} id={id} className="gap-x-4 gap-y-2 flex flex-wrap">
        {definition.options.map((option) => {
          const optionId = `${id}-${option.value}`
          return (
            <div key={option.value} className="gap-2 touch:min-h-11 flex items-center">
              <Checkbox
                id={optionId}
                checked={selected.includes(option.value)}
                onCheckedChange={() => toggle(option.value)}
              />
              <Label htmlFor={optionId} className="font-normal">
                {option.label}
              </Label>
            </div>
          )
        })}
      </div>
    )
  }

  if (!searchable && !multiple) {
    return (
      <Select value={selected[0] ?? ANY} onValueChange={(v) => onChange(v === ANY ? undefined : v)}>
        <SelectTrigger id={id} aria-labelledby={labelId} className="touch:min-h-11 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{t("listing.any")}</SelectItem>
          {definition.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  const summary =
    selected.length === 0
      ? t("listing.selectOptions")
      : selected.length <= 2
        ? selected
            .map((v) =>
              optionText(
                definition.options.find((o) => o.value === v),
                v,
              ),
            )
            .join(", ")
        : t("listing.selectedOptions", { count: selected.length })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-labelledby={`${labelId} ${id}`}
          className={cn(
            "font-normal touch:min-h-11 w-full justify-between",
            selected.length === 0 && "text-muted-foreground",
          )}
        >
          <span className="truncate">{summary}</span>
          <Icon name="chevrons-up-down" className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 min-w-56 w-(--radix-popover-trigger-width)" align="start">
        <Command label={t("listing.searchOptions")}>
          <CommandInput placeholder={t("listing.searchOptions")} aria-label={t("listing.searchOptions")} />
          <CommandList aria-multiselectable={multiple || undefined}>
            <CommandEmpty>{t("listing.noOptions")}</CommandEmpty>
            <CommandGroup>
              {definition.options.map((option) => {
                const on = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={`${option.value} ${optionText(option, option.value)}`}
                    data-checked={on}
                    aria-checked={on}
                    className="touch:min-h-11"
                    onSelect={() => toggle(option.value)}
                  >
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function DatePickerButton({
  value,
  onChange,
  label,
  id,
}: {
  value: string | undefined
  onChange: (value: string | undefined) => void
  label: string
  id: string
}) {
  const { t, locale, dir } = useOnu()
  const [open, setOpen] = React.useState(false)
  const date = value ? parseISO(value) : undefined
  const valid = date && isValid(date) ? date : undefined
  const labelId = `${id}-label`
  return (
    <div className="gap-1 min-w-36 grid flex-1">
      <span id={labelId} className="text-xs text-muted-foreground">
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            aria-labelledby={`${labelId} ${id}`}
            className={cn("font-normal touch:min-h-11 w-full justify-start", !valid && "text-muted-foreground")}
          >
            <Icon name="calendar" />
            {valid ? formatFilterDate(value as string, locale.dateFns) : t("listing.pickDate")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Calendar
            mode="single"
            selected={valid}
            defaultMonth={valid}
            locale={locale.dateFns}
            weekStartsOn={locale.weekStartsOn}
            dir={dir}
            onSelect={(d) => {
              onChange(d ? formatDate(d, "yyyy-MM-dd") : undefined)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function DateRangeControl({ definition, value, onChange, id, labelId }: ControlProps<DateRangeFilterDefinition>) {
  const { t } = useTranslation()
  const range = (value && typeof value === "object" && !Array.isArray(value) ? value : {}) as DateRangeFilterValue
  const fields = definition.fields
  const set = (patch: Partial<DateRangeFilterValue>) => {
    const next = { ...range, ...patch }
    if (fields?.length && !next.field) next.field = fields[0]?.value
    onChange(next.from || next.to ? next : undefined)
  }
  return (
    <div className="gap-2 flex flex-wrap" role="group" aria-labelledby={labelId}>
      {fields && fields.length > 1 ? (
        <div className="gap-1 grid w-full">
          <span id={`${id}-field-label`} className="text-xs text-muted-foreground">
            {t("listing.dateField")}
          </span>
          <Select value={range.field ?? fields[0]?.value} onValueChange={(field) => onChange({ ...range, field })}>
            <SelectTrigger aria-labelledby={`${id}-field-label`} className="touch:min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fields.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <DatePickerButton
        id={`${id}-from`}
        label={t("listing.dateFrom")}
        value={range.from}
        onChange={(from) => set({ from })}
      />
      <DatePickerButton id={`${id}-to`} label={t("listing.dateTo")} value={range.to} onChange={(to) => set({ to })} />
    </div>
  )
}

function BooleanControl({ definition, value, onChange, id, labelId }: ControlProps<BooleanFilterDefinition>) {
  const { t } = useTranslation()
  return (
    <Select
      value={value === "1" || value === "0" ? value : ANY}
      onValueChange={(v) => onChange(v === ANY ? undefined : v)}
    >
      <SelectTrigger id={id} aria-labelledby={labelId} className="touch:min-h-11 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>{t("listing.any")}</SelectItem>
        <SelectItem value="1">{definition.trueLabel ?? t("listing.yes")}</SelectItem>
        <SelectItem value="0">{definition.falseLabel ?? t("listing.no")}</SelectItem>
      </SelectContent>
    </Select>
  )
}

function TextControl({ definition, value, onChange, id, labelId }: ControlProps<TextFilterDefinition>) {
  return (
    <TextInput
      id={id}
      aria-labelledby={labelId}
      placeholder={definition.placeholder}
      thaana={definition.thaana}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value || undefined)}
      className="touch:min-h-11"
    />
  )
}

function TrashedControl({ value, onChange, id, labelId }: ControlProps<FilterDefinition>) {
  const { t } = useTranslation()
  const current = value === "with" || value === "only" ? value : "hide"
  return (
    <ToggleGroup
      id={id}
      type="single"
      variant="outline"
      aria-labelledby={labelId}
      value={current}
      onValueChange={(v) => v && onChange(v === "hide" ? undefined : v)}
      className="w-full"
    >
      {(
        [
          ["hide", t("listing.trashedHide")],
          ["with", t("listing.trashedInclude")],
          ["only", t("listing.trashedOnly")],
        ] as const
      ).map(([v, label]) => (
        <ToggleGroupItem key={v} value={v} className="touch:min-h-11 flex-1">
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

/** The control for one filter: the definition's `render`, or the built-in control for its type. */
export function FilterControl(props: ControlProps<FilterDefinition>) {
  const { definition } = props
  if (definition.render) {
    const renderProps: FilterRenderProps = {
      value: props.value,
      onChange: props.onChange,
      id: props.id,
      definition,
    }
    return <>{definition.render(renderProps)}</>
  }
  switch (definition.type) {
    case "select":
      return <SelectControl {...props} definition={definition} />
    case "date-range":
      return <DateRangeControl {...props} definition={definition} />
    case "boolean":
      return <BooleanControl {...props} definition={definition} />
    case "text":
      return <TextControl {...props} definition={definition} />
    case "trashed":
      return <TrashedControl {...props} />
    /* c8 ignore next 2 -- custom filters always have `render` */
    default:
      return null
  }
}
