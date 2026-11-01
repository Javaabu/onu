"use client"

import * as React from "react"

import { useControllableState } from "../../hooks/use-controllable-state"
import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { BUILT_IN_LOCALES } from "../../locales/base"
import { Button } from "../../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { NativeSelect, NativeSelectOption } from "../../ui/native-select"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { registerEnglish } from "../../i18n/english"
import { layout as en_layout } from "../../locales/en/layout"

registerEnglish({ layout: en_layout })

export interface LanguageOption {
  /** BCP 47 code, e.g. `en`, `dv`. */
  code: string
  /** Native name, e.g. "English", "ދިވެހި". */
  name: string
  dir?: "ltr" | "rtl"
}

export interface LanguageSwitcherProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "defaultValue" | "onChange"
> {
  /** Selected language code. Defaults to the active `OnuProvider` locale. */
  value?: string
  /** Initial language when uncontrolled. Without it (and `value`), follows the active locale. */
  defaultValue?: string
  onValueChange?: (code: string) => void
  /** Languages to offer. Defaults to the built-in locales (English, ދިވެހި). */
  languages?: LanguageOption[]
  /** `select` (native select), `toggle` (segmented buttons) or `menu` (globe button + menu). */
  variant?: "select" | "toggle" | "menu"
  size?: "sm" | "default"
  /** Show the globe icon next to the select or in the menu button. */
  showIcon?: boolean
  disabled?: boolean
  /** The root: a wrapper `div` with `select`, the button group with `toggle`, a button with `menu`. */
  ref?: React.Ref<HTMLElement>
  dir?: "ltr" | "rtl"
  className?: string
  classNames?: {
    root?: string
    icon?: string
    label?: string
    select?: string
    item?: string
    content?: string
  }
  /** With `select`, the id of the `<select>`. Otherwise the root's id. */
  id?: string
}

const DEFAULT_LANGUAGES: LanguageOption[] = BUILT_IN_LOCALES.map((l) => ({
  code: l.code,
  name: l.name,
  dir: l.dir,
}))

/**
 * Switches between languages using their native names (each option carries its
 * own `lang` and `dir`, R14.12). Call `onValueChange` to update `OnuProvider locale`.
 */
export function LanguageSwitcher({
  value,
  defaultValue,
  onValueChange,
  languages = DEFAULT_LANGUAGES,
  variant = "select",
  size = "default",
  showIcon = true,
  disabled,
  className,
  classNames,
  id,
  ref,
  ...props
}: LanguageSwitcherProps) {
  const { t, locale } = useTranslation()
  const [current, setCurrent] = useControllableState(
    value ?? (defaultValue === undefined ? locale.code : undefined),
    defaultValue ?? locale.code,
    onValueChange,
  )
  const label = t("layout.language")
  const autoId = React.useId()
  const currentLanguage = languages.find((l) => l.code === current)

  if (variant === "toggle") {
    return (
      <ToggleGroup
        ref={ref as React.Ref<HTMLDivElement>}
        id={id}
        type="single"
        variant="outline"
        size={size}
        value={current}
        onValueChange={(v) => v && setCurrent(v)}
        aria-label={label}
        disabled={disabled}
        data-slot="language-switcher"
        className={cn(classNames?.root, className)}
        {...props}
      >
        {languages.map((language) => (
          <ToggleGroupItem
            key={language.code}
            value={language.code}
            lang={language.code}
            dir={language.dir}
            className={cn("px-3 touch:min-h-11", classNames?.item)}
          >
            {language.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    )
  }

  if (variant === "menu") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={ref as React.Ref<HTMLButtonElement>}
            id={id}
            variant="ghost"
            size={size === "sm" ? "sm" : "default"}
            disabled={disabled}
            data-part="language-switcher"
            aria-label={`${label}: ${currentLanguage?.name ?? current}`}
            className={cn("touch:min-h-11", classNames?.root, className)}
            {...props}
          >
            {showIcon ? <Icon name="languages" className={classNames?.icon} /> : null}
            <span lang={currentLanguage?.code} dir={currentLanguage?.dir} className={classNames?.label}>
              {currentLanguage?.name ?? current}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn("min-w-40 w-auto", classNames?.content)}>
          <DropdownMenuRadioGroup value={current} onValueChange={setCurrent}>
            {languages.map((language) => (
              <DropdownMenuRadioItem
                key={language.code}
                value={language.code}
                lang={language.code}
                dir={language.dir}
                className={cn("touch:min-h-11", classNames?.item)}
              >
                {language.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const selectId = id ?? autoId
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      data-slot="language-switcher"
      className={cn("gap-2 inline-flex items-center", classNames?.root, className)}
      {...props}
    >
      {showIcon ? <Icon name="languages" className={cn("size-4 text-muted-foreground", classNames?.icon)} /> : null}
      <label htmlFor={selectId} className={cn("sr-only", classNames?.label)}>
        {label}
      </label>
      <NativeSelect
        id={selectId}
        size={size}
        value={current}
        disabled={disabled}
        onChange={(e) => setCurrent(e.target.value)}
        className={cn("touch:[&_select]:h-11", classNames?.select)}
      >
        {languages.map((language) => (
          <NativeSelectOption
            key={language.code}
            value={language.code}
            lang={language.code}
            dir={language.dir}
            className={classNames?.item}
          >
            {language.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}
