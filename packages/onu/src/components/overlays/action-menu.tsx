"use client"

import * as React from "react"
import type { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { MenuItems, type MenuItem, type MenuParts } from "./_menu-items"
import { registerEnglish } from "../../i18n/english"
import { overlay as en_overlay } from "../../locales/en/overlay"

registerEnglish({ overlay: en_overlay })

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

const dropdownParts: MenuParts = {
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Shortcut: DropdownMenuShortcut,
  Group: DropdownMenuGroup,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
}

export interface ActionMenuProps extends Omit<React.ComponentProps<typeof DropdownMenuPrimitive.Content>, "children"> {
  /** Menu entries: actions, checkbox and radio items, submenus, groups, labels and separators. */
  items: MenuItem[]
  /**
   * Element that opens the menu (rendered with `asChild`). Defaults to a ⋯ icon
   * button labelled `label`.
   */
  trigger?: React.ReactNode
  /** Accessible name of the default trigger. Default "More actions". */
  label?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  classNames?: { trigger?: string; item?: string }
}

/**
 * A dropdown menu of actions built from an `items` array, on shadcn
 * `DropdownMenu`. Items take semantic icons, shortcut hints, destructive
 * styling, links and an optional confirmation step. Submenus open towards the
 * inline end (left in RTL), and arrow keys follow the visual order.
 */
export function ActionMenu({
  items,
  trigger,
  label,
  open,
  defaultOpen,
  onOpenChange,
  modal,
  align = "end",
  className,
  classNames,
  ...props
}: ActionMenuProps) {
  const { t } = useTranslation()
  const name = label ?? t("overlay.moreActions")
  return (
    <DropdownMenu open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon-sm"
            data-slot="action-menu-trigger"
            aria-label={name}
            className={classNames?.trigger}
          >
            <Icon name="more" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-slot="action-menu-content"
        align={align}
        collisionPadding={8}
        className={cn("min-w-44 w-auto max-w-[calc(100vw-1rem)]", className)}
        {...props}
      >
        <MenuItems items={items} parts={dropdownParts} itemClassName={classNames?.item} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
