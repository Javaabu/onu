"use client"

import * as React from "react"

import { useIsMobile } from "../../hooks/use-mobile"
import { cn } from "../../lib/utils"
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "../../ui/drawer"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../../ui/popover"

const PickerContext = React.createContext(false)

export interface PickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Use a bottom sheet on phones (R3.28). Default `true`. */
  sheet?: boolean
  children: React.ReactNode
}

/**
 * The surface a picker opens in: a popover anchored to the field on larger
 * screens, a bottom sheet on phones. Focus returns to the trigger on close.
 */
export function Picker({ open, onOpenChange, sheet = true, children }: PickerProps) {
  const mobile = useIsMobile() && sheet
  const Root = mobile ? Drawer : Popover
  return (
    <PickerContext.Provider value={mobile}>
      <Root open={open} onOpenChange={onOpenChange}>
        {children}
      </Root>
    </PickerContext.Provider>
  )
}

export function usePickerIsSheet() {
  return React.useContext(PickerContext)
}

export function PickerAnchor({ children }: { children: React.ReactElement }) {
  const mobile = usePickerIsSheet()
  return mobile ? children : <PopoverAnchor asChild>{children}</PopoverAnchor>
}

export function PickerTrigger({ children }: { children: React.ReactElement }) {
  const mobile = usePickerIsSheet()
  return mobile ? (
    <DrawerTrigger asChild>{children}</DrawerTrigger>
  ) : (
    <PopoverTrigger asChild>{children}</PopoverTrigger>
  )
}

export interface PickerContentProps {
  id?: string
  /** Sheet title for screen readers (and shown on phones). */
  title: string
  className?: string
  align?: "start" | "center" | "end"
  /** Keep focus where it is when opening (editable inputs). */
  keepFocus?: boolean
  onInteractOutside?: (event: Event) => void
  children: React.ReactNode
}

export function PickerContent({
  id,
  title,
  className,
  align = "start",
  keepFocus,
  onInteractOutside,
  children,
}: PickerContentProps) {
  const mobile = usePickerIsSheet()
  if (mobile) {
    return (
      <DrawerContent id={id} data-slot="choice-sheet" className={cn("pb-[env(safe-area-inset-bottom)]", className)}>
        <DrawerTitle className="px-4 pt-3 text-start">{title}</DrawerTitle>
        <DrawerDescription className="sr-only">{title}</DrawerDescription>
        <div className="p-2 min-h-0 flex flex-1 flex-col">{children}</div>
      </DrawerContent>
    )
  }
  return (
    <PopoverContent
      id={id}
      align={align}
      data-slot="choice-popover"
      aria-label={title}
      className={cn("p-0 gap-0 min-w-56 w-(--radix-popover-trigger-width) overflow-hidden", className)}
      onOpenAutoFocus={keepFocus ? (e) => e.preventDefault() : undefined}
      onInteractOutside={onInteractOutside}
    >
      {children}
    </PopoverContent>
  )
}
