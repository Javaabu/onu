"use client"

import * as React from "react"

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

export interface LanguageSwitcherProps {
  /** Selected language code. Defaults to the active `OnuProvider` locale. */
  value?: string
  onChange?: (code: string) => void
  /** Languages to offer. Defaults to the built-in locales (English, ދިވެހި). */
  languages?: LanguageOption[]
  /** `select` (native select), `toggle` (segmented buttons) or `menu` (globe button + menu). */
  variant?: "select" | "toggle" | "menu"
  size?: "sm" | "default"
  /** Show the globe icon next to the select or in the menu button. */
  showIcon?: boolean
  disabled?: boolean
  className?: string
  id?: string
}

const DEFAULT_LANGUAGES: LanguageOption[] = BUILT_IN_LOCALES.map((l) => ({
  code: l.code,
  name: l.name,
  dir: l.dir,
}))

/**
 * Switches between languages using their native names (each option carries its
 * own `lang` and `dir`, R14.12). Call `onChange` to update `OnuProvider locale`.
 */
export function LanguageSwitcher({
  value,
  onChange,
  languages = DEFAULT_LANGUAGES,
  variant = "select",
  size = "default",
  showIcon = true,
  disabled,
  className,
  id,
}: LanguageSwitcherProps) {
  const { t, locale } = useTranslation()
  const current = value ?? locale.code
  const label = t("layout.language")
  const autoId = React.useId()
  const currentLanguage = languages.find((l) => l.code === current)

  if (variant === "toggle") {
    return (
      <ToggleGroup
        type="single"
        variant="outline"
        size={size}
        value={current}
        onValueChange={(v) => v && onChange?.(v)}
        aria-label={label}
        disabled={disabled}
        data-slot="language-switcher"
        className={className}
      >
        {languages.map((language) => (
          <ToggleGroupItem
            key={language.code}
            value={language.code}
            lang={language.code}
            dir={language.dir}
            className="px-3 touch:min-h-11"
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
            variant="ghost"
            size={size === "sm" ? "sm" : "default"}
            disabled={disabled}
            data-slot="language-switcher"
            aria-label={`${label}: ${currentLanguage?.name ?? current}`}
            className={cn("touch:min-h-11", className)}
          >
            {showIcon ? <Icon name="languages" /> : null}
            <span lang={currentLanguage?.code} dir={currentLanguage?.dir}>
              {currentLanguage?.name ?? current}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40 w-auto">
          <DropdownMenuRadioGroup value={current} onValueChange={(v) => onChange?.(v)}>
            {languages.map((language) => (
              <DropdownMenuRadioItem
                key={language.code}
                value={language.code}
                lang={language.code}
                dir={language.dir}
                className="touch:min-h-11"
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
    <div data-slot="language-switcher" className={cn("gap-2 inline-flex items-center", className)}>
      {showIcon ? <Icon name="languages" className="size-4 text-muted-foreground" /> : null}
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <NativeSelect
        id={selectId}
        size={size}
        value={current}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="touch:[&_select]:h-11"
      >
        {languages.map((language) => (
          <NativeSelectOption key={language.code} value={language.code} lang={language.code} dir={language.dir}>
            {language.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}
