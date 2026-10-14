"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useTheme, type Theme } from "../../providers/theme-provider"
import { Button } from "../../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { registerEnglish } from "../../i18n/english"
import { layout as en_layout } from "../../locales/en/layout"

registerEnglish({ layout: en_layout })

export interface ThemeToggleProps {
  /**
   * `menu`: icon button with a Light / Dark / System menu (default).
   * `segmented`: three toggle buttons. `cycle`: one button that cycles through the themes.
   */
  variant?: "menu" | "segmented" | "cycle"
  /** Offer the System option. */
  showSystem?: boolean
  size?: "sm" | "default"
  className?: string
}

const ICONS: Record<Theme, string> = { light: "sun", dark: "moon", system: "monitor" }
const KEYS: Record<Theme, string> = {
  light: "layout.themeLight",
  dark: "layout.themeDark",
  system: "layout.themeSystem",
}

/**
 * Light / dark / system switch using `useTheme()` (R10.3). The choice is
 * persisted by `ThemeProvider` and announced to screen readers.
 */
export function ThemeToggle({ variant = "menu", showSystem = true, size = "default", className }: ThemeToggleProps) {
  const { t } = useTranslation()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [announcement, setAnnouncement] = React.useState("")
  const themes: Theme[] = showSystem ? ["light", "dark", "system"] : ["light", "dark"]
  const label = t("layout.theme")

  const choose = (next: Theme) => {
    setTheme(next)
    setAnnouncement(t("layout.themeChanged", { theme: t(KEYS[next]) }))
  }

  const live = (
    <span role="status" className="sr-only">
      {announcement}
    </span>
  )

  if (variant === "segmented") {
    return (
      <>
        <ToggleGroup
          type="single"
          variant="outline"
          size={size}
          value={theme}
          onValueChange={(v) => v && choose(v as Theme)}
          aria-label={label}
          data-slot="theme-toggle"
          className={className}
        >
          {themes.map((name) => (
            <ToggleGroupItem
              key={name}
              value={name}
              aria-label={t(KEYS[name])}
              className="touch:min-h-11 touch:min-w-11"
            >
              <Icon name={ICONS[name]} />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {live}
      </>
    )
  }

  const iconSize = size === "sm" ? "icon-sm" : "icon"
  const current = theme === "system" ? resolvedTheme : theme

  if (variant === "cycle") {
    const next = themes[(themes.indexOf(theme) + 1) % themes.length] ?? "light"
    return (
      <>
        <Button
          variant="ghost"
          size={iconSize}
          data-slot="theme-toggle"
          aria-label={`${label}: ${t(KEYS[theme])}`}
          onClick={() => choose(next)}
          className={cn("touch:size-11", className)}
        >
          <Icon name={ICONS[theme]} />
        </Button>
        {live}
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={iconSize}
            data-slot="theme-toggle"
            aria-label={`${label}: ${t(KEYS[theme])}`}
            className={cn("touch:size-11", className)}
          >
            <Icon name={ICONS[current]} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-36 w-auto">
          <DropdownMenuRadioGroup value={theme} onValueChange={(v) => choose(v as Theme)}>
            {themes.map((name) => (
              <DropdownMenuRadioItem key={name} value={name} className="touch:min-h-11">
                <Icon name={ICONS[name]} />
                {t(KEYS[name])}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {live}
    </>
  )
}
