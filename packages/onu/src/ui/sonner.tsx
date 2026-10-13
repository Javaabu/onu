"use client"

// Vendored from shadcn/ui (radix base, nova style, RTL) by scripts/sync-shadcn.mjs.
// Onu changes are marked with "onu:" comments; keep them when re-syncing.

import { useTheme } from "../providers/theme-provider"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// onu: fixed glyphs passed as Icon fallbacks, so primitives work without OnuProvider and the full icon map.
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react"
import { Icon } from "../icons/icon"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <Icon name="success" fallback={CircleCheckIcon} className="size-4" />,
        info: <Icon name="info" fallback={InfoIcon} className="size-4" />,
        warning: <Icon name="warning" fallback={TriangleAlertIcon} className="size-4" />,
        error: <Icon name="error" fallback={OctagonXIcon} className="size-4" />,
        loading: <Icon name="loading" fallback={Loader2Icon} className="size-4 animate-spin" />,
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
