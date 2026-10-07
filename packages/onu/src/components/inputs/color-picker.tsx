"use client"

import * as React from "react"
import {
  ColorArea,
  ColorField,
  ColorPicker as AriaColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  ColorThumb,
  I18nProvider,
  Input as AriaInput,
  SliderTrack,
  parseColor,
  type Color,
} from "react-aria-components"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useFormFieldControl } from "../form/form-field"
import { PickerSurface } from "./_picker-surface"
import { useControllableState } from "./_shared"

/** Default swatches: a neutral range plus Onu's chart palette hues. */
export const DEFAULT_COLOUR_PRESETS = [
  "#0f172a",
  "#64748b",
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#16a34a",
  "#1f7a4d",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#c026d3",
  "#db2777",
]

/** Normalises any CSS hex / rgb / hsl string to `#rrggbb`, or `null` when it cannot be parsed. */
export function toHex(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    return parseColor(value).toString("hex").toLowerCase()
  } catch {
    return null
  }
}

export interface ColorPickerProps extends Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "type"
> {
  /** Controlled value as a hex string (`#1f7a4d`), or `null` for none. */
  value?: string | null
  defaultValue?: string | null
  /** Called with a lowercase `#rrggbb` string. */
  onValueChange?: (hex: string) => void
  /** Swatches shown under the picker. Pass `[]` to hide them. */
  presets?: string[]
  /** Text shown when there is no value. */
  placeholder?: string
  /** Form field name; the hex value is submitted through a hidden input. */
  name?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  classNames?: { trigger?: string; panel?: string; area?: string; slider?: string; field?: string; swatches?: string }
}

const thumb =
  "size-5 rounded-full border-2 border-background shadow-md ring-1 ring-foreground/40 data-focus-visible:size-6 data-focus-visible:ring-2 data-focus-visible:ring-ring"

/**
 * Colour picker: a trigger showing the swatch and hex value, opening a panel
 * with a saturation/brightness area, a hue slider, a hex field and preset
 * swatches (React Aria colour components). Opens as a bottom sheet on phones.
 * The value is a hex string.
 */
export function ColorPicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  presets = DEFAULT_COLOUR_PRESETS,
  placeholder,
  name: nameProp,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  classNames,
  ...props
}: ColorPickerProps) {
  const { t, locale } = useTranslation()
  const [value, setValue] = useControllableState<string | null>(valueProp, defaultValue, (v) => {
    if (v) onValueChange?.(v)
  })
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange)
  const { name, ...control } = useFormFieldControl({ ...props, name: nameProp })
  const hex = toHex(value)
  const color = React.useMemo(() => parseColor(hex ?? "#1f7a4d").toFormat("hsb"), [hex])
  const label = hex ? hex.toUpperCase() : (placeholder ?? t("input.noColour"))

  const onChange = (next: Color) => {
    const nextHex = next.toString("hex").toLowerCase()
    if (nextHex !== hex) setValue(nextHex)
  }

  return (
    <I18nProvider locale={locale.code}>
      <AriaColorPicker value={color} onChange={onChange}>
        <PickerSurface
          open={open}
          onOpenChange={setOpen}
          title={t("input.pickColour")}
          className={cn("w-64 touch:w-full", classNames?.panel)}
          trigger={
            <button
              type="button"
              data-slot="color-picker"
              data-empty={!hex || undefined}
              {...control}
              aria-label={control["aria-label"]}
              aria-haspopup="dialog"
              className={cn(
                "h-8 gap-2 ps-1 pe-2.5 text-sm min-w-36 inline-flex items-center rounded-lg border border-input bg-transparent transition-colors outline-none dark:bg-input/30",
                "hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
                "touch:h-11",
                classNames?.trigger,
                className,
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-6 shrink-0 rounded-md ring-1 ring-foreground/15 ring-inset",
                  !hex && "bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-size-[8px_8px]",
                )}
                style={hex ? { backgroundColor: hex } : undefined}
              />
              <span dir="ltr" className={cn("flex-1 text-start font-mono", !hex && "font-sans text-muted-foreground")}>
                {label}
              </span>
              <Icon name="chevron-down" className="size-4 text-muted-foreground" />
            </button>
          }
        >
          <ColorArea
            colorSpace="hsb"
            xChannel="saturation"
            yChannel="brightness"
            aria-label={t("input.colourArea")}
            className={cn("h-40 touch:h-56 w-full rounded-md", classNames?.area)}
          >
            <ColorThumb className={thumb} />
          </ColorArea>
          <ColorSlider colorSpace="hsb" channel="hue" aria-label={t("input.hue")} className={classNames?.slider}>
            <SliderTrack className="h-6 touch:h-10 rounded-md">
              <ColorThumb className={cn(thumb, "top-1/2")} />
            </SliderTrack>
          </ColorSlider>
          <ColorField aria-label={t("input.hex")} className={cn("grid", classNames?.field)}>
            <AriaInput
              dir="ltr"
              className="h-8 px-2.5 text-sm touch:h-11 w-full rounded-lg border border-input bg-transparent font-mono uppercase outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </ColorField>
          {presets.length ? (
            <ColorSwatchPicker
              aria-label={t("input.presets")}
              className={cn("gap-1.5 grid grid-cols-6", classNames?.swatches)}
            >
              {presets.map((preset) => (
                <ColorSwatchPickerItem
                  key={preset}
                  color={preset}
                  className="aspect-square rounded-md outline-none data-focus-visible:ring-3 data-focus-visible:ring-ring/50 data-selected:ring-2 data-selected:ring-foreground"
                >
                  <ColorSwatch className="size-full rounded-md ring-1 ring-foreground/15 ring-inset" />
                </ColorSwatchPickerItem>
              ))}
            </ColorSwatchPicker>
          ) : null}
        </PickerSurface>
      </AriaColorPicker>
      {name ? <input type="hidden" name={name} value={hex ?? ""} /> : null}
    </I18nProvider>
  )
}
