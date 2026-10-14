"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { registerEnglish } from "../../i18n/english"
import { layout as en_layout } from "../../locales/en/layout"

registerEnglish({ layout: en_layout })

export interface SkipLinkProps extends React.ComponentProps<"a"> {
  /** Target of the skip link. Defaults to `#main-content` (the id `AppLayout` gives `<main>`). */
  href?: string
}

/**
 * "Skip to content" link (R14.4). Render it as the first focusable element on the
 * page: it is hidden until focused, then moves focus to the main content.
 */
export function SkipLink({ href = "#main-content", className, children, onClick, ...props }: SkipLinkProps) {
  const { t } = useTranslation()

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented || !href.startsWith("#")) return
    const target = document.getElementById(decodeURIComponent(href.slice(1)))
    if (!target) return
    event.preventDefault()
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1")
    target.focus()
    target.scrollIntoView?.({ block: "start" })
  }

  return (
    <a
      data-slot="skip-link"
      href={href}
      onClick={handleClick}
      className={cn(
        "sr-only focus-visible:not-sr-only",
        "focus-visible:start-2 focus-visible:fixed focus-visible:top-[calc(0.5rem+env(safe-area-inset-top))] focus-visible:z-100",
        "focus-visible:px-4 focus-visible:py-2.5 focus-visible:text-sm focus-visible:font-medium focus-visible:shadow-lg focus-visible:rounded-lg focus-visible:bg-background focus-visible:text-foreground",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring",
        className,
      )}
      {...props}
    >
      {children ?? t("layout.skipToContent")}
    </a>
  )
}
