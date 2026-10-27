"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import type { SemanticIconName } from "../../icons/types"
import { cn } from "../../lib/utils"
import { useLinkComponent, useTranslation } from "../../providers/onu-provider"
import type * as Dropdown from "../../ui/dropdown-menu"
import { useConfirm, type ConfirmOptions } from "./confirm-dialog"
import { registerEnglish } from "../../i18n/english"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ listing: en_listing })

type IconName = SemanticIconName | (string & {})

interface BaseItem {
  /** Stable key. Defaults to the index. */
  id?: string
  /** Leave the item out, e.g. when the user lacks permission (§25.6: only actions the user can do are listed). */
  hidden?: boolean
  disabled?: boolean
}

/** A command in the menu. */
export interface MenuActionItem extends BaseItem {
  type?: "item"
  label: React.ReactNode
  /** Semantic icon name, e.g. `edit`, `trash`. */
  icon?: IconName
  /** Keyboard shortcut hint shown at the inline end, e.g. `⌘E`. Display only. */
  shortcut?: string
  /** `destructive` colours the item (e.g. Delete). */
  variant?: "default" | "destructive"
  /**
   * Shorthand for `variant: "destructive"` that also asks for confirmation
   * unless `confirm` is `false` (the listing `RecordAction` shape).
   */
  destructive?: boolean
  /** Renders a link (through the `OnuProvider` link component, R16.2). */
  href?: string
  /**
   * Ask for confirmation before running `onSelect` (§25.6 "Delete Jane Doe?").
   * A title or options; `true` asks the default question, which names the
   * menu's `name` ("Delete Jane Doe?").
   */
  confirm?: ConfirmOptions | string | boolean
  /** May return a promise: the confirmation shows a spinner until it settles. */
  onSelect?: () => void | Promise<unknown>
  /** `false` leaves the item out, like `hidden`. */
  permitted?: boolean
  /** Draw a separator above this item. */
  separator?: boolean
}

export interface MenuCheckboxItem extends BaseItem {
  type: "checkbox"
  label: React.ReactNode
  icon?: IconName
  shortcut?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export interface MenuRadioItem extends BaseItem {
  type: "radio"
  /** Optional heading above the options. */
  label?: React.ReactNode
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: React.ReactNode; icon?: IconName; disabled?: boolean }[]
}

export interface MenuSubItem extends BaseItem {
  type: "sub"
  label: React.ReactNode
  icon?: IconName
  items: MenuItem[]
}

export interface MenuGroupItem extends BaseItem {
  type: "group"
  label?: React.ReactNode
  items: MenuItem[]
}

export interface MenuLabelItem extends BaseItem {
  type: "label"
  label: React.ReactNode
}

export interface MenuSeparatorItem extends BaseItem {
  type: "separator"
}

/** One entry of an `ActionMenu` (dropdown or context menu). */
export type MenuItem =
  MenuActionItem | MenuCheckboxItem | MenuRadioItem | MenuSubItem | MenuGroupItem | MenuLabelItem | MenuSeparatorItem

/** The primitive parts a menu is rendered with (dropdown or context menu share a shape). */
export interface MenuParts {
  Item: typeof Dropdown.DropdownMenuItem
  CheckboxItem: typeof Dropdown.DropdownMenuCheckboxItem
  RadioGroup: typeof Dropdown.DropdownMenuRadioGroup
  RadioItem: typeof Dropdown.DropdownMenuRadioItem
  Label: typeof Dropdown.DropdownMenuLabel
  Separator: typeof Dropdown.DropdownMenuSeparator
  Shortcut: typeof Dropdown.DropdownMenuShortcut
  Group: typeof Dropdown.DropdownMenuGroup
  Sub: typeof Dropdown.DropdownMenuSub
  SubTrigger: typeof Dropdown.DropdownMenuSubTrigger
  SubContent: typeof Dropdown.DropdownMenuSubContent
}

const TOUCH = "touch:min-h-11"

function isAction(item: MenuItem): item is MenuActionItem {
  return item.type === undefined || item.type === "item"
}

/**
 * Drops hidden (and not `permitted`) items, adds the separators asked for with
 * `separator`, and drops separators left dangling at either end or doubled up.
 */
export function visibleItems(items: MenuItem[]): MenuItem[] {
  const out: MenuItem[] = []
  const push = (item: MenuItem) => {
    if (item.type === "separator" && (out.length === 0 || out[out.length - 1]!.type === "separator")) return
    out.push(item)
  }
  for (const item of items) {
    if (item.hidden || (isAction(item) && item.permitted === false)) continue
    if (isAction(item) && item.separator) push({ type: "separator", id: item.id && `${item.id}-separator` })
    push(item)
  }
  while (out.length && out[out.length - 1]!.type === "separator") out.pop()
  return out
}

/** Whether choosing the item asks first: `confirm` is set, or it is `destructive`. */
export function needsConfirm(item: MenuActionItem) {
  return item.confirm === undefined ? !!item.destructive : !!item.confirm
}

/**
 * The question to ask before running an item. With a record `name`, `true`
 * (or a `destructive` item) asks "Delete Jane Doe?" (`id: "delete"`),
 * "Permanently delete Jane Doe?" (`id: "force-delete"`) or "Approve Jane Doe?"
 * (the item's label), and given options are laid over that question.
 */
export function useConfirmQuestion(name?: string) {
  const { t } = useTranslation()
  return React.useCallback(
    (item: MenuActionItem): ConfirmOptions => {
      const destructive = !!item.destructive || item.variant === "destructive"
      const custom = customQuestion(item.confirm)
      if (name === undefined) {
        if (typeof item.confirm === "string" || typeof item.confirm === "object") return custom
        return destructive ? { variant: "destructive" } : {}
      }
      if (item.id === "force-delete")
        return {
          title: t("listing.deletePermanentlyTitle", { name }),
          description: t("listing.deletePermanentlyDescription"),
          confirmLabel: t("listing.deletePermanently"),
          variant: "destructive",
          ...custom,
        }
      return {
        title: item.id === "delete" ? t("listing.deleteRecordTitle", { name }) : `${textOf(item.label)} ${name}?`,
        description: t("listing.deleteRecordDescription"),
        confirmLabel: item.label,
        variant: destructive ? "destructive" : "default",
        ...custom,
      }
    },
    [name, t],
  )
}

/** Options from `confirm`; the listing shape's `destructive` becomes `variant`. */
function customQuestion(confirm: MenuActionItem["confirm"]): ConfirmOptions {
  if (typeof confirm === "string") return { title: confirm }
  if (!confirm || confirm === true) return {}
  const { destructive, ...options } = confirm as ConfirmOptions & { destructive?: boolean }
  return destructive === undefined ? options : { ...options, variant: destructive ? "destructive" : "default" }
}

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  return ""
}

export function MenuItems({
  items,
  parts,
  itemClassName,
  onAsk,
}: {
  items: MenuItem[]
  parts: MenuParts
  itemClassName?: string
  /** Handles items that need confirmation (e.g. asks once the menu has closed). Default: ask right away with `useConfirm()`. */
  onAsk?: (item: MenuActionItem) => void
}) {
  const confirm = useConfirm()
  const question = useConfirmQuestion()
  const Link = useLinkComponent()
  const P = parts

  return (
    <>
      {visibleItems(items).map((item, index) => {
        const key = item.id ?? index
        switch (item.type) {
          case "separator":
            return <P.Separator key={key} />
          case "label":
            return <P.Label key={key}>{item.label}</P.Label>
          case "group":
            return (
              <P.Group key={key}>
                {item.label ? <P.Label>{item.label}</P.Label> : null}
                <MenuItems items={item.items} parts={parts} itemClassName={itemClassName} onAsk={onAsk} />
              </P.Group>
            )
          case "sub":
            return (
              <P.Sub key={key}>
                <P.SubTrigger disabled={item.disabled} className={cn(TOUCH, itemClassName)}>
                  {item.icon ? <Icon name={item.icon} /> : null}
                  {item.label}
                </P.SubTrigger>
                <P.SubContent>
                  <MenuItems items={item.items} parts={parts} itemClassName={itemClassName} onAsk={onAsk} />
                </P.SubContent>
              </P.Sub>
            )
          case "checkbox":
            return (
              <P.CheckboxItem
                key={key}
                checked={item.checked}
                onCheckedChange={(c) => item.onCheckedChange(c === true)}
                disabled={item.disabled}
                className={cn(TOUCH, itemClassName)}
                // Keep the menu open so several options can be toggled.
                onSelect={(e) => e.preventDefault()}
              >
                {item.icon ? <Icon name={item.icon} /> : null}
                {item.label}
                {item.shortcut ? <Shortcut parts={P} value={item.shortcut} className="me-4" /> : null}
              </P.CheckboxItem>
            )
          case "radio":
            return (
              <React.Fragment key={key}>
                {item.label ? <P.Label>{item.label}</P.Label> : null}
                <P.RadioGroup value={item.value} onValueChange={item.onValueChange}>
                  {item.options.map((option) => (
                    <P.RadioItem
                      key={option.value}
                      value={option.value}
                      disabled={item.disabled || option.disabled}
                      className={cn(TOUCH, itemClassName)}
                    >
                      {option.icon ? <Icon name={option.icon} /> : null}
                      {option.label}
                    </P.RadioItem>
                  ))}
                </P.RadioGroup>
              </React.Fragment>
            )
          default: {
            const content = (
              <>
                {item.icon ? <Icon name={item.icon} /> : null}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.shortcut ? <Shortcut parts={P} value={item.shortcut} /> : null}
              </>
            )
            const variant = item.variant ?? (item.destructive ? "destructive" : undefined)
            const run = () => {
              if (!needsConfirm(item)) return void item.onSelect?.()
              if (onAsk) return onAsk(item)
              void confirm(question(item)).then((ok) => {
                if (ok) void item.onSelect?.()
              })
            }
            if (item.href && !item.disabled) {
              return (
                <P.Item key={key} asChild variant={variant} className={cn(TOUCH, itemClassName)} onSelect={run}>
                  <Link href={item.href}>{content}</Link>
                </P.Item>
              )
            }
            return (
              <P.Item
                key={key}
                variant={variant}
                disabled={item.disabled}
                className={cn(TOUCH, itemClassName)}
                onSelect={run}
              >
                {content}
              </P.Item>
            )
          }
        }
      })}
    </>
  )
}

function Shortcut({ parts, value, className }: { parts: MenuParts; value: string; className?: string }) {
  // Shortcuts are Latin key names; keep their order in RTL.
  return (
    <parts.Shortcut className={className}>
      <span dir="ltr">{value}</span>
    </parts.Shortcut>
  )
}
