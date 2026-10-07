"use client"

import * as React from "react"

import { useIsMobile } from "../../hooks/use-mobile"
import { cn } from "../../lib/utils"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"

export interface PickerSurfaceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The trigger element (rendered with `asChild`). */
  trigger: React.ReactElement
  /** Accessible name of the panel; also the bottom sheet's title on phones. */
  title: string
  children: React.ReactNode
  className?: string
  /** Element to focus when the panel opens. Defaults to the first focusable element. */
  onOpenAutoFocus?: (event: Event) => void
}

/**
 * A picker panel: a popover on larger screens and a bottom sheet on phones,
 * with large touch targets (R3.28). Focus returns to the trigger on close.
 */
export function PickerSurface({
  open,
  onOpenChange,
  trigger,
  title,
  children,
  className,
  onOpenAutoFocus,
}: PickerSurfaceProps) {
  const mobile = useIsMobile()
  if (mobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent aria-describedby={undefined} data-picker="sheet">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className={cn("gap-3 px-4 grid pb-[max(1rem,env(safe-area-inset-bottom))]", className)}>{children}</div>
        </DrawerContent>
      </Drawer>
    )
  }
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={title}
        data-picker="popover"
        onOpenAutoFocus={onOpenAutoFocus}
        className={cn("gap-3 grid", className)}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}
