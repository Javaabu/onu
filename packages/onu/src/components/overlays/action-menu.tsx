"use client"

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
import type { RecordAction } from "../listing/_actions"
import { DropdownActionMenu, useActionMenuItems, type ActionMenuProps } from "./_action-menu"
import type { MenuParts } from "./_menu-items"
import { registerEnglish } from "../../i18n/english"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ listing: en_listing })

export type { ActionMenuProps } from "./_action-menu"
export type {
  MenuItem,
  MenuActionItem,
  MenuCheckboxItem,
  MenuRadioItem,
  MenuSubItem,
  MenuGroupItem,
  MenuLabelItem,
  MenuSeparatorItem,
} from "./_menu-items"

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

function ContextActionMenu({
  items,
  children,
  asChild,
  disabled,
  name,
  onOpenChange,
  modal,
  onCloseAutoFocus,
  className,
  classNames,
  // A context menu opens at the pointer: no trigger button, no controlled state, no side or alignment.
  openOn: _openOn,
  trigger: _trigger,
  label: _label,
  open: _open,
  defaultOpen: _defaultOpen,
  align: _align,
  side: _side,
  sideOffset: _sideOffset,
  ...props
}: ActionMenuProps) {
  const menu = useActionMenuItems({ items, name, itemClassName: classNames?.item })
  return (
    <>
      <ContextMenu onOpenChange={onOpenChange} modal={modal}>
        <ContextMenuTrigger
          asChild={asChild}
          // With nothing to offer the area stays, but right-click shows the browser's own menu.
          disabled={disabled || menu.empty}
          data-slot="action-menu-area"
          className={cn("[-webkit-touch-callout:none]", classNames?.trigger)}
        >
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent
          data-slot="action-menu-content"
          collisionPadding={8}
          className={cn("min-w-44 w-auto max-w-[calc(100vw-1rem)]", className)}
          {...props}
          onCloseAutoFocus={(event) => {
            onCloseAutoFocus?.(event)
            menu.ask()
          }}
        >
          {menu.render(contextParts)}
        </ContextMenuContent>
      </ContextMenu>
      {menu.dialog}
    </>
  )
}

/**
 * A dropdown menu of actions built from an `items` array, on shadcn
 * `DropdownMenu`. Items take semantic icons, shortcut hints, destructive
 * styling, links and an optional confirmation step, which opens once the menu
 * has closed and returns focus to the trigger. Submenus open towards the
 * inline end (left in RTL), and arrow keys follow the visual order. Renders
 * nothing when no item is visible (e.g. none is `permitted`).
 *
 * With `openOn="context"` the same items open as a context menu (shadcn
 * `ContextMenu`) on `children`: right-click, long press, or the Menu key.
 * Context menus are hard to discover, so offer the actions somewhere visible too.
 */
export function ActionMenu(props: ActionMenuProps) {
  return props.openOn === "context" ? <ContextActionMenu {...props} /> : <DropdownActionMenu {...props} />
}

/** Standard actions for a trashed record: Restore, and Delete permanently (with confirmation). */
export function trashActions(
  t: (key: string) => string,
  handlers: { onRestore?: () => void | Promise<unknown>; onForceDelete?: () => void | Promise<unknown> },
  permissions: { restore?: boolean; forceDelete?: boolean } = {},
): RecordAction[] {
  return [
    {
      id: "restore",
      label: t("listing.restore"),
      icon: "restore",
      onSelect: handlers.onRestore,
      permitted: permissions.restore !== false && !!handlers.onRestore,
    },
    {
      id: "force-delete",
      label: t("listing.deletePermanently"),
      icon: "trash",
      destructive: true,
      onSelect: handlers.onForceDelete,
      permitted: permissions.forceDelete !== false && !!handlers.onForceDelete,
    },
  ]
}
