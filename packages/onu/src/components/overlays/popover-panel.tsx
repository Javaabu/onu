"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { useIsMobile } from "../../hooks/use-mobile"
import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { BottomSheet } from "./bottom-sheet"
import { useControllableState } from "./_use-controllable-state"
import { registerEnglish } from "../../i18n/english"
import { overlay as en_overlay } from "../../locales/en/overlay"

registerEnglish({ overlay: en_overlay })

export interface PopoverPanelProps extends Omit<
  React.ComponentProps<typeof PopoverPrimitive.Content>,
  "title" | "children"
> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Element that toggles the panel (rendered with `asChild`). */
  trigger: React.ReactNode
  /** Heading. Also the accessible name of the panel. */
  title?: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  /** Show a × button. Default `false` (Escape and outside click close it). */
  closeButton?: boolean
  /**
   * `sheet` turns the panel into a bottom sheet on phones (R3.20), useful for
   * filters and pickers. Needs a `title`. Default `popover`.
   */
  mobile?: "popover" | "sheet"
  children?: React.ReactNode
  classNames?: { header?: string; title?: string; description?: string; body?: string; footer?: string; close?: string }
}

/**
 * A non-modal panel anchored to a trigger, for small forms, filters and extra
 * details. Builds on shadcn `Popover`; on phones it can become a bottom sheet.
 * Focus moves into the panel on open and back to the trigger on close.
 */
export function PopoverPanel({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  footer,
  closeButton = false,
  mobile = "popover",
  children,
  className,
  classNames,
  ...props
}: PopoverPanelProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange)
  const titleId = React.useId()
  const descriptionId = React.useId()

  if (mobile === "sheet" && isMobile && title) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        trigger={trigger}
        title={title}
        description={description}
        footer={footer}
        className={className}
        classNames={classNames}
      >
        {children}
      </BottomSheet>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        data-slot="popover-panel"
        role="dialog"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn("gap-3 p-3 w-80 max-w-[calc(100vw-2rem)]", className)}
        collisionPadding={8}
        {...props}
      >
        {title || description || closeButton ? (
          <div
            data-slot="popover-panel-header"
            className={cn("gap-0.5 flex flex-col", closeButton && "pe-8 relative", classNames?.header)}
          >
            {title ? (
              <h2 id={titleId} className={cn("text-sm font-semibold", classNames?.title)}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id={descriptionId} className={cn("text-sm text-muted-foreground", classNames?.description)}>
                {description}
              </p>
            ) : null}
            {closeButton ? (
              <PopoverPrimitive.Close asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  data-slot="popover-panel-close"
                  className={cn("-top-1 -end-1 absolute", classNames?.close)}
                >
                  <Icon name="close" />
                  <span className="sr-only">{t("overlay.close")}</span>
                </Button>
              </PopoverPrimitive.Close>
            ) : null}
          </div>
        ) : null}
        {children !== undefined && children !== null ? (
          <div data-slot="popover-panel-body" className={cn("text-sm", classNames?.body)}>
            {children}
          </div>
        ) : null}
        {footer ? (
          <div data-slot="popover-panel-footer" className={cn("gap-2 flex justify-end", classNames?.footer)}>
            {footer}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
