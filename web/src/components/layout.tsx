import * as React from "react"
import { Link, useLocation } from "react-router"
import {
  Button,
  Icon,
  LanguageSwitcher,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SidebarProvider,
  SidebarTrigger,
  SkipLink,
  ThemeToggle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
  useDirection,
} from "@javaabu/onu"

import { navSections } from "../registry"
import { useSettings } from "../settings"
import { BrandMark } from "./brand-mark"
import { DocsSidebar } from "./docs-nav"
import { SearchButton } from "./search"
import { TableOfContents } from "./toc"
import { CustomizeButton } from "./toolbar"

export const GITHUB_URL = "https://github.com/javaabu/onu"

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-4 fill-current", className)}>
      <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "gap-2 font-semibold flex shrink-0 items-center rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      <BrandMark />
      <span className="tracking-tight">Onu</span>
    </Link>
  )
}

const MAIN_LINKS = [
  { label: "Docs", href: "/", match: (p: string) => p === "/" },
  {
    label: "Components",
    href: "/components",
    match: (p: string) => p.startsWith("/components") && !p.startsWith("/components/foundations"),
  },
  { label: "Sample pages", href: "/pages", match: (p: string) => p.startsWith("/pages") },
  {
    label: "Themes",
    href: "/components/foundations/theme-builder",
    match: (p: string) => p.startsWith("/components/foundations"),
  },
]

function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const dir = useDirection()
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="-ms-1.5 lg:hidden" aria-label="Open menu">
          <Icon name="menu" />
        </Button>
      </SheetTrigger>
      <SheetContent side={dir === "rtl" ? "right" : "left"} className="gap-0 p-0 max-w-xs w-[85vw]">
        <SheetHeader className="p-4 pb-2">
          <SheetTitle asChild>
            <div>
              <Logo />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Main" className="px-3 pb-3 gap-1 grid">
          {MAIN_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              onClick={() => setOpen(false)}
              className="px-2 py-2 text-sm rounded-md text-foreground/80 hover:bg-accent hover:text-accent-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="ghost" size="icon">
          <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
            {children}
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/**
 * Sticky top bar on every docs page: logo, main links, search, GitHub,
 * language, theme and Customize. With `sidebarTrigger` (pages with the docs
 * menu) the menu button toggles the sidebar, a drawer on phones.
 */
export function SiteHeader({ sidebarTrigger = false }: { sidebarTrigger?: boolean }) {
  const { pathname } = useLocation()
  return (
    <header className="top-0 backdrop-blur sticky z-40 w-full border-b bg-background/80 supports-backdrop-filter:bg-background/70">
      <div
        className={cn(
          "gap-2 px-4 md:px-6 h-14 flex items-center",
          sidebarTrigger ? "w-full" : "max-w-screen-2xl mx-auto",
        )}
      >
        {sidebarTrigger ? <SidebarTrigger className="-ms-1.5 size-9" /> : <MobileNav />}
        <Logo className="me-4" />
        <nav aria-label="Main" className="gap-1 lg:flex hidden items-center">
          {MAIN_LINKS.map((l) => {
            const active = l.match(pathname)
            return (
              <Link
                key={l.label}
                to={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "px-2.5 py-1.5 text-sm rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  active &&
                    "font-medium text-foreground underline decoration-primary decoration-2 underline-offset-[1.15rem]",
                )}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
        <div className="gap-1 ms-auto flex items-center">
          <SearchButton className="me-1" />
          <HeaderActions />
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="py-6 border-t">
      <div className="max-w-screen-2xl px-4 md:px-6 text-sm mx-auto text-muted-foreground">
        Built by{" "}
        <a href="https://javaabu.com" className="font-medium underline underline-offset-4 hover:text-foreground">
          Javaabu
        </a>
        . The source code is available on{" "}
        <a href={GITHUB_URL} className="font-medium underline underline-offset-4 hover:text-foreground">
          GitHub
        </a>
        .
      </div>
    </footer>
  )
}

/** Header actions shared by the home page and the docs shell: GitHub, language, theme and Customize. */
function HeaderActions() {
  const { settings, update } = useSettings()
  return (
    <>
      <span className="sm:contents hidden">
        <IconLink href={GITHUB_URL} label="GitHub">
          <GitHubIcon />
        </IconLink>
      </span>
      <LanguageSwitcher
        variant="menu"
        size="sm"
        value={settings.locale}
        onChange={(code) => update({ locale: code as "en" | "dv" })}
      />
      <ThemeToggle size="sm" />
      <CustomizeButton />
    </>
  )
}

const SIDEBAR_KEY = "onu-docs-sidebar"

/** The docs sidebar's expanded/collapsed state, kept across pages and visits. */
function useSidebarOpen() {
  const [open, setOpen] = React.useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) !== "collapsed"
    } catch {
      return true
    }
  })
  const change = React.useCallback((next: boolean) => {
    setOpen(next)
    try {
      localStorage.setItem(SIDEBAR_KEY, next ? "expanded" : "collapsed")
    } catch {
      // Storage blocked: the state lasts for this page only.
    }
  }, [])
  return [open, change] as const
}

/**
 * The docs pages: the same top bar as the home page, and below it the docs
 * menu (the library's `AppSidebar`) beside the content. `toc` adds the "On this
 * page" column (from xl).
 */
function DocsShell({ children, toc }: { children: React.ReactNode; toc: boolean }) {
  const [open, setOpen] = useSidebarOpen()
  return (
    <SidebarProvider
      data-docs-chrome
      open={open}
      onOpenChange={setOpen}
      // Wide enough for "Layout and navigation" with its count.
      style={{ "--sidebar-width": "17.5rem" } as React.CSSProperties}
      className="flex-col bg-background text-foreground"
    >
      <SkipLink href="#main-content" />
      <SiteHeader sidebarTrigger />
      <div className="flex flex-1">
        <DocsSidebar />
        <div className="min-w-0 flex flex-1 flex-col">
          <main id="main-content" tabIndex={-1} className="px-4 py-6 md:px-6 lg:px-10 lg:py-8 flex-1 outline-none">
            <div
              className={cn("max-w-screen-xl mx-auto", toc && "xl:gap-10 xl:grid xl:grid-cols-[minmax(0,1fr)_13rem]")}
            >
              <div className="max-w-4xl min-w-0 mx-auto w-full">{children}</div>
              {toc ? (
                <aside aria-label="On this page" className="xl:block hidden">
                  <div className="top-20 sticky max-h-[calc(100svh-6rem)] overflow-y-auto">
                    <TableOfContents />
                  </div>
                </aside>
              ) : null}
            </div>
          </main>
          <SiteFooter />
        </div>
      </div>
    </SidebarProvider>
  )
}

/**
 * The docs chrome. With `sidebar` (the default), the app shell with the docs
 * menu (`DocsShell`); without, the home page's top bar and full-width content.
 * `toc` adds the "On this page" column (from xl).
 */
export function SiteLayout({
  children,
  sidebar = true,
  toc = false,
}: {
  children: React.ReactNode
  sidebar?: boolean
  toc?: boolean
}) {
  if (sidebar) return <DocsShell toc={toc}>{children}</DocsShell>
  return (
    <div data-docs-chrome className="flex min-h-svh flex-col bg-background text-foreground">
      <SkipLink href="#main-content" />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}

/**
 * Floating controls on full-screen sample pages: back to the page's block in
 * the docs, and Customize. On phones they sit above a page's BottomNav instead
 * of covering its tabs. Hidden inside a blocks preview (an iframe), where the
 * docs page around it has the controls.
 */
export function BareChrome() {
  const { pathname } = useLocation()
  if (typeof window !== "undefined" && window.self !== window.top) return null
  const [, , category, ...rest] = pathname.split("/")
  const back = category ? `/pages/${category}#${rest.join("-")}` : navSections[2]!.href
  return (
    <div
      className="end-3 bottom-3 gap-1 p-1 shadow-lg backdrop-blur max-md:[:root:has([data-slot=bottom-nav])_&]:bottom-[calc(4.75rem+env(safe-area-inset-bottom))] fixed z-50 flex items-center rounded-full border bg-background/95"
      data-print="hide"
    >
      <Button asChild variant="ghost" size="sm" className="rounded-full">
        <Link to={back}>
          <Icon name="arrow-left" /> Back to docs
        </Link>
      </Button>
      <CustomizeButton full className="rounded-full" />
    </div>
  )
}
