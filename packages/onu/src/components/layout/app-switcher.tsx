"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { NavIcon, NavLink } from "./_nav"

export interface AppSwitcherApp {
  label: React.ReactNode
  href: string
  /** Semantic icon name or node, shown on a brand-tinted tile. */
  icon?: string | React.ReactNode
  /** The app you are in (`aria-current="page"`). */
  current?: boolean
  external?: boolean
}

export interface AppSwitcherProps {
  apps: AppSwitcherApp[]
  /** Heading at the top of the menu, e.g. "Atoll apps". Default "Apps". */
  label?: React.ReactNode
  /** Accessible name of the button. Default "Switch app". */
  triggerLabel?: string
  /** Menu alignment. Default `start`. */
  align?: "start" | "center" | "end"
  className?: string
  classNames?: { trigger?: string; content?: string; item?: string; tile?: string }
}

/**
 * The app switcher next to the logo (Proton's grid button): a menu of the
 * products in a suite, each on a brand-tinted tile. Links go through the
 * configured link component.
 */
export function AppSwitcher({ apps, label, triggerLabel, align = "start", className, classNames }: AppSwitcherProps) {
  const { t } = useTranslation()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-slot="app-switcher-trigger"
          aria-label={triggerLabel ?? t("layout.switchApp")}
          className={cn(
            "size-9 touch:size-11 shrink-0 rounded-lg text-muted-foreground group-data-[collapsible=icon]:hidden hover:text-foreground",
            "hover:bg-[color:var(--shell-hover,rgb(194_193_192/0.2))] dark:hover:bg-[color:var(--shell-hover,rgb(91_87_107/0.2))]",
            classNames?.trigger,
            className,
          )}
        >
          <Icon name="grid" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={cn("w-56", classNames?.content)}>
        <DropdownMenuLabel>{label ?? t("layout.apps")}</DropdownMenuLabel>
        {apps.map((app, i) => (
          <DropdownMenuItem key={app.href ?? i} asChild className={classNames?.item}>
            <NavLink href={app.href} external={app.external} aria-current={app.current ? "page" : undefined}>
              <span
                aria-hidden="true"
                data-slot="app-switcher-tile"
                className={cn(
                  "size-7 [&_svg]:size-4 inline-grid shrink-0 place-items-center rounded-md bg-primary-subtle text-primary-subtle-foreground",
                  classNames?.tile,
                )}
              >
                <NavIcon icon={app.icon ?? "grid"} />
              </span>
              <span className={cn(app.current && "font-semibold")}>{app.label}</span>
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
