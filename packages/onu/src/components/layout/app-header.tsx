"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { Separator } from "../../ui/separator"
import { SidebarTrigger } from "../../ui/sidebar"

export const appHeaderVariants = cva(
  "gap-2 px-4 supports-backdrop-filter:backdrop-blur z-30 flex h-[calc(var(--onu-header-height,3.5rem)+env(safe-area-inset-top))] w-full shrink-0 items-center bg-background/95 pt-[env(safe-area-inset-top)] [--onu-header-height:3.5rem] supports-backdrop-filter:bg-background/80",
  {
    variants: {
      variant: {
        default: "border-b",
        plain: "",
        primary:
          "bg-primary text-primary-foreground supports-backdrop-filter:bg-primary [&_[data-slot=button][data-variant=ghost]]:hover:bg-primary-foreground/10",
      },
      sticky: {
        true: "top-0 sticky",
        false: "",
      },
    },
    defaultVariants: { variant: "default", sticky: true },
  },
)

export interface AppHeaderProps extends React.ComponentProps<"header">, VariantProps<typeof appHeaderVariants> {
  /** Start of the header, e.g. a `Logo`. */
  logo?: React.ReactNode
  /** End of the header, e.g. search, `NotificationCenter`, `UserProfile`. */
  actions?: React.ReactNode
  /**
   * Show the sidebar toggle (needs `AppLayout` or a `SidebarProvider`). On phones it
   * opens the off-canvas drawer.
   */
  sidebarTrigger?: boolean
  classNames?: { start?: string; center?: string; end?: string; trigger?: string }
}

/**
 * The top bar of an app: sidebar toggle, logo, main content (title, navigation,
 * search) and actions. Sticky by default, respecting the notch (safe-area inset).
 */
export function AppHeader({
  logo,
  actions,
  sidebarTrigger = false,
  variant,
  sticky,
  className,
  classNames,
  children,
  ...props
}: AppHeaderProps) {
  return (
    <header
      data-slot="app-header"
      data-variant={variant ?? "default"}
      className={cn(appHeaderVariants({ variant, sticky }), className)}
      {...props}
    >
      {sidebarTrigger || logo ? (
        <div data-slot="app-header-start" className={cn("gap-2 flex shrink-0 items-center", classNames?.start)}>
          {sidebarTrigger ? (
            <>
              <SidebarTrigger className={cn("-ms-1 touch:size-11", classNames?.trigger)} />
              {logo ? (
                <Separator orientation="vertical" className="data-vertical:h-4 my-auto data-vertical:self-auto" />
              ) : null}
            </>
          ) : null}
          {logo}
        </div>
      ) : null}
      <div data-slot="app-header-center" className={cn("gap-2 min-w-0 flex flex-1 items-center", classNames?.center)}>
        {children}
      </div>
      {actions ? (
        <div data-slot="app-header-end" className={cn("gap-1 flex shrink-0 items-center", classNames?.end)}>
          {actions}
        </div>
      ) : null}
    </header>
  )
}
