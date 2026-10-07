"use client"

import * as React from "react"
import type { Tooltip as TooltipPrimitive } from "radix-ui"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip"
import { useControllableState } from "./_use-controllable-state"

const LONG_PRESS_MS = 500

export interface TipProps extends Omit<React.ComponentProps<typeof TooltipPrimitive.Content>, "content" | "children"> {
  /** The tooltip text. Keep it short and never put the only copy of important information here. */
  content: React.ReactNode
  /**
   * The element the tip describes (must accept a ref and props, e.g. a button).
   * Omit it to render an ⓘ button labelled "More information".
   */
  children?: React.ReactElement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Hover delay in ms. Default 300. */
  delayDuration?: number
  /**
   * How the tip opens on touch screens, where there is no hover (R3.26):
   * `tap` toggles it on tap (good for ⓘ buttons and icons); `long-press`
   * keeps taps for the trigger's own action and opens the tip on a long press.
   * Default `tap`, or `long-press` when the trigger has an `onClick`.
   */
  touch?: "tap" | "long-press"
  disabled?: boolean
}

/**
 * A tooltip that also works on touch: hover or focus shows it with a mouse or
 * keyboard; a tap or long press shows it on touch screens. Escape and tapping
 * elsewhere close it. Built on shadcn `Tooltip`.
 */
export function Tip({
  content,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  delayDuration = 300,
  touch,
  disabled,
  className,
  ...props
}: TipProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange)
  const pointerType = React.useRef<string>("mouse")
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const longPressed = React.useRef(false)
  const openAtPress = React.useRef(false)
  const childProps = (children?.props ?? {}) as { onClick?: unknown }
  const mode = touch ?? (childProps.onClick ? "long-press" : "tap")

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const isTouch = () => pointerType.current === "touch" || pointerType.current === "pen"

  const trigger = children ?? (
    <button
      type="button"
      data-slot="tip-trigger"
      className={cn(
        "size-5 inline-flex items-center justify-center rounded-full align-middle text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        "touch:size-11 touch:-m-3",
      )}
    >
      <Icon name="info" className="size-4" />
      <span className="sr-only">{t("overlay.moreInfo")}</span>
    </button>
  )

  if (disabled) return trigger

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger
          asChild
          onPointerDown={(e) => {
            pointerType.current = e.pointerType
            longPressed.current = false
            // Radix closes an open tooltip on pointer down; remember the state for the tap toggle.
            openAtPress.current = open
            if (isTouch() && mode === "long-press") {
              clearTimeout(timer.current)
              timer.current = setTimeout(() => {
                longPressed.current = true
                setOpen(true)
              }, LONG_PRESS_MS)
            }
          }}
          onPointerUp={() => clearTimeout(timer.current)}
          onPointerCancel={() => clearTimeout(timer.current)}
          onPointerLeave={() => clearTimeout(timer.current)}
          onContextMenu={(e) => {
            // Long press on touch opens the browser's context menu on some devices.
            if (isTouch() && mode === "long-press") e.preventDefault()
          }}
          onClick={(e) => {
            if (!isTouch()) return
            if (longPressed.current) {
              // The click that ends a long press must not close the tip again.
              e.preventDefault()
              longPressed.current = false
              return
            }
            if (mode === "tap") {
              // Stop Radix closing the tooltip on click, then toggle it ourselves.
              e.preventDefault()
              setOpen(!openAtPress.current)
            }
          }}
        >
          {trigger}
        </TooltipTrigger>
        <TooltipContent
          data-slot="tip-content"
          sideOffset={4}
          collisionPadding={8}
          className={cn("max-w-[min(20rem,calc(100vw-1rem))] text-balance", className)}
          {...props}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
