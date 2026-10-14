"use client"

import * as React from "react"

import { useIsMobile } from "../hooks/use-mobile"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "../ui/drawer"
import { registerEnglish } from "../i18n/english"
import { common as en_common } from "../locales/en/common"

registerEnglish({ common: en_common })

export interface MapInfoPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  /** Details: a description list, photo, status… */
  children?: React.ReactNode
  /** Buttons at the bottom (e.g. "Open record", "Directions"). */
  actions?: React.ReactNode
  /** `side` panel over the map, `sheet` (bottom sheet), or `auto`: side on desktop, sheet on phones. */
  variant?: "auto" | "side" | "sheet"
  className?: string
  classNames?: { header?: string; title?: string; body?: string; footer?: string }
  ref?: React.Ref<HTMLElement>
}

/**
 * Details of the selected marker: a side panel over the map on desktop and a
 * bottom sheet on phones. Put it inside a map's `overlay` (or any `relative`
 * container). Escape closes it and focus returns to what opened it.
 */
export function MapInfoPanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  variant = "auto",
  className,
  classNames,
  ref,
}: MapInfoPanelProps) {
  const isMobile = useIsMobile()
  const sheet = variant === "sheet" || (variant === "auto" && isMobile)
  if (sheet) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent data-slot="map-info-panel" data-variant="sheet" className={className}>
          <DrawerHeader className={cn("text-start", classNames?.header)}>
            <DrawerTitle className={classNames?.title}>{title}</DrawerTitle>
            {description ? <DrawerDescription>{description}</DrawerDescription> : null}
          </DrawerHeader>
          {children ? <div className={cn("px-4 pb-2 text-sm overflow-auto", classNames?.body)}>{children}</div> : null}
          {actions ? <DrawerFooter className={classNames?.footer}>{actions}</DrawerFooter> : null}
        </DrawerContent>
      </Drawer>
    )
  }
  return open ? (
    <SidePanel
      ref={ref}
      title={title}
      description={description}
      actions={actions}
      onClose={() => onOpenChange(false)}
      className={className}
      classNames={classNames}
    >
      {children}
    </SidePanel>
  ) : null
}

function SidePanel({
  title,
  description,
  children,
  actions,
  onClose,
  className,
  classNames,
  ref,
}: Pick<MapInfoPanelProps, "title" | "description" | "children" | "actions" | "className" | "classNames" | "ref"> & {
  onClose: () => void
}) {
  const { t } = useTranslation()
  const titleId = React.useId()
  const descriptionId = React.useId()
  const headingRef = React.useRef<HTMLHeadingElement>(null)

  // Move focus into the panel when it opens; give it back when it closes.
  React.useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    headingRef.current?.focus()
    return () => {
      if (previous && previous.isConnected) previous.focus()
    }
  }, [])

  return (
    // Escape closes the panel from anywhere inside it.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <aside
      ref={ref}
      data-slot="map-info-panel"
      data-variant="side"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation()
          onClose()
        }
      }}
      className={cn(
        "inset-y-2 end-2 shadow-lg absolute z-40 flex w-[min(20rem,calc(100%-1rem))] flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground",
        "animate-in duration-200 fade-in-0 slide-in-from-end-4",
        className,
      )}
    >
      <div className={cn("gap-2 p-4 pb-2 flex items-start", classNames?.header)}>
        <div className="min-w-0 flex-1">
          <h2
            ref={headingRef}
            id={titleId}
            tabIndex={-1}
            className={cn("font-semibold text-base outline-none", classNames?.title)}
          >
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("common.close")} onClick={onClose}>
          <Icon name="close" />
        </Button>
      </div>
      {children ? (
        <div className={cn("min-h-0 px-4 pb-4 text-sm flex-1 overflow-auto", classNames?.body)}>{children}</div>
      ) : null}
      {actions ? <div className={cn("gap-2 p-3 flex flex-wrap border-t", classNames?.footer)}>{actions}</div> : null}
    </aside>
  )
}
