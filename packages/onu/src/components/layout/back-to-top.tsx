"use client"

import * as React from "react"

import { useMediaQuery } from "../../hooks/use-media-query"
import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { registerEnglish } from "../../i18n/english"
import { layout as en_layout } from "../../locales/en/layout"

registerEnglish({ layout: en_layout })

export interface BackToTopProps extends Omit<React.ComponentProps<typeof Button>, "children"> {
  /** Show the button after scrolling this many pixels. */
  threshold?: number
  /** Scroll a container instead of the window. */
  scrollContainer?: React.RefObject<HTMLElement | null>
  /** Element id to move focus to after scrolling (e.g. `"main-content"`). */
  focusTargetId?: string
  /** Show the text label next to the icon. */
  showLabel?: boolean
  /** `fixed` floats at the bottom end of the viewport; `static` renders in place. */
  position?: "fixed" | "static"
  /** Always render (ignores the threshold), e.g. at the end of an article. */
  alwaysVisible?: boolean
  children?: React.ReactNode
}

/**
 * Floating "Back to top" button that appears after scrolling. Scrolls smoothly,
 * or instantly when the user prefers reduced motion (R3.6, R14.8).
 */
export function BackToTop({
  threshold = 400,
  scrollContainer,
  focusTargetId,
  showLabel = false,
  position = "fixed",
  alwaysVisible = false,
  className,
  children,
  onClick,
  ...props
}: BackToTopProps) {
  const { t } = useTranslation()
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

  const subscribe = (onChange: () => void) => {
    const target: HTMLElement | Window = scrollContainer?.current ?? window
    target.addEventListener("scroll", onChange, { passive: true })
    return () => target.removeEventListener("scroll", onChange)
  }
  const scrolled = React.useSyncExternalStore(
    subscribe,
    () => (scrollContainer?.current ? scrollContainer.current.scrollTop : window.scrollY) > threshold,
    () => false,
  )

  if (!alwaysVisible && !scrolled) return null

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return
    const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth"
    const target = scrollContainer?.current
    if (target) target.scrollTo({ top: 0, behavior })
    else window.scrollTo({ top: 0, behavior })
    if (focusTargetId) {
      const el = document.getElementById(focusTargetId)
      if (el) {
        if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1")
        el.focus({ preventScroll: true })
      }
    }
  }

  const label = t("layout.backToTop")
  return (
    <Button
      data-slot="back-to-top"
      data-position={position}
      variant="outline"
      size={showLabel ? "default" : "icon"}
      aria-label={showLabel ? undefined : label}
      onClick={handleClick}
      className={cn(
        "shadow-md touch:min-h-11 touch:min-w-11 rounded-full motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95",
        position === "fixed" && "end-4 fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40",
        className,
      )}
      {...props}
    >
      <Icon name="arrow-up" />
      {showLabel ? (children ?? label) : null}
    </Button>
  )
}
