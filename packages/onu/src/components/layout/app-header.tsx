"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { Separator } from "../../ui/separator"
import { SidebarTrigger } from "../../ui/sidebar"
import { shellClasses } from "./_shell"
import { useAppLayout } from "./app-layout"

/**
 * The header on the app shell (Proton): the shell colour, no edge line, 60px
 * tall, a wide 40px rounded search field and quiet 36px icon buttons.
 */
const SHELL_HEADER = [
  shellClasses.bg,
  shellClasses.fg,
  "[--onu-header-height:3.75rem] supports-backdrop-filter:backdrop-blur-none",
  "supports-backdrop-filter:bg-[color:var(--shell,#f5f4f2)] dark:supports-backdrop-filter:bg-[color:var(--shell,#16141c)]",
  // The search field: wide, 40px, rounded, on the shell's field colour.
  "[&_[data-slot=search-box-form]]:max-w-xl [&_[data-slot=search-box-form]]:flex-1",
  "[&_[data-slot=search-box]]:min-h-10 [&_[data-slot=search-box]]:h-10 [&_[data-slot=search-box]]:rounded-lg",
  "[&_[data-slot=search-box]]:bg-[color:var(--shell-field,#ffffff)] dark:[&_[data-slot=search-box]]:bg-[color:var(--shell-field,#292733)]",
  "[&_[data-slot=search-box]]:border-[color:var(--shell-border,#e5e3e0)] dark:[&_[data-slot=search-box]]:border-[color:var(--shell-border,#343140)]",
  "[&_[data-slot=search-box]:hover]:border-[color:color-mix(in_oklab,var(--primary)_60%,transparent)]",
  // Icon and ghost buttons: 36px, 8px corners, muted until hovered.
  "[&_[data-slot=button][data-variant=ghost]]:rounded-lg [&_[data-slot=button][data-variant=ghost]]:text-muted-foreground",
  "[&_[data-slot=button][data-variant=ghost]:hover]:text-foreground",
  "[&_[data-slot=button][data-variant=ghost]:hover]:bg-[color:var(--shell-hover,rgb(194_193_192/0.2))] dark:[&_[data-slot=button][data-variant=ghost]:hover]:bg-[color:var(--shell-hover,rgb(91_87_107/0.2))]",
  "[&_[data-slot=button][data-size^=icon]]:size-9 touch:[&_[data-slot=button][data-size^=icon]]:size-11",
  // The account avatar: Proton's rounded square on the weak shell grey.
  "[&_[data-slot=user-profile]_[data-slot=user-avatar]]:rounded-lg [&_[data-slot=user-profile]_[data-slot=user-avatar]>*]:rounded-lg [&_[data-slot=user-profile]_[data-slot=user-avatar]>*]:font-semibold [&_[data-slot=user-profile]_[data-slot=user-avatar]>*]:text-foreground",
  "[&_[data-slot=user-profile]_[data-slot=user-avatar]>*]:bg-[color:var(--shell-weak,#eae7e4)] dark:[&_[data-slot=user-profile]_[data-slot=user-avatar]>*]:bg-[color:var(--shell-weak,#3f3b4c)]",
  // The account button: the avatar alone on narrow screens, no chevron.
  "max-md:[&_[data-slot=user-profile-text]]:hidden [&_[data-slot=user-profile-chevron]]:hidden max-md:[&_[data-slot=user-profile]]:min-h-9 max-md:[&_[data-slot=user-profile]]:p-0.5",
].join(" ")

export const appHeaderVariants = cva(
  "gap-2 px-4 supports-backdrop-filter:backdrop-blur z-30 flex h-[calc(var(--onu-header-height,3.5rem)+env(safe-area-inset-top))] w-full shrink-0 items-center bg-background/95 pt-[env(safe-area-inset-top)] [--onu-header-height:3.5rem] supports-backdrop-filter:bg-background/80 [&_[data-slot=user-profile]]:w-auto",
  {
    variants: {
      variant: {
        default: "border-b",
        plain: "",
        shell: SHELL_HEADER,
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
   * `shell` (the default inside a panel `AppLayout`): on the app shell colour
   * with a wide rounded search. `default`: the page background with a bottom
   * border (the default inside a flat `AppLayout` or on its own). `plain`: no
   * border. `primary`: the brand colour.
   */
  variant?: VariantProps<typeof appHeaderVariants>["variant"]
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
  const layout = useAppLayout()
  const resolved = variant ?? (layout?.variant === "panel" ? "shell" : "default")
  return (
    <header
      data-slot="app-header"
      data-variant={resolved}
      className={cn(appHeaderVariants({ variant: resolved, sticky }), className)}
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
      <div
        data-slot="app-header-center"
        className={cn("gap-2 min-w-0 flex flex-1 items-center", resolved === "shell" && "gap-3", classNames?.center)}
      >
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
