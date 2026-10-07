"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import type { SemanticIconName } from "../../icons/types"
import { cn } from "../../lib/utils"
import { useLinkComponent } from "../../providers/onu-provider"
import type * as Dropdown from "../../ui/dropdown-menu"
import { useConfirm, type ConfirmOptions } from "./confirm-dialog"

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
  /** Renders a link (through the `OnuProvider` link component, R16.2). */
  href?: string
  /** Ask for confirmation before running `onSelect` (§25.6 "Delete Jane Doe?"). */
  confirm?: ConfirmOptions | string
  onSelect?: () => void
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

/** One entry of an `ActionMenu` or `ContextActionMenu`. */
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

/** Drops hidden items and separators left dangling at either end or doubled up. */
export function visibleItems(items: MenuItem[]): MenuItem[] {
  const out: MenuItem[] = []
  for (const item of items) {
    if (item.hidden) continue
    if (item.type === "separator" && (out.length === 0 || out[out.length - 1]!.type === "separator")) continue
    out.push(item)
  }
  while (out.length && out[out.length - 1]!.type === "separator") out.pop()
  return out
}

export function MenuItems({
  items,
  parts,
  itemClassName,
}: {
  items: MenuItem[]
  parts: MenuParts
  itemClassName?: string
}) {
  const confirm = useConfirm()
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
                <MenuItems items={item.items} parts={parts} itemClassName={itemClassName} />
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
                  <MenuItems items={item.items} parts={parts} itemClassName={itemClassName} />
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
            const run = () => {
              if (!item.confirm) return item.onSelect?.()
              // The menu closes first, then the confirmation opens (§25.6).
              void confirm(item.confirm).then((ok) => {
                if (ok) item.onSelect?.()
              })
            }
            if (item.href && !item.disabled) {
              return (
                <P.Item key={key} asChild variant={item.variant} className={cn(TOUCH, itemClassName)} onSelect={run}>
                  <Link href={item.href}>{content}</Link>
                </P.Item>
              )
            }
            return (
              <P.Item
                key={key}
                variant={item.variant}
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
