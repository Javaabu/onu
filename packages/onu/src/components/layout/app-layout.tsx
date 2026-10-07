"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { SidebarProvider } from "../../ui/sidebar"
import { SkipLink } from "./skip-link"

export interface AppLayoutProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** The sidebar, usually an `AppSidebar`. */
  sidebar?: React.ReactNode
  /** The top bar, usually an `AppHeader` with `sidebarTrigger`. */
  header?: React.ReactNode
  /** Page footer inside the content column. */
  footer?: React.ReactNode
  /** Phone bottom navigation, usually a `BottomNav`. Content gets padding so nothing hides behind it. */
  bottomNav?: React.ReactNode
  children?: React.ReactNode
  /** Sidebar open on desktop by default (uncontrolled). */
  defaultSidebarOpen?: boolean
  /** Controlled sidebar state (desktop). */
  sidebarOpen?: boolean
  onSidebarOpenChange?: (open: boolean) => void
  /** Render a "Skip to content" link first (R14.4). */
  skipLink?: boolean
  /** Id of `<main>`, the skip link target. */
  mainId?: string
  /** Constrain the content width. */
  contentWidth?: "full" | "wide" | "default" | "narrow"
  classNames?: { body?: string; main?: string; content?: string }
}

const WIDTHS = {
  full: "",
  wide: "max-w-screen-2xl",
  default: "max-w-6xl",
  narrow: "max-w-3xl",
} as const

/**
 * The application shell: skip link, sidebar (collapsible to icons, off-canvas
 * drawer on phones), header, main content, footer and an optional phone bottom
 * navigation. Built on the shadcn `SidebarProvider`; works in RTL with the
 * sidebar on the inline start.
 */
export function AppLayout({
  sidebar,
  header,
  footer,
  bottomNav,
  children,
  defaultSidebarOpen = true,
  sidebarOpen,
  onSidebarOpenChange,
  skipLink = true,
  mainId = "main-content",
  contentWidth = "full",
  className,
  classNames,
  ...props
}: AppLayoutProps) {
  return (
    <SidebarProvider
      data-slot="app-layout"
      defaultOpen={defaultSidebarOpen}
      open={sidebarOpen}
      onOpenChange={onSidebarOpenChange}
      className={className}
      {...props}
    >
      {skipLink ? <SkipLink href={`#${mainId}`} /> : null}
      {sidebar}
      <div
        data-slot="app-layout-body"
        className={cn(
          "min-w-0 relative flex w-full flex-1 flex-col bg-background",
          "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ms-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ms-2",
          classNames?.body,
        )}
      >
        {header}
        <main
          id={mainId}
          tabIndex={-1}
          data-slot="app-layout-main"
          className={cn(
            "min-w-0 p-4 md:p-6 flex-1 outline-none",
            bottomNav && "md:pb-6 pb-[calc(5rem+env(safe-area-inset-bottom))]",
            classNames?.main,
          )}
        >
          <div
            data-slot="app-layout-content"
            className={cn("mx-auto w-full", WIDTHS[contentWidth], classNames?.content)}
          >
            {children}
          </div>
        </main>
        {footer}
      </div>
      {bottomNav}
    </SidebarProvider>
  )
}
