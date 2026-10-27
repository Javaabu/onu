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
import { useMountedConfirm } from "./_confirm-context"
import {
  MenuItems,
  useConfirmQuestion,
  visibleItems,
  type MenuActionItem,
  type MenuItem,
  type MenuParts,
} from "./_menu-items"
import { ConfirmDialog, type ConfirmOptions } from "./confirm-dialog"
import { registerEnglish } from "../../i18n/english"
import { listing as en_listing } from "../../locales/en/listing"
import { overlay as en_overlay } from "../../locales/en/overlay"

registerEnglish({ listing: en_listing, overlay: en_overlay })

// `ActionMenu`'s dropdown, on its own so that tables and lists, which only use the
// dropdown, don't bundle the context menu. Apps use `ActionMenu`.

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

export interface ActionMenuProps extends Omit<
  React.ComponentProps<typeof DropdownMenuPrimitive.Content>,
  "children" | "asChild"
> {
  /** Menu entries: actions, checkbox and radio items, submenus, groups, labels and separators. */
  items: MenuItem[]
  /**
   * What opens the menu. `"click"` (default): a trigger button, `trigger` or
   * the ⋯ button. `"context"`: a context menu on `children`, opened by
   * right-click, a long press on touch screens, or the Menu key / Shift+F10.
   */
  openOn?: "click" | "context"
  /** With `openOn="context"`: the area that opens the menu. */
  children?: React.ReactNode
  /** With `openOn="context"`: use the child as the area instead of wrapping `children` in a `<span>`. */
  asChild?: boolean
  /** Turn the menu off: the trigger is disabled, or right-click does nothing with `openOn="context"`. */
  disabled?: boolean
  /**
   * Element that opens the menu (rendered with `asChild`). Defaults to a ⋯ icon
   * button labelled `label`, sized for a table row (44px on touch screens).
   */
  trigger?: React.ReactNode
  /** Accessible name of the default trigger. Default "More actions", or "Actions for {name}". */
  label?: string
  /**
   * The record the menu acts on, e.g. "Jane Doe". Names the default trigger
   * ("Actions for Jane Doe") and the default confirmations ("Delete Jane Doe?").
   */
  name?: string
  /** `open` and `defaultOpen` apply to the dropdown only; a context menu opens where the user asks. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  /** `trigger`: the default ⋯ button, or the area with `openOn="context"`. */
  classNames?: { trigger?: string; item?: string }
}

/** The menu's items, with confirmations that wait for the menu to close. Shared by both kinds of menu. */
export function useActionMenuItems({
  items,
  name,
  itemClassName,
}: {
  items: MenuItem[]
  name?: string
  itemClassName?: string
}) {
  const question = useConfirmQuestion(name)
  const mountedConfirm = useMountedConfirm()
  const queued = React.useRef<MenuActionItem | null>(null)
  const [asking, setAsking] = React.useState<{ options: ConfirmOptions; key: number } | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  // Confirmations wait for the menu to close (§25.6). This runs in the menu's
  // `onCloseAutoFocus`, just before Radix moves focus back to the trigger; the
  // dialog renders after that, so it returns focus there too (§25.10).
  const ask = () => {
    const item = queued.current
    if (!item) return
    queued.current = null
    const base = question(item)
    const options: ConfirmOptions = {
      ...base,
      onConfirm: async () => {
        await base.onConfirm?.()
        await item.onSelect?.()
      },
    }
    const provider = mountedConfirm()
    if (provider) void provider(options)
    else {
      // Without a ConfirmProvider, ask with a dialog of our own rather than `window.confirm`.
      setAsking((current) => ({ options, key: (current?.key ?? 0) + 1 }))
      setDialogOpen(true)
    }
  }

  return {
    ask,
    empty: visibleItems(items).length === 0,
    dialog: asking ? (
      <ConfirmDialog key={asking.key} {...asking.options} open={dialogOpen} onOpenChange={setDialogOpen} />
    ) : null,
    render: (parts: MenuParts) => (
      <MenuItems
        items={items}
        parts={parts}
        itemClassName={itemClassName}
        onAsk={(item) => {
          queued.current = item
        }}
      />
    ),
  }
}

/** `ActionMenu` with `openOn="click"`. */
export function DropdownActionMenu({
  items,
  openOn: _openOn,
  children: _children,
  asChild: _asChild,
  disabled,
  trigger,
  label,
  name,
  open,
  defaultOpen,
  onOpenChange,
  modal,
  align = "end",
  onCloseAutoFocus,
  className,
  classNames,
  ...props
}: ActionMenuProps) {
  const { t } = useTranslation()
  const triggerLabel = label ?? (name === undefined ? t("overlay.moreActions") : t("listing.actionsFor", { name }))
  const menu = useActionMenuItems({ items, name, itemClassName: classNames?.item })

  // Nothing to offer (e.g. no item is `permitted`): no ⋯ button, but a question already asked stays open.
  if (menu.empty) return menu.dialog

  return (
    <>
      <DropdownMenu open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
        <DropdownMenuTrigger asChild disabled={disabled}>
          {trigger ?? (
            <Button
              variant="ghost"
              size="icon-sm"
              data-slot="action-menu-trigger"
              aria-label={triggerLabel}
              className={cn("touch:size-11", classNames?.trigger)}
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
          onCloseAutoFocus={(event) => {
            onCloseAutoFocus?.(event)
            menu.ask()
          }}
        >
          {menu.render(dropdownParts)}
        </DropdownMenuContent>
      </DropdownMenu>
      {menu.dialog}
    </>
  )
}
