"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { SidebarProvider } from "../../ui/sidebar"
import { layoutGreyClass, shellClasses } from "./_shell"
import { Breadcrumbs, type BreadcrumbsItem } from "./breadcrumbs"
import { SkipLink } from "./skip-link"

export type AppLayoutVariant = "panel" | "flat"

interface AppLayoutContextValue {
  variant: AppLayoutVariant
  /** The page's breadcrumb trail, shown by the page header band (`PageTitle`). */
  breadcrumbs?: BreadcrumbsItem[]
  /** A page header band that shows `breadcrumbs` calls this while mounted (returns the cleanup). */
  registerBand: () => () => void
}

const AppLayoutContext = React.createContext<AppLayoutContextValue | null>(null)

/** The surrounding `AppLayout` (variant and breadcrumbs), or `null` outside one. */
export function useAppLayout() {
  return React.useContext(AppLayoutContext)
}

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
  /**
   * `panel` (default): the sidebar and header sit on the app shell colour and
   * the content is a white panel with a rounded top-start corner and a 1px
   * shell border (Proton). `flat`: the content fills the body, with the
   * sidebar's edge line and a bordered header.
   */
  variant?: AppLayoutVariant
  /**
   * The panel's background. `default` is the page background (tables, forms);
   * `layout` is the light grey behind dashboards made of cards.
   */
  background?: "default" | "layout"
  /**
   * The page's breadcrumb trail. A page header (`PageTitle`, `ListingPage`)
   * shows it in its band; pages without one show it above the content.
   */
  breadcrumbs?: BreadcrumbsItem[]
  classNames?: { body?: string; panel?: string; main?: string; content?: string; breadcrumbs?: string }
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
  variant = "panel",
  background = "default",
  breadcrumbs,
  className,
  classNames,
  ...props
}: AppLayoutProps) {
  const panel = variant === "panel"
  // Page header bands (PageTitle) that show the breadcrumbs register here, so the copy above the content goes.
  const [bands, setBands] = React.useState(0)
  const registerBand = React.useCallback(() => {
    setBands((n) => n + 1)
    return () => setBands((n) => n - 1)
  }, [])
  const context = React.useMemo(() => ({ variant, breadcrumbs, registerBand }), [variant, breadcrumbs, registerBand])

  const main = (
    <main
      id={mainId}
      tabIndex={-1}
      data-slot="app-layout-main"
      className={cn(
        "min-w-0 p-4 md:p-6 flex-1 outline-none",
        // A page header band starts at the top edge of the panel.
        "has-[[data-slot=page-title][data-variant=band]]:pt-0",
        // ...and shows the breadcrumb trail, so the copy above the content hides.
        "[&:has([data-slot=page-title][data-variant=band])_[data-slot=app-layout-breadcrumbs]]:hidden",
        bottomNav && "md:pb-6 pb-[calc(5rem+env(safe-area-inset-bottom))]",
        classNames?.main,
      )}
    >
      <div data-slot="app-layout-content" className={cn("mx-auto w-full", WIDTHS[contentWidth], classNames?.content)}>
        {breadcrumbs?.length && bands === 0 ? (
          <div data-slot="app-layout-breadcrumbs" className={cn("mb-4", classNames?.breadcrumbs)}>
            <Breadcrumbs items={breadcrumbs} />
          </div>
        ) : null}
        {children}
      </div>
    </main>
  )

  return (
    <AppLayoutContext.Provider value={context}>
      <SidebarProvider
        data-slot="app-layout"
        data-variant={variant}
        defaultOpen={defaultSidebarOpen}
        open={sidebarOpen}
        onOpenChange={onSidebarOpenChange}
        className={cn(panel && shellClasses.bg, className)}
        {...props}
      >
        {skipLink ? <SkipLink href={`#${mainId}`} /> : null}
        {sidebar}
        <div
          data-slot="app-layout-body"
          className={cn(
            "min-w-0 relative flex w-full flex-1 flex-col",
            panel ? shellClasses.bg : "bg-background",
            "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ms-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ms-2",
            classNames?.body,
          )}
        >
          {header}
          {panel ? (
            <div
              data-slot="app-layout-panel"
              data-background={background}
              className={cn(
                // The content panel: rounded top-start corner and a 1px shell line on the top and start edges.
                "min-w-0 flex flex-1 flex-col overflow-clip text-foreground",
                background === "layout" ? layoutGreyClass : "bg-background",
                "md:rounded-ss-[12px] md:border-t md:border-s",
                shellClasses.border,
                classNames?.panel,
              )}
            >
              {main}
              {footer}
            </div>
          ) : (
            <>
              {main}
              {footer}
            </>
          )}
        </div>
        {bottomNav}
      </SidebarProvider>
    </AppLayoutContext.Provider>
  )
}
