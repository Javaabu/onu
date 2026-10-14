"use client"

import * as React from "react"

import { FormErrorsProvider, type FormErrors } from "../components/form/form-context"
import { FormField, useFormField, useFormFieldControl } from "../components/form/form-field"
import { TextInput } from "../components/inputs/text-input"
import { Textarea } from "../components/inputs/textarea"
import { cn } from "../lib/utils"
import type { LabelLayout } from "../providers/onu-provider"
import { useTranslation } from "../providers/onu-provider"
import type { ThaanaProp } from "../thaana/use-thaana-field"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import { registerEnglish } from "../i18n/english"
import { common as en_common } from "../locales/en/common"

registerEnglish({ common: en_common })

export type AttributeFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "url"
  | "tel"
  | "select"
  | "radio"
  | "multiselect"
  | "boolean"
  | "date"
  | "time"
  | "datetime"
  | "color"

export type AttributeOption = string | { value: string; label: string; disabled?: boolean }

/** One field in an attribute schema. */
export interface AttributeField {
  /** Key in the values object; also the input name (inside `name[...]` when `name` is set). */
  name: string
  label: string
  type: AttributeFieldType
  /** Choices for `select`, `radio` and `multiselect`. */
  options?: AttributeOption[]
  required?: boolean
  help?: string
  placeholder?: string
  disabled?: boolean
  /** Value used when the values object has none. */
  defaultValue?: AttributeValue
  min?: number | string
  max?: number | string
  step?: number | string
  maxLength?: number
  /** Thaana keyboard for `text` and `textarea` fields (R13.3). */
  thaana?: ThaanaProp
  /** Span both columns in a two-column layout. Textareas and checkbox groups always do. */
  fullWidth?: boolean
}

export type AttributeValue = string | number | boolean | string[] | null
export type AttributeValues = Record<string, AttributeValue | undefined>

export interface CustomAttributeFieldsProps extends Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> {
  /** The fields to render, in order. */
  schema: AttributeField[]
  /** Controlled values. */
  value?: AttributeValues
  /** Initial values when uncontrolled. */
  defaultValue?: AttributeValues
  /** Called with all values when any field changes. */
  onChange?: (values: AttributeValues) => void
  /**
   * Wraps input names Laravel-style: `name="attributes"` gives `attributes[colour]`
   * and `attributes[sizes][]`. Server errors are looked up as `attributes.colour`.
   */
  name?: string
  /** Server-side errors keyed by field name (dot notation). Merged with any `FormErrorsProvider`. */
  errors?: FormErrors
  /** One or two columns (two from medium container widths). Default `1`. */
  columns?: 1 | 2
  labelLayout?: LabelLayout
  disabled?: boolean
  classNames?: { field?: string; control?: string }
}

const normalizeOptions = (options: AttributeOption[] = []) =>
  options.map((o) => (typeof o === "string" ? { value: o, label: o, disabled: false } : o))

const INPUT_TYPES: Partial<Record<AttributeFieldType, string>> = {
  text: "text",
  number: "number",
  email: "email",
  url: "url",
  tel: "tel",
  date: "date",
  time: "time",
  datetime: "datetime-local",
  color: "color",
}

const LATIN_ONLY = new Set<AttributeFieldType>(["email", "url", "tel", "number", "color"])

/** Empty value for a field type. */
function emptyValue(type: AttributeFieldType): AttributeValue {
  if (type === "boolean") return false
  if (type === "multiselect") return []
  if (type === "number") return null
  return ""
}

/**
 * Renders form fields from a schema (custom attributes, settings, product
 * specs) with Onu's inputs. Values go in and out as one object, names follow
 * Laravel's `attributes[key]` convention, and server errors map back to fields.
 */
export function CustomAttributeFields({
  schema,
  value,
  defaultValue,
  onChange,
  name,
  errors,
  columns = 1,
  labelLayout,
  disabled,
  className,
  classNames,
  ...props
}: CustomAttributeFieldsProps) {
  const [internal, setInternal] = React.useState<AttributeValues>(() => defaultValue ?? {})
  const values = value ?? internal

  const set = (key: string, next: AttributeValue) => {
    const updated = { ...values, [key]: next }
    if (value === undefined) setInternal(updated)
    onChange?.(updated)
  }

  const fields = (
    <div
      data-slot="custom-attribute-fields"
      className={cn("min-w-0 @container/attributes w-full", className)}
      {...props}
    >
      {/* Container queries match an ancestor, so the grid sits inside the container. */}
      <div className={cn("gap-4 grid", columns === 2 && "@xl/attributes:grid-cols-2")}>
        {schema.map((field) => {
          const inputName = name ? `${name}[${field.name}]` : field.name
          const current = values[field.name] ?? field.defaultValue ?? emptyValue(field.type)
          const wide = field.fullWidth || field.type === "textarea" || field.type === "multiselect"
          return (
            <FormField
              key={field.name}
              name={inputName}
              label={field.label}
              help={field.help}
              required={field.required}
              disabled={disabled || field.disabled}
              labelLayout={labelLayout}
              data-attribute={field.name}
              className={cn(wide && "col-span-full", classNames?.field)}
            >
              <AttributeControl
                field={field}
                name={inputName}
                value={current}
                onChange={(next) => set(field.name, next)}
                className={classNames?.control}
              />
            </FormField>
          )
        })}
      </div>
    </div>
  )

  return errors ? <FormErrorsProvider errors={errors}>{fields}</FormErrorsProvider> : fields
}

function AttributeControl({
  field,
  name,
  value,
  onChange,
  className,
}: {
  field: AttributeField
  name: string
  value: AttributeValue
  onChange: (value: AttributeValue) => void
  className?: string
}) {
  const { t } = useTranslation()
  const formField = useFormField()
  const control = useFormFieldControl({}) as Record<string, unknown>
  const options = normalizeOptions(field.options)
  const disabled = !!control.disabled

  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          value={String(value ?? "")}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          thaana={field.thaana}
          {...(field.thaana ? {} : { dir: "auto" })}
          className={className}
          onChange={(event) => onChange(event.target.value)}
        />
      )

    case "boolean":
      return (
        <div className={cn("gap-2 min-h-8 flex items-center", className)}>
          <Switch
            id={control.id as string}
            checked={value === true}
            disabled={disabled}
            aria-describedby={control["aria-describedby"] as string | undefined}
            aria-invalid={control["aria-invalid"] as boolean | undefined}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <span className="text-sm text-muted-foreground" aria-hidden="true">
            {value === true ? t("common.yes") : t("common.no")}
          </span>
          {/* Laravel-friendly boolean: always posts 1 or 0. */}
          <input type="hidden" name={name} value={value === true ? "1" : "0"} />
        </div>
      )

    case "select":
      return (
        <>
          <Select value={String(value ?? "")} onValueChange={(next) => onChange(next)} disabled={disabled}>
            <SelectTrigger
              id={control.id as string}
              aria-describedby={control["aria-describedby"] as string | undefined}
              aria-invalid={control["aria-invalid"] as boolean | undefined}
              aria-required={control["aria-required"] as boolean | undefined}
              className={cn("touch:h-11 w-full", className)}
            >
              <SelectValue placeholder={field.placeholder ?? t("common.select")} />
            </SelectTrigger>
            <SelectContent position="popper">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name={name} value={String(value ?? "")} />
        </>
      )

    case "radio":
      return (
        <>
          <RadioGroup
            id={control.id as string}
            value={String(value ?? "")}
            onValueChange={(next) => onChange(next)}
            disabled={disabled}
            aria-labelledby={formField?.labelId}
            aria-describedby={control["aria-describedby"] as string | undefined}
            aria-invalid={control["aria-invalid"] as boolean | undefined}
            aria-required={control["aria-required"] as boolean | undefined}
            className={cn("gap-x-4 gap-y-2 flex flex-wrap", className)}
          >
            {options.map((option) => {
              const id = `${control.id as string}-${option.value}`
              return (
                <div key={option.value} className="gap-2 touch:min-h-11 flex items-center">
                  <RadioGroupItem id={id} value={option.value} disabled={option.disabled} />
                  <Label htmlFor={id} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
          <input type="hidden" name={name} value={String(value ?? "")} />
        </>
      )

    case "multiselect": {
      const selected = Array.isArray(value) ? value : []
      return (
        <div
          role="group"
          id={control.id as string}
          aria-labelledby={formField?.labelId}
          aria-describedby={control["aria-describedby"] as string | undefined}
          className={cn("gap-x-4 gap-y-2 @md/attributes:grid-cols-2 @2xl/attributes:grid-cols-3 grid", className)}
        >
          {options.map((option) => {
            const id = `${control.id as string}-${option.value}`
            const checked = selected.includes(option.value)
            return (
              <div key={option.value} className="gap-2 touch:min-h-11 flex items-center">
                <Checkbox
                  id={id}
                  checked={checked}
                  disabled={disabled || option.disabled}
                  onCheckedChange={(next) =>
                    onChange(next === true ? [...selected, option.value] : selected.filter((v) => v !== option.value))
                  }
                />
                <Label htmlFor={id} className="font-normal">
                  {option.label}
                </Label>
              </div>
            )
          })}
          {selected.map((v) => (
            <input key={v} type="hidden" name={`${name}[]`} value={v} />
          ))}
        </div>
      )
    }

    default: {
      const type = INPUT_TYPES[field.type] ?? "text"
      const thaana = field.type === "text" ? field.thaana : undefined
      // Latin-only data stays LTR (R11.7); free text follows its content; Thaana fields set their own dir.
      const dir = LATIN_ONLY.has(field.type) ? "ltr" : thaana ? undefined : "auto"
      return (
        <TextInput
          type={type}
          value={value === null || value === undefined ? "" : String(value)}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          step={field.step}
          maxLength={field.maxLength}
          inputMode={field.type === "number" ? "decimal" : undefined}
          thaana={thaana}
          {...(dir ? { dir } : {})}
          className={cn(field.type === "color" && "w-16 p-1", className)}
          onChange={(event) => {
            const raw = event.target.value
            if (field.type === "number") onChange(raw === "" ? null : Number(raw))
            else onChange(raw)
          }}
        />
      )
    }
  }
}
