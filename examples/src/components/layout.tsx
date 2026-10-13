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
import { DocsNav } from "./docs-nav"
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

/** The Onu mark, drawn in the current primary colour so it re-brands with the theme. */
export function BrandMark({ className }: { className?: string }) {
  // Onu means bamboo: two leaning culms with nodes and leaves, on a primary gradient tile.
  const id = `onu-mark-${React.useId().replace(/:/g, "")}`
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-6 shrink-0", className)}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--primary), white 14%)" }} />
          <stop offset="1" style={{ stopColor: "color-mix(in oklab, var(--primary), black 10%)" }} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id})`} />
      <g className="fill-primary-foreground">
        <g transform="rotate(-7 13 26)">
          <path d="M11.3 27.5h3.6l-.15-6.9h-3.3z" />
          <path d="M11.5 19.6h3.3l-.15-6.1h-3z" />
          <path d="M11.7 12.5h3l-.2-6.2c0-.6-.4-1-1.3-1s-1.3.4-1.3 1z" />
          <rect x="10.6" y="19.85" width="5" height="1.05" rx=".5" />
          <rect x="10.9" y="12.75" width="4.6" height="1.05" rx=".5" />
        </g>
        <g transform="rotate(6 20 27)" opacity=".78">
          <path d="M18.7 27.5h2.8l-.12-6.8h-2.56z" />
          <path d="M18.9 19.7h2.5l-.12-3.6c0-.55-.38-.9-1.13-.9s-1.13.35-1.13.9z" />
          <rect x="18.05" y="19.95" width="4.1" height="1" rx=".5" />
        </g>
        <path d="M15.6 12.9c.9-3.2 3.2-5.3 6.2-6.1-.4 2.9-2.7 5.4-6.2 6.1z" />
        <path d="M15.4 13.7c2.6-1.1 5.5-.9 7.6.6-2.4 1.5-5.3 1.3-7.6-.6z" opacity=".85" />
        <path d="M11.4 20.4c-2.1-1.9-4.7-2.5-7-1.8 1.3 2.2 4 3.1 7 1.8z" opacity=".9" />
      </g>
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
        <nav aria-label="Main" className="px-3 pb-3 gap-1 grid grid-cols-2">
          {MAIN_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              onClick={() => setOpen(false)}
              className="px-2 py-1.5 text-sm rounded-md text-foreground/80 hover:bg-accent hover:text-accent-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <DocsNav onNavigate={() => setOpen(false)} className="px-3 pt-3 flex-1 border-t" />
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

/** Sticky top bar: logo, main links, search, GitHub, language, theme and Customize. */
export function SiteHeader() {
  const { pathname } = useLocation()
  const { settings, update } = useSettings()
  return (
    <header className="top-0 backdrop-blur sticky z-40 w-full border-b bg-background/80 supports-backdrop-filter:bg-background/70">
      <div className="max-w-screen-2xl gap-2 px-4 md:px-6 h-14 mx-auto flex items-center">
        <MobileNav />
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

/**
 * The docs chrome. `sidebar` adds the left menu (from lg) and `toc` the
 * right "On this page" column (from xl).
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
  return (
    <div data-docs-chrome className="flex min-h-svh flex-col bg-background text-foreground">
      <SkipLink href="#main-content" />
      <SiteHeader />
      {sidebar ? (
        <div className="max-w-screen-2xl px-4 md:px-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 mx-auto w-full flex-1">
          <aside
            aria-label="Docs menu"
            className="top-14 lg:flex pt-6 pe-2 sticky hidden h-[calc(100svh-3.5rem)] flex-col border-e"
          >
            <DocsNav className="flex-1" />
          </aside>
          <main
            id="main-content"
            tabIndex={-1}
            className={cn(
              "py-6 lg:py-8 min-w-0 outline-none",
              toc && "xl:gap-10 xl:grid xl:grid-cols-[minmax(0,1fr)_13rem]",
            )}
          >
            <div className="max-w-4xl min-w-0 mx-auto w-full">{children}</div>
            {toc ? (
              <aside aria-label="On this page" className="xl:block hidden">
                <div className="top-20 sticky max-h-[calc(100svh-6rem)] overflow-y-auto">
                  <TableOfContents />
                </div>
              </aside>
            ) : null}
          </main>
        </div>
      ) : (
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
      )}
      <SiteFooter />
    </div>
  )
}

/** Floating controls on full-screen sample pages: back to the docs, and Customize. */
export function BareChrome() {
  return (
    <div
      className="end-3 bottom-3 gap-1 p-1 shadow-lg backdrop-blur fixed z-50 flex items-center rounded-full border bg-background/95"
      data-print="hide"
    >
      <Button asChild variant="ghost" size="sm" className="rounded-full">
        <Link to={navSections[2]!.href}>
          <Icon name="arrow-left" /> Back to docs
        </Link>
      </Button>
      <CustomizeButton full className="rounded-full" />
    </div>
  )
}
