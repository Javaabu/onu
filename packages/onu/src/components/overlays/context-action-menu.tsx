"use client"

import * as React from "react"
import type { ContextMenu as ContextMenuPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../../ui/context-menu"
import { MenuItems, type MenuItem, type MenuParts } from "./_menu-items"

// The context menu parts have the same props as the dropdown ones.
const contextParts = {
  Item: ContextMenuItem,
  CheckboxItem: ContextMenuCheckboxItem,
  RadioGroup: ContextMenuRadioGroup,
  RadioItem: ContextMenuRadioItem,
  Label: ContextMenuLabel,
  Separator: ContextMenuSeparator,
  Shortcut: ContextMenuShortcut,
  Group: ContextMenuGroup,
  Sub: ContextMenuSub,
  SubTrigger: ContextMenuSubTrigger,
  SubContent: ContextMenuSubContent,
} as unknown as MenuParts

export interface ContextActionMenuProps extends Omit<
  React.ComponentProps<typeof ContextMenuPrimitive.Content>,
  "children"
> {
  items: MenuItem[]
  /** The area that opens the menu on right-click, long press (touch) or the Menu key / Shift+F10. */
  children: React.ReactNode
  /** Render `children` as the trigger instead of wrapping them in a `<span>`. */
  asChild?: boolean
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  classNames?: { trigger?: string; item?: string }
}

/**
 * A right-click menu built from the same `items` as `ActionMenu`. On touch it
 * opens with a long press. Because context menus are hard to discover, always
 * offer the same actions somewhere visible too (e.g. an `ActionMenu` on the row).
 */
export function ContextActionMenu({
  items,
  children,
  asChild,
  disabled,
  onOpenChange,
  modal,
  className,
  classNames,
  ...props
}: ContextActionMenuProps) {
  return (
    <ContextMenu onOpenChange={onOpenChange} modal={modal}>
      <ContextMenuTrigger
        asChild={asChild}
        disabled={disabled}
        data-slot="context-action-menu-trigger"
        className={cn("[-webkit-touch-callout:none]", classNames?.trigger)}
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent
        data-slot="context-action-menu-content"
        collisionPadding={8}
        className={cn("min-w-44 max-w-[calc(100vw-1rem)]", className)}
        {...props}
      >
        <MenuItems items={items} parts={contextParts} itemClassName={classNames?.item} />
      </ContextMenuContent>
    </ContextMenu>
  )
}
