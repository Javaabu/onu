"use client"

import * as React from "react"
import { Toaster as Sonner, toast as sonnerToast, type ExternalToast, type ToasterProps as SonnerProps } from "sonner"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { useTheme } from "../../providers/theme-provider"

/** Logical positions: `start` / `end` follow the reading direction (they flip in RTL). */
export type ToastPosition = "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end"

type PhysicalPosition = NonNullable<SonnerProps["position"]>

/** Maps a logical position to sonner's physical one for a direction. */
export function resolveToastPosition(position: ToastPosition, dir: "ltr" | "rtl"): PhysicalPosition {
  const [y, x] = position.split("-") as ["top" | "bottom", "start" | "center" | "end"]
  if (x === "center") return `${y}-center`
  const left = (x === "start") === (dir === "ltr")
  return `${y}-${left ? "left" : "right"}`
}

export interface ToasterProps extends Omit<SonnerProps, "position" | "dir" | "theme"> {
  /** Where toasts appear. `start`/`end` flip in RTL. Default `bottom-end`. */
  position?: ToastPosition
  /** Override the theme; defaults to the resolved theme from `ThemeProvider`. */
  theme?: SonnerProps["theme"]
}

/**
 * Renders toasts. Place once near the root of the app, inside `OnuProvider`
 * (and `ThemeProvider`). Follows the theme, the reading direction (positions
 * and swipe flip in RTL), the Dhivehi font and Onu's semantic icons.
 */
export function Toaster({ position = "bottom-end", theme, className, toastOptions, icons, ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme()
  const { dir, locale, t } = useOnu()

  return (
    <Sonner
      theme={theme ?? resolvedTheme}
      dir={dir}
      position={resolveToastPosition(position, dir)}
      containerAriaLabel={t("display.notifications")}
      className={cn("toaster group", className)}
      icons={{
        success: <Icon name="success" className="size-4 text-success" />,
        info: <Icon name="info" className="size-4 text-info" />,
        warning: <Icon name="warning" className="size-4 text-warning" />,
        error: <Icon name="error" className="size-4 text-destructive" />,
        loading: <Icon name="loading" className="size-4 animate-spin" />,
        close: <Icon name="close" className="size-3" />,
        ...icons,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          fontFamily: "var(--onu-font-sans)",
        } as React.CSSProperties
      }
      toastOptions={{
        closeButtonAriaLabel: t("common.close"),
        ...toastOptions,
        classNames: {
          toast: cn("font-sans", locale.code === "dv" && "font-thaana"),
          description: "text-muted-foreground!",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}

export type ToastOptions = ExternalToast

/**
 * Shows a toast. Same API as sonner's `toast`:
 * `toast("Saved")`, `toast.success(…)`, `toast.error(…)`, `toast.warning(…)`,
 * `toast.info(…)`, `toast.promise(promise, { loading, success, error })`,
 * `toast.dismiss(id)`.
 */
export const toast = sonnerToast
