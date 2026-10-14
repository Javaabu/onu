"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { useControllableState } from "./_shared"
import { NumberInput, type NumberInputProps } from "./number-input"
import { registerEnglish } from "../../i18n/english"
import { input as en_input } from "../../locales/en/input"

registerEnglish({ input: en_input })

export interface UnitOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

export interface UnitInputProps extends Omit<NumberInputProps, "startAddon" | "endAddon"> {
  /** A fixed unit shown beside the number, e.g. `"kg"` or `"MVR"`. */
  unit?: React.ReactNode
  /** Choosable units. Renders a unit select instead of fixed text. */
  units?: UnitOption[]
  /** Controlled selected unit. */
  unitValue?: string
  defaultUnit?: string
  onUnitChange?: (unit: string) => void
  /** Form field name for the selected unit. */
  unitName?: string
  /** Accessible name of the unit select. Defaults to "Unit". */
  unitLabel?: string
  /** Which side the unit sits on. Default `"end"`. */
  unitPosition?: "start" | "end"
  classNames?: NumberInputProps["classNames"] & { unit?: string; unitTrigger?: string }
}

/**
 * A number with a unit add-on: fixed text (`kg`, `MVR`, `%`) or a unit
 * select (`cm` / `m` / `km`). The unit sits at the inline end by default.
 */
export function UnitInput({
  unit,
  units,
  unitValue,
  defaultUnit,
  onUnitChange,
  unitName,
  unitLabel,
  unitPosition = "end",
  classNames,
  ...props
}: UnitInputProps) {
  const { t } = useTranslation()
  const [selected, setSelected] = useControllableState<string>(
    unitValue,
    defaultUnit ?? units?.[0]?.value ?? "",
    onUnitChange,
  )

  const addon = units?.length ? (
    <Select value={selected} onValueChange={setSelected} name={unitName} disabled={props.disabled}>
      <SelectTrigger
        size="sm"
        data-slot="unit-select"
        aria-label={unitLabel ?? t("input.unit")}
        className={cn(
          "h-7 gap-1 px-2 text-sm font-normal border-0 bg-transparent text-foreground shadow-none dark:bg-transparent",
          "touch:min-h-11",
          classNames?.unitTrigger,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {units.map((u) => (
          <SelectItem key={u.value} value={u.value} disabled={u.disabled}>
            {u.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : unit !== undefined ? (
    <span data-slot="unit" className={cn("text-muted-foreground", classNames?.unit)}>
      {unit}
    </span>
  ) : null

  return (
    <NumberInput
      {...props}
      classNames={classNames}
      startAddon={unitPosition === "start" ? addon : undefined}
      endAddon={unitPosition === "end" ? addon : undefined}
    />
  )
}
