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
import type { RecordAction } from "../listing/_actions"
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
  /** Accessible name of the default trigger. Default "More actions", or "Actions for {name}". */
  label?: string
  /**
   * The record the menu acts on, e.g. "Jane Doe". Names the default trigger
   * ("Actions for Jane Doe") and the default confirmations ("Delete Jane Doe?").
   */
  name?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  classNames?: { trigger?: string; item?: string }
}

/**
 * A dropdown menu of actions built from an `items` array, on shadcn
 * `DropdownMenu`. Items take semantic icons, shortcut hints, destructive
 * styling, links and an optional confirmation step, which opens once the menu
 * has closed and returns focus to the trigger. Submenus open towards the
 * inline end (left in RTL), and arrow keys follow the visual order.
 */
export function ActionMenu({
  items,
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

  return (
    <>
      <DropdownMenu open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
        <DropdownMenuTrigger asChild>
          {trigger ?? (
            <Button
              variant="ghost"
              size="icon-sm"
              data-slot="action-menu-trigger"
              aria-label={triggerLabel}
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
          onCloseAutoFocus={(event) => {
            onCloseAutoFocus?.(event)
            ask()
          }}
        >
          <MenuItems
            items={items}
            parts={dropdownParts}
            itemClassName={classNames?.item}
            onAsk={(item) => {
              queued.current = item
            }}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      {asking ? (
        <ConfirmDialog key={asking.key} {...asking.options} open={dialogOpen} onOpenChange={setDialogOpen} />
      ) : null}
    </>
  )
}

export interface RowActionsProps extends Omit<React.ComponentProps<"button">, "children"> {
  /** The record's display name, used in "Actions for Jane Doe" and "Delete Jane Doe?". */
  name: string
  actions: RecordAction[]
  /** Menu alignment. Default `end`. */
  align?: "start" | "center" | "end"
  classNames?: { trigger?: string; content?: string }
}

/**
 * `ActionMenu` with a `name` and a ⋯ button sized for a table row (§25.6).
 * Other props go to the ⋯ button. Renders nothing when no action is permitted.
 */
export function RowActions({ name, actions, align = "end", className, classNames, ...props }: RowActionsProps) {
  const { t } = useTranslation()
  if (visibleItems(actions).length === 0) return null
  return (
    <ActionMenu
      name={name}
      items={actions}
      align={align}
      className={cn("min-w-40", classNames?.content)}
      trigger={
        <Button
          variant="ghost"
          size="icon-sm"
          data-slot="row-actions"
          aria-label={t("listing.actionsFor", { name })}
          className={cn("touch:size-11", classNames?.trigger, className)}
          {...props}
        >
          <Icon name="more" />
        </Button>
      }
    />
  )
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
