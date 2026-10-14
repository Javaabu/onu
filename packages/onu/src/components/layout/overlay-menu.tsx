"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import type { NavGroup, NavItem, NavMatch } from "./_nav"
import { SideNav } from "./side-nav"
import { registerEnglish } from "../../i18n/english"
import { layout as en_layout } from "../../locales/en/layout"

registerEnglish({ layout: en_layout })

export interface OverlayMenuProps {
  items?: NavItem[]
  groups?: NavGroup[]
  currentHref?: string
  match?: NavMatch
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Custom trigger element (rendered with `asChild`). Defaults to a menu button. */
  trigger?: React.ReactNode
  /** Logo or title at the top of the overlay. */
  logo?: React.ReactNode
  /** Content under the navigation (language switcher, contact details, sign in). */
  footer?: React.ReactNode
  /** Accessible title of the overlay. Defaults to "Menu". */
  title?: string
  className?: string
  classNames?: { trigger?: string; overlay?: string; content?: string; nav?: string; footer?: string }
}

/**
 * A full-screen overlay menu for portals and kiosks: rendered in a portal, traps
 * focus, closes with Escape or the close button and returns focus to the trigger.
 * Items use large touch targets.
 */
export function OverlayMenu({
  items,
  groups,
  currentHref,
  match,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger,
  logo,
  footer,
  title,
  className,
  classNames,
}: OverlayMenuProps) {
  const { t } = useTranslation()
  const [inner, setInner] = React.useState(defaultOpen)
  const open = openProp ?? inner
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInner(next)
    onOpenChange?.(next)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("layout.openMenu")}
            className={cn("touch:size-11", classNames?.trigger)}
          >
            <Icon name="menu" />
          </Button>
        )}
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "inset-0 fixed z-50 bg-background motion-reduce:animate-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            classNames?.overlay,
          )}
        />
        <DialogPrimitive.Content
          data-slot="overlay-menu"
          className={cn(
            "inset-0 fixed z-50 flex flex-col overflow-y-auto bg-background outline-none",
            "ps-[env(safe-area-inset-left)] pe-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
            "motion-reduce:animate-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.98] data-closed:animate-out data-closed:fade-out-0",
            className,
            classNames?.content,
          )}
        >
          <div className="gap-4 px-4 h-16 sm:px-8 flex shrink-0 items-center justify-between">
            <div className="min-w-0">{logo}</div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon-lg" aria-label={t("layout.closeMenu")} className="size-11">
                <Icon name="close" className="size-6" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Title className="sr-only">{title ?? t("layout.menu")}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{t("layout.mainNavigation")}</DialogPrimitive.Description>
          <div className="px-4 py-6 max-w-2xl sm:px-8 mx-auto w-full flex-1">
            <SideNav
              items={items}
              groups={groups}
              currentHref={currentHref}
              match={match}
              size="lg"
              onNavigate={() => setOpen(false)}
              className={classNames?.nav}
            />
          </div>
          {footer ? (
            <div
              data-slot="overlay-menu-footer"
              className={cn("px-4 py-6 max-w-2xl sm:px-8 mx-auto w-full border-t", classNames?.footer)}
            >
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
