"use client"

import * as React from "react"
import {
  QueryBuilder,
  defaultOperators,
  type ActionProps,
  type Field,
  type NotToggleProps,
  type RuleGroupType,
  type ValueEditorProps,
  type ValueSelectorProps,
} from "react-querybuilder"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Checkbox } from "../../ui/checkbox"
import { Input } from "../../ui/input"
import { NativeSelect, NativeSelectOption } from "../../ui/native-select"

export type { Field as ConditionField, RuleGroupType as ConditionGroup } from "react-querybuilder"
export { formatQuery } from "react-querybuilder"

const OPERATOR_KEYS: Record<string, string> = {
  "=": "listing.opEquals",
  "!=": "listing.opNotEquals",
  contains: "listing.opContains",
  doesNotContain: "listing.opNotContains",
  beginsWith: "listing.opBeginsWith",
  endsWith: "listing.opEndsWith",
  doesNotBeginWith: "listing.opNotContains",
  doesNotEndWith: "listing.opNotContains",
  "<": "listing.opLess",
  "<=": "listing.opLessOrEqual",
  ">": "listing.opGreater",
  ">=": "listing.opGreaterOrEqual",
  null: "listing.opNull",
  notNull: "listing.opNotNull",
  in: "listing.opIn",
  notIn: "listing.opNotIn",
  between: "listing.opBetween",
  notBetween: "listing.opNotBetween",
}

function flatOptions(options: ValueSelectorProps["options"]) {
  return options.flatMap((o) =>
    "options" in o ? (o.options as { name: string; label: string }[]) : [o as { name: string; label: string }],
  )
}

function OnuValueSelector({
  options,
  value,
  handleOnChange,
  title,
  className,
  disabled,
  multiple,
}: ValueSelectorProps) {
  const flat = flatOptions(options)
  return (
    <NativeSelect
      size="sm"
      aria-label={title}
      title={title}
      disabled={disabled}
      multiple={multiple}
      className={cn("min-w-28 touch:[&_select]:min-h-11 w-auto", className)}
      value={
        multiple
          ? Array.isArray(value)
            ? value
            : String(value ?? "")
                .split(",")
                .filter(Boolean)
          : (value ?? "")
      }
      onChange={(e) => handleOnChange(multiple ? Array.from(e.target.selectedOptions, (o) => o.value) : e.target.value)}
    >
      {flat.map((option) => (
        <NativeSelectOption key={option.name} value={option.name}>
          {option.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}

function OnuAction({ label, title, handleOnClick, disabled, className, testID }: ActionProps) {
  const isRemove = testID === "remove-rule" || testID === "remove-group"
  return (
    <Button
      type="button"
      size={isRemove ? "icon-sm" : "sm"}
      variant={isRemove ? "ghost" : "outline"}
      aria-label={isRemove ? title : undefined}
      title={title}
      disabled={disabled}
      className={cn("touch:min-h-11", isRemove && "touch:min-w-11", className)}
      onClick={(e) => handleOnClick(e)}
    >
      {isRemove ? <Icon name="close" /> : <Icon name="plus" />}
      {isRemove ? null : label}
    </Button>
  )
}

function OnuNotToggle({ checked, handleOnChange, label, disabled, className, path }: NotToggleProps) {
  const id = `onu-qb-not-${path.join("-")}`
  return (
    <div className={cn("gap-1.5 text-sm flex items-center", className)}>
      <Checkbox id={id} checked={!!checked} disabled={disabled} onCheckedChange={(v) => handleOnChange(v === true)} />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

function OnuValueEditor(props: ValueEditorProps) {
  const { operator, value, handleOnChange, title, className, disabled, fieldData, inputType, type, values } = props
  if (operator === "null" || operator === "notNull") return null
  const options = (values ?? fieldData.values) as { name: string; label: string }[] | undefined
  if ((type === "select" || type === "multiselect") && options?.length) {
    return (
      <OnuValueSelector
        {...(props as unknown as ValueSelectorProps)}
        options={options.map((o) => ({ ...o, value: o.name }))}
        multiple={type === "multiselect"}
      />
    )
  }
  const htmlType = inputType ?? "text"
  const inputClass = cn("h-7 min-w-32 touch:min-h-11 w-auto", className)
  const latin = htmlType !== "text"
  if (operator === "between" || operator === "notBetween") {
    const [from = "", to = ""] = Array.isArray(value) ? value : String(value ?? "").split(",")
    return (
      <span className="gap-1.5 flex items-center">
        <Input
          type={htmlType}
          aria-label={`${title ?? ""} 1`}
          disabled={disabled}
          className={inputClass}
          dir={latin ? "ltr" : undefined}
          value={from}
          onChange={(e) => handleOnChange([e.target.value, to].join(","))}
        />
        <span aria-hidden="true">–</span>
        <Input
          type={htmlType}
          aria-label={`${title ?? ""} 2`}
          disabled={disabled}
          className={inputClass}
          dir={latin ? "ltr" : undefined}
          value={to}
          onChange={(e) => handleOnChange([from, e.target.value].join(","))}
        />
      </span>
    )
  }
  return (
    <Input
      type={htmlType}
      aria-label={title}
      title={title}
      disabled={disabled}
      className={inputClass}
      dir={latin ? "ltr" : "auto"}
      value={value ?? ""}
      onChange={(e) => handleOnChange(e.target.value)}
    />
  )
}

const CONTROL_ELEMENTS = {
  actionElement: OnuAction,
  valueSelector: OnuValueSelector,
  notToggle: OnuNotToggle,
  valueEditor: OnuValueEditor,
}

export interface FilterConditionBuilderProps {
  /** The fields people can filter on (name, label, inputType, values, operators…). */
  fields: Field[]
  query?: RuleGroupType
  defaultQuery?: RuleGroupType
  onQueryChange?: (query: RuleGroupType) => void
  /** Allow nested groups. Default `true`. */
  allowGroups?: boolean
  /** Show the "Not" toggle on groups. */
  showNotToggle?: boolean
  disabled?: boolean
  className?: string
  classNames?: { group?: string; header?: string; body?: string; rule?: string }
}

/**
 * Advanced filters as conditions ("Status is Active AND Island is one of Malé,
 * Hulhumalé"), on `react-querybuilder` with Onu controls, translations and
 * RTL-aware layout. Turn the query into SQL, a URL or MongoDB with `formatQuery`.
 */
export function FilterConditionBuilder({
  fields,
  query,
  defaultQuery,
  onQueryChange,
  allowGroups = true,
  showNotToggle = false,
  disabled,
  className,
  classNames,
}: FilterConditionBuilderProps) {
  const { t } = useTranslation()

  const translations = React.useMemo(
    () => ({
      fields: {
        title: t("listing.field"),
        placeholderLabel: t("listing.selectOptions"),
        placeholderGroupLabel: t("listing.selectOptions"),
      },
      operators: {
        title: t("listing.operator"),
        placeholderLabel: t("listing.selectOptions"),
        placeholderGroupLabel: t("listing.selectOptions"),
      },
      value: { title: t("listing.value") },
      removeRule: { label: "×", title: t("listing.removeRule") },
      removeGroup: { label: "×", title: t("listing.removeGroup") },
      addRule: { label: t("listing.addRule"), title: t("listing.addRule") },
      addGroup: { label: t("listing.addGroup"), title: t("listing.addGroup") },
      combinators: { title: t("listing.combinator") },
      notToggle: { label: t("listing.not"), title: t("listing.not") },
    }),
    [t],
  )

  const operators = React.useMemo(
    () =>
      defaultOperators.map((op) => ({
        ...op,
        label: OPERATOR_KEYS[op.name] ? t(OPERATOR_KEYS[op.name] as string) : op.label,
      })),
    [t],
  )
  const combinators = React.useMemo(
    () => [
      { name: "and", value: "and", label: t("listing.combinatorAnd") },
      { name: "or", value: "or", label: t("listing.combinatorOr") },
    ],
    [t],
  )

  return (
    <div data-slot="filter-condition-builder" className={cn("text-sm", className)}>
      <QueryBuilder
        fields={fields}
        query={query}
        defaultQuery={defaultQuery}
        onQueryChange={onQueryChange}
        operators={operators}
        combinators={combinators}
        translations={translations}
        controlElements={{ ...CONTROL_ELEMENTS, addGroupAction: allowGroups ? OnuAction : null }}
        showNotToggle={showNotToggle}
        disabled={disabled}
        controlClassnames={{
          queryBuilder: "gap-2 grid",
          ruleGroup: cn("gap-2 p-3 grid rounded-lg border bg-muted/30", classNames?.group),
          header: cn("gap-2 flex flex-wrap items-center", classNames?.header),
          body: cn("gap-2 ps-3 grid border-s empty:hidden", classNames?.body),
          rule: cn("gap-2 flex flex-wrap items-center", classNames?.rule),
        }}
      />
    </div>
  )
}
