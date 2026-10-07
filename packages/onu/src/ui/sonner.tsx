"use client"

// Vendored from shadcn/ui (radix base, nova style, RTL) by scripts/sync-shadcn.mjs.
// Onu changes are marked with "onu:" comments; keep them when re-syncing.

import { useTheme } from "../providers/theme-provider"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { Icon } from "../icons/icon"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <Icon name="success" className="size-4" />
        ),
        info: (
          <Icon name="info" className="size-4" />
        ),
        warning: (
          <Icon name="warning" className="size-4" />
        ),
        error: (
          <Icon name="error" className="size-4" />
        ),
        loading: (
          <Icon name="loading" className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
