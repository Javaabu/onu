"use client"

import * as React from "react"

import { FormField, useFormFieldControl } from "../components/form/form-field"
import { useFormDisabled } from "../components/form/form-context"
import { TextInput } from "../components/inputs/text-input"
import { cn } from "../lib/utils"
import type { LabelLayout } from "../providers/onu-provider"
import { useTranslation } from "../providers/onu-provider"
import type { ThaanaProp } from "../thaana/use-thaana-field"
import { NativeSelect, NativeSelectOption } from "../ui/native-select"
import { useControllableState } from "./_hooks"
import { atollLabel, findAtoll, MALDIVES_ATOLLS } from "./maldives"
import { MapPicker } from "./map-picker"
import type { LatLng, PlaceSearch } from "./types"

/** A structured Maldivian address. */
export interface MaldivesAddress {
  /** Atoll code from `MALDIVES_ATOLLS` (e.g. `K`, `MLE`). */
  atoll?: string
  /** Island id/value (from `islands`) or name. */
  island?: string
  /** Road / magu. */
  road?: string
  /** House or building name. */
  house?: string
  /** Optional map pin. */
  location?: LatLng | null
}

export interface AddressIsland {
  value: string
  /** English name. */
  label: string
  /** Dhivehi name, shown when the locale is `dv`. */
  dvLabel?: string
  /** Atoll code the island belongs to. */
  atoll: string
  position?: LatLng
}

export type AddressPart = "atoll" | "island" | "road" | "house" | "location"

export interface AddressInputProps {
  value?: MaldivesAddress
  defaultValue?: MaldivesAddress
  onChange?: (value: MaldivesAddress) => void
  /** Field names become `name[atoll]`, `name[island]`, `name[road]`, `name[house]`, `name[location][lat|lng]`. */
  name?: string
  /** Islands to choose from. Without it the island is a text field. */
  islands?: AddressIsland[]
  /** Show a map pin picker. */
  pin?: boolean
  /** Place search for the pin (see MapPicker `search`). */
  search?: boolean | PlaceSearch
  /** Type Thaana in the road, house and island text fields (R13.3). */
  thaana?: ThaanaProp
  /** Atoll and island are required. */
  required?: boolean
  disabled?: boolean
  /** Error message per part (Laravel errors for `name.atoll` etc. are picked up automatically). */
  errors?: Partial<Record<AddressPart, string | string[]>>
  /** Group heading. Defaults to "Address". `null` hides it visually (kept for screen readers). */
  legend?: React.ReactNode
  labelLayout?: LabelLayout
  className?: string
  classNames?: { legend?: string; grid?: string; field?: string; map?: string }
  ref?: React.Ref<HTMLFieldSetElement>
}

/**
 * Maldivian address fields: atoll, island, road and house name, with an
 * optional map pin. Works with Laravel errors via `FormErrorsProvider`.
 */
export function AddressInput({
  value: valueProp,
  defaultValue = {},
  onChange,
  name,
  islands,
  pin = false,
  search = false,
  thaana,
  required,
  disabled: disabledProp,
  errors,
  legend,
  labelLayout,
  className,
  classNames,
  ref,
}: AddressInputProps) {
  const { t, locale } = useTranslation()
  const formDisabled = useFormDisabled()
  const disabled = disabledProp ?? formDisabled
  const [value, setValue] = useControllableState<MaldivesAddress>(valueProp, defaultValue, onChange)
  const id = React.useId()
  const fieldName = (part: string) => (name ? `${name}[${part}]` : undefined)
  const set = (patch: Partial<MaldivesAddress>) => setValue({ ...value, ...patch })

  const atoll = findAtoll(value.atoll)
  const atollIslands = islands?.filter((i) => !value.atoll || i.atoll === value.atoll)
  const island = islands?.find((i) => i.value === value.island)
  const pinCenter = island?.position ?? atoll?.center
  const islandText = (i: AddressIsland) => (locale.code === "dv" && i.dvLabel ? i.dvLabel : i.label)

  return (
    <fieldset
      ref={ref}
      data-slot="address-input"
      disabled={disabled}
      className={cn("min-w-0 gap-3 @container/address grid", className)}
    >
      <legend className={cn("mb-1 text-sm font-medium", legend === null && "sr-only", classNames?.legend)}>
        {legend ?? t("map.address")}
      </legend>
      <div className={cn("gap-3 @lg/address:grid-cols-2 grid", classNames?.grid)}>
        <FormField
          id={`${id}-atoll`}
          label={t("map.atoll")}
          name={fieldName("atoll")}
          required={required}
          error={errors?.atoll}
          labelLayout={labelLayout}
          className={classNames?.field}
        >
          <AddressSelect
            value={value.atoll ?? ""}
            onChange={(code) => {
              const keepIsland = !islands || islands.some((i) => i.value === value.island && i.atoll === code)
              set({ atoll: code || undefined, island: keepIsland ? value.island : undefined })
            }}
            placeholder={t("map.selectAtoll")}
            options={MALDIVES_ATOLLS.map((a) => ({ value: a.code, label: atollLabel(a, locale.code) }))}
          />
        </FormField>
        <FormField
          id={`${id}-island`}
          label={t("map.island")}
          name={fieldName("island")}
          required={required}
          error={errors?.island}
          labelLayout={labelLayout}
          className={classNames?.field}
        >
          {islands ? (
            <AddressSelect
              value={value.island ?? ""}
              onChange={(v) => {
                const chosen = islands.find((i) => i.value === v)
                set({ island: v || undefined, atoll: chosen?.atoll ?? value.atoll })
              }}
              placeholder={value.atoll || !atollIslands?.length ? t("map.selectIsland") : t("map.selectAtollFirst")}
              options={(atollIslands ?? []).map((i) => ({ value: i.value, label: islandText(i) }))}
            />
          ) : (
            <TextInput
              value={value.island ?? ""}
              onChange={(e) => set({ island: e.target.value || undefined })}
              thaana={thaana}
              autoComplete="address-level2"
            />
          )}
        </FormField>
        <FormField
          id={`${id}-road`}
          label={t("map.road")}
          name={fieldName("road")}
          error={errors?.road}
          labelLayout={labelLayout}
          className={classNames?.field}
        >
          <TextInput
            value={value.road ?? ""}
            onChange={(e) => set({ road: e.target.value || undefined })}
            thaana={thaana}
            autoComplete="address-line2"
          />
        </FormField>
        <FormField
          id={`${id}-house`}
          label={t("map.house")}
          name={fieldName("house")}
          error={errors?.house}
          labelLayout={labelLayout}
          className={classNames?.field}
        >
          <TextInput
            value={value.house ?? ""}
            onChange={(e) => set({ house: e.target.value || undefined })}
            thaana={thaana}
            autoComplete="address-line1"
          />
        </FormField>
      </div>
      {pin ? (
        <FormField
          id={`${id}-location`}
          label={t("map.mapPin")}
          name={name ? `${name}[location]` : undefined}
          error={errors?.location}
          labelLayout={labelLayout}
          className={classNames?.map}
        >
          <MapPicker
            // Re-centre on the chosen island until a pin is placed.
            key={value.location ? "pinned" : `${value.atoll ?? ""}-${value.island ?? ""}`}
            value={value.location ?? null}
            onChange={(location) => set({ location })}
            center={pinCenter}
            zoom={island ? 14 : atoll ? 10 : 11}
            search={search}
            thaana={thaana}
            locate
          />
        </FormField>
      ) : null}
    </fieldset>
  )
}

function AddressSelect({
  value,
  onChange,
  placeholder,
  options,
  ...props
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  id?: string
  name?: string
}) {
  // Picks up id, name and ARIA wiring from the surrounding FormField.
  const control = useFormFieldControl(props)
  return (
    <NativeSelect className="w-full" value={value} onChange={(e) => onChange(e.target.value)} {...control}>
      <NativeSelectOption value="">{placeholder}</NativeSelectOption>
      {options.map((o) => (
        <NativeSelectOption key={o.value} value={o.value}>
          {o.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}
