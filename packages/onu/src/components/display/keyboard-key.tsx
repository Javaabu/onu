"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Kbd, KbdGroup } from "../../ui/kbd"

export type KeyPlatform = "mac" | "other"

/** Best guess at whether shortcuts should use ⌘ (Apple platforms). SSR-safe: `other` on the server. */
export function detectPlatform(): KeyPlatform {
  if (typeof navigator === "undefined") return "other"
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent
  return /mac|iphone|ipad|ipod/i.test(platform) ? "mac" : "other"
}

interface KeyInfo {
  /** What is shown on the key. */
  symbol: string
  /** Locale key for the spoken name, when the symbol is not a plain letter. */
  spoken?: string
}

function describeKey(raw: string, platform: KeyPlatform): KeyInfo {
  const key = raw.trim().toLowerCase()
  const mac = platform === "mac"
  switch (key) {
    case "mod":
      return mac ? { symbol: "⌘", spoken: "display.keyCommand" } : { symbol: "Ctrl", spoken: "display.keyControl" }
    case "cmd":
    case "command":
    case "meta":
      return mac ? { symbol: "⌘", spoken: "display.keyCommand" } : { symbol: "Win" }
    case "ctrl":
    case "control":
      return mac ? { symbol: "⌃", spoken: "display.keyControl" } : { symbol: "Ctrl", spoken: "display.keyControl" }
    case "alt":
    case "option":
    case "opt":
      return mac ? { symbol: "⌥", spoken: "display.keyOption" } : { symbol: "Alt", spoken: "display.keyAlt" }
    case "shift":
      return mac ? { symbol: "⇧", spoken: "display.keyShift" } : { symbol: "Shift", spoken: "display.keyShift" }
    case "enter":
    case "return":
      return { symbol: "↵", spoken: "display.keyEnter" }
    case "esc":
    case "escape":
      return { symbol: "Esc", spoken: "display.keyEscape" }
    case "tab":
      return { symbol: "⇥", spoken: "display.keyTab" }
    case "backspace":
      return { symbol: "⌫", spoken: "display.keyBackspace" }
    case "delete":
    case "del":
      return { symbol: "Del", spoken: "display.keyDelete" }
    case "space":
      return { symbol: "␣", spoken: "display.keySpace" }
    case "up":
    case "arrowup":
      return { symbol: "↑", spoken: "display.keyUp" }
    case "down":
    case "arrowdown":
      return { symbol: "↓", spoken: "display.keyDown" }
    case "left":
    case "arrowleft":
      return { symbol: "←", spoken: "display.keyLeft" }
    case "right":
    case "arrowright":
      return { symbol: "→", spoken: "display.keyRight" }
    default:
      return { symbol: raw.trim().length === 1 ? raw.trim().toUpperCase() : raw.trim() }
  }
}

/**
 * Formats a shortcut such as `"mod+k"` for a platform: `"⌘K"` on Apple devices,
 * `"Ctrl+K"` elsewhere. Separate sequential steps with a space (`"g d"`).
 */
export function formatShortcut(shortcut: string, platform: KeyPlatform = detectPlatform()): string {
  return shortcut
    .split(/\s+/)
    .filter(Boolean)
    .map((step) =>
      splitCombo(step)
        .map((k) => describeKey(k, platform).symbol)
        .join(platform === "mac" ? "" : "+"),
    )
    .join(" ")
}

const noopSubscribe = () => () => {}
const serverPlatform = (): KeyPlatform => "other"

function splitCombo(step: string): string[] {
  // "+" on its own (e.g. "ctrl++") is a key, not a separator.
  return step.split(/\+(?!$)/).map((k) => (k === "" ? "+" : k))
}

export interface KeyboardKeyProps extends Omit<React.ComponentProps<"kbd">, "children"> {
  /**
   * A key or combination: `"k"`, `"mod+k"`, `"ctrl+shift+p"`, or a sequence `"g d"`.
   * `mod` is ⌘ on Apple platforms and Ctrl elsewhere.
   */
  keys?: string
  /** Render custom key content instead of `keys`. */
  children?: React.ReactNode
  /** Force a platform instead of detecting it. */
  platform?: KeyPlatform
  classNames?: { key?: string; separator?: string }
}

/**
 * Shows a keyboard key or shortcut using shadcn's `Kbd`. Combos adapt to the
 * platform (⌘K on macOS/iOS, Ctrl+K on Windows/Linux) and screen readers hear
 * the key names ("Command K"), not the symbols.
 */
export function KeyboardKey({
  keys,
  children,
  platform: platformProp,
  className,
  classNames,
  ...props
}: KeyboardKeyProps) {
  const { t } = useTranslation()
  const detected = React.useSyncExternalStore(noopSubscribe, detectPlatform, serverPlatform)
  const platform = platformProp ?? detected

  if (keys === undefined) {
    return (
      <Kbd data-slot="keyboard-key" className={cn(classNames?.key, className)} {...props}>
        {children}
      </Kbd>
    )
  }

  const steps = keys
    .split(/\s+/)
    .filter(Boolean)
    .map((step) => splitCombo(step).map((k) => describeKey(k, platform)))
  const spoken = steps
    .map((step) => step.map((k) => (k.spoken ? t(k.spoken) : k.symbol)).join(" "))
    .join(`, ${t("display.keyThen")} `)

  return (
    <KbdGroup
      data-slot="keyboard-key"
      data-platform={platform}
      className={className}
      {...(props as React.ComponentProps<"div">)}
    >
      <span className="sr-only">{spoken}</span>
      {steps.map((step, s) => (
        <React.Fragment key={s}>
          {s > 0 ? (
            <span aria-hidden className={cn("text-xs text-muted-foreground", classNames?.separator)}>
              {t("display.keyThen")}
            </span>
          ) : null}
          {step.map((k, i) => (
            <React.Fragment key={i}>
              {i > 0 && platform !== "mac" ? (
                <span aria-hidden className={cn("text-xs text-muted-foreground", classNames?.separator)}>
                  +
                </span>
              ) : null}
              <Kbd aria-hidden dir="ltr" className={cn(classNames?.key)}>
                {k.symbol}
              </Kbd>
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </KbdGroup>
  )
}
