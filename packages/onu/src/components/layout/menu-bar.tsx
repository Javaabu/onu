"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "../../ui/menubar"
import { NavIcon, NavLink } from "./_nav"

export type MenuBarEntry =
  | {
      type?: "item"
      label: React.ReactNode
      icon?: string | React.ReactNode
      /** Keyboard shortcut hint, e.g. "⌘S". */
      shortcut?: string
      /** Render as a link (through the configured link component). */
      href?: string
      disabled?: boolean
      variant?: "default" | "destructive"
      onSelect?: (event: Event) => void
    }
  | { type: "separator" }
  | { type: "label"; label: React.ReactNode }
  | {
      type: "checkbox"
      label: React.ReactNode
      checked: boolean
      onCheckedChange: (checked: boolean) => void
      shortcut?: string
      disabled?: boolean
    }
  | {
      type: "radio"
      value: string
      onValueChange: (value: string) => void
      options: { value: string; label: React.ReactNode; disabled?: boolean }[]
    }
  | { type: "sub"; label: React.ReactNode; icon?: string | React.ReactNode; items: MenuBarEntry[] }

export interface MenuBarMenu {
  id?: string
  label: React.ReactNode
  items: MenuBarEntry[]
}

export interface MenuBarProps extends Omit<React.ComponentProps<typeof Menubar>, "children"> {
  menus: MenuBarMenu[]
  classNames?: { trigger?: string; content?: string; item?: string }
}

function Entries({ items, itemClass }: { items: MenuBarEntry[]; itemClass?: string }) {
  return (
    <>
      {items.map((entry, i) => {
        switch (entry.type) {
          case "separator":
            return <MenubarSeparator key={i} />
          case "label":
            return <MenubarLabel key={i}>{entry.label}</MenubarLabel>
          case "checkbox":
            return (
              <MenubarCheckboxItem
                key={i}
                checked={entry.checked}
                onCheckedChange={(v) => entry.onCheckedChange(v === true)}
                disabled={entry.disabled}
                className={itemClass}
              >
                {entry.label}
                {entry.shortcut ? <MenubarShortcut>{entry.shortcut}</MenubarShortcut> : null}
              </MenubarCheckboxItem>
            )
          case "radio":
            return (
              <MenubarRadioGroup key={i} value={entry.value} onValueChange={entry.onValueChange}>
                {entry.options.map((option) => (
                  <MenubarRadioItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={itemClass}
                  >
                    {option.label}
                  </MenubarRadioItem>
                ))}
              </MenubarRadioGroup>
            )
          case "sub":
            return (
              <MenubarSub key={i}>
                <MenubarSubTrigger className={cn("gap-2", itemClass)}>
                  <NavIcon icon={entry.icon} />
                  {entry.label}
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <Entries items={entry.items} itemClass={itemClass} />
                </MenubarSubContent>
              </MenubarSub>
            )
          default: {
            const content = (
              <>
                <NavIcon icon={entry.icon} />
                {entry.label}
                {entry.shortcut ? <MenubarShortcut>{entry.shortcut}</MenubarShortcut> : null}
              </>
            )
            return entry.href ? (
              <MenubarItem
                key={i}
                asChild
                disabled={entry.disabled}
                variant={entry.variant}
                onSelect={entry.onSelect}
                className={itemClass}
              >
                <NavLink href={entry.href}>{content}</NavLink>
              </MenubarItem>
            ) : (
              <MenubarItem
                key={i}
                disabled={entry.disabled}
                variant={entry.variant}
                onSelect={entry.onSelect}
                className={itemClass}
              >
                {content}
              </MenubarItem>
            )
          }
        }
      })}
    </>
  )
}

/**
 * A desktop-style application menu bar (File, Edit, View …) from data, built on the
 * shadcn `Menubar` (WAI-ARIA menubar). Arrow keys follow the visual order in RTL.
 * The bar scrolls sideways when it does not fit.
 */
export function MenuBar({ menus, className, classNames, ...props }: MenuBarProps) {
  return (
    <Menubar className={cn("no-scrollbar max-w-full overflow-x-auto", className)} {...props}>
      {menus.map((menu, i) => (
        <MenubarMenu key={menu.id ?? i}>
          <MenubarTrigger className={cn("touch:min-h-11", classNames?.trigger)}>{menu.label}</MenubarTrigger>
          <MenubarContent className={classNames?.content}>
            <MenubarGroup>
              <Entries items={menu.items} itemClass={classNames?.item} />
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  )
}
