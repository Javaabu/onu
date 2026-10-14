"use client"

import * as React from "react"
import PhoneInputWithCountry, {
  getCountries,
  getCountryCallingCode,
  type Country,
  type Labels,
} from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../ui/command"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../../ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { useFormFieldControl } from "../form/form-field"
import { useControllableState } from "./_shared"
import { registerEnglish } from "../../i18n/english"
import { input as en_input } from "../../locales/en/input"

registerEnglish({ input: en_input })

export type { Country as PhoneCountry }

export interface PhoneInputProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> {
  /** Controlled value in E.164 format, e.g. `"+9607771234"`. */
  value?: string
  defaultValue?: string
  /** Called with the E.164 value, or `undefined` when empty or incomplete. */
  onValueChange?: (value: string | undefined) => void
  /** Country used for numbers typed without a `+` prefix. Default `"MV"`. */
  defaultCountry?: Country
  /** Limit the country list. */
  countries?: Country[]
  /** Show the country select. Default `true`. */
  countrySelect?: boolean
  /** Add an "International" choice to the country list for numbers of any country. Default `false`. */
  allowInternational?: boolean
  /** Always show and require the international format (`+960 777 1234`). */
  international?: boolean
  onCountryChange?: (country?: Country) => void
  classNames?: { root?: string; input?: string; countryTrigger?: string; countryContent?: string }
}

function Flag({ country, label }: { country?: Country; label?: string }) {
  const Svg = country ? flags[country] : undefined
  if (!Svg) return <Icon name="globe" className="size-4 text-muted-foreground" />
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-foreground/10 [&_svg]:size-full"
    >
      <Svg title={label ?? country ?? ""} />
    </span>
  )
}

function useCountryLabels(code: string): Labels {
  const { t } = useTranslation()
  return React.useMemo(() => {
    const labels: Labels = { country: t("input.country"), phone: t("input.phone"), ZZ: t("input.international") }
    const english = new Intl.DisplayNames(["en"], { type: "region" })
    let local: Intl.DisplayNames | undefined
    try {
      local = new Intl.DisplayNames([code, "en"], { type: "region", fallback: "none" })
    } catch {
      local = undefined
    }
    for (const c of getCountries()) labels[c] = local?.of(c) ?? english.of(c) ?? c
    return labels
  }, [code, t])
}

interface CountrySelectProps {
  value?: Country
  onChange: (country?: Country) => void
  options: { value?: Country; label: string; divider?: boolean }[]
  disabled?: boolean
  readOnly?: boolean
  onFocus?: React.FocusEventHandler
  onBlur?: React.FocusEventHandler
  "aria-label"?: string
  classNames?: PhoneInputProps["classNames"]
}

function CountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  onFocus,
  onBlur,
  classNames,
}: CountrySelectProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const current = options.find((o) => o.value === value)
  const name = current?.label ?? t("input.international")
  return (
    // The popover sits outside the addon: the addon's click handler focuses the input,
    // and React events from the portalled list would bubble to it.
    <Popover open={open} onOpenChange={setOpen}>
      <InputGroupAddon align="inline-start" className="ps-1">
        <PopoverTrigger asChild>
          <InputGroupButton
            size="xs"
            data-slot="phone-country"
            aria-label={`${t("input.country")}: ${name}`}
            disabled={disabled || readOnly}
            onFocus={onFocus}
            onBlur={onBlur}
            className={cn("h-6 gap-1 px-1.5 touch:min-h-11", classNames?.countryTrigger)}
          >
            <Flag country={value} label={name} />
            {value ? <span className="text-muted-foreground tabular-nums">+{getCountryCallingCode(value)}</span> : null}
            <Icon name="chevron-down" className="size-3 opacity-60" />
          </InputGroupButton>
        </PopoverTrigger>
      </InputGroupAddon>
      <PopoverContent
        align="start"
        className={cn("w-72 p-0", classNames?.countryContent)}
        aria-label={t("input.country")}
      >
        <Command>
          <CommandInput placeholder={t("input.searchCountries")} aria-label={t("input.searchCountries")} />
          <CommandList>
            <CommandEmpty>{t("input.noCountries")}</CommandEmpty>
            <CommandGroup>
              {options
                .filter((o) => !o.divider)
                .map((o) => {
                  const code = o.value ? `+${getCountryCallingCode(o.value)}` : ""
                  return (
                    <CommandItem
                      key={o.value ?? "ZZ"}
                      value={`${o.label} ${o.value ?? ""} ${code}`}
                      data-country={o.value ?? "ZZ"}
                      onSelect={() => {
                        onChange(o.value)
                        setOpen(false)
                      }}
                      className="touch:min-h-11"
                    >
                      <Flag country={o.value} label={o.label} />
                      <span className="flex-1 truncate">{o.label}</span>
                      <span dir="ltr" className="text-muted-foreground tabular-nums">
                        {code}
                      </span>
                      {o.value === value ? <Icon name="check" className="size-4" /> : null}
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

/** The library forwards `ref` to the `<input>`, but its typings describe a class component. */
const PhoneField = PhoneInputWithCountry as unknown as React.ComponentType<
  Omit<React.ComponentProps<typeof PhoneInputWithCountry>, "ref"> & { ref?: React.Ref<HTMLInputElement> }
>

function NoCountrySelect() {
  return null
}

function Container({ className, style, children }: React.ComponentProps<"div">) {
  return (
    <InputGroup dir="ltr" data-slot="phone-input" className={className} style={style}>
      {children}
    </InputGroup>
  )
}

/**
 * International phone number input (react-phone-number-input) with a
 * searchable country picker. Defaults to the Maldives (+960), formats as you
 * type, is always left-to-right, and gives an E.164 value (`+9607771234`).
 */
export function PhoneInput({
  value: valueProp,
  defaultValue,
  onValueChange,
  defaultCountry = "MV",
  countries,
  countrySelect = true,
  allowInternational = false,
  international,
  onCountryChange,
  className,
  classNames,
  ...props
}: PhoneInputProps) {
  const { locale } = useTranslation()
  const [value, setValue] = useControllableState<string | undefined>(valueProp, defaultValue, onValueChange)
  const controlProps = useFormFieldControl(props)
  const labels = useCountryLabels(locale.code)

  return (
    <PhoneField
      {...controlProps}
      value={value ?? ""}
      onChange={(next?: string) => setValue(next || undefined)}
      defaultCountry={defaultCountry}
      countries={countries}
      international={international}
      onCountryChange={onCountryChange}
      labels={labels}
      flags={flags}
      addInternationalOption={allowInternational}
      countrySelectComponent={countrySelect ? CountrySelect : NoCountrySelect}
      countrySelectProps={{ classNames }}
      containerComponent={Container}
      inputComponent={InputGroupInput}
      numberInputProps={{ className: cn("tabular-nums", classNames?.input), dir: "ltr" }}
      autoComplete={props.autoComplete ?? "tel"}
      inputMode="tel"
      className={cn(classNames?.root, className)}
    />
  )
}
