import * as React from "react"
import {
  AppHeader,
  AppLayout,
  AppSidebar,
  CommandPalette,
  Icon,
  Kbd,
  LanguageSwitcher,
  Logo,
  NotificationCenter,
  ThemeToggle,
  UserProfile,
  cn,
  type NavGroup,
} from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import "./neon-bento.css"

export const NB_ROUTES = {
  index: "/pages/design-options/neon-bento-index",
  dashboard: "/pages/design-options/neon-bento-dashboard",
  landing: "/pages/design-options/neon-bento-landing",
}

/** Fixed demo "now" so relative times are stable. */
export const NB_NOW = new Date("2026-10-08T14:20:00")

/** Moves the hover spotlight of the tile under the pointer. */
function spotlight(event: React.PointerEvent<HTMLElement>) {
  const tile = (event.target as HTMLElement).closest<HTMLElement>(".nb-tile")
  if (!tile) return
  const r = tile.getBoundingClientRect()
  tile.style.setProperty("--mx", `${event.clientX - r.left}px`)
  tile.style.setProperty("--my", `${event.clientY - r.top}px`)
}

/** Root of the Neon Bento option: scoped theme, backdrop grid and pointer spotlight. */
export function NeonBentoRoot({
  children,
  className,
  variant = "site",
}: {
  children: React.ReactNode
  className?: string
  variant?: "site" | "app"
}) {
  const dv = useDv()
  return (
    <div
      data-onu-theme
      className={cn("design-neon-bento", dv && "nb-dv", className)}
      onPointerMove={(e) => e.pointerType === "mouse" && spotlight(e)}
    >
      <div aria-hidden className="nb-backdrop" data-variant={variant} />
      {children}
    </div>
  )
}

export function NbLanguage({ variant = "menu" }: { variant?: "select" | "menu" }) {
  const { settings, update } = useSettings()
  return (
    <LanguageSwitcher
      variant={variant}
      value={settings.locale}
      onChange={(code) => update({ locale: code as "en" | "dv" })}
      size="sm"
    />
  )
}

/** Monospace micro-label, e.g. `// 01 — PLATFORM`. */
export function MicroLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("nb-mono text-muted-foreground", className)}>{children}</p>
}

/** The Onu Platform mark: a neon "O" made of two bento cells. */
export function NbMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7 shrink-0", className)}>
      <rect x="1" y="1" width="30" height="30" rx="9" className="fill-foreground" />
      <rect x="7" y="7" width="8" height="18" rx="3" className="fill-primary" />
      <rect x="17" y="7" width="8" height="8" rx="3" className="fill-background" />
      <rect x="17" y="17" width="8" height="8" rx="3" className="fill-primary opacity-60" />
    </svg>
  )
}

/** The Onu Console app shell shared by the dashboard and the records index. */
export function NbAppShell({ current, children }: { current: string; children: React.ReactNode }) {
  const tr = useTr()
  const nav: NavGroup[] = [
    {
      items: [
        { label: tr("Insights", "އިންސައިޓްސް"), href: NB_ROUTES.dashboard, icon: "home" },
        { label: tr("Live map", "ލައިވް މެޕް"), href: routes.maps.fleet, icon: "map-pin" },
        { label: tr("Reports", "ރިޕޯޓް"), href: routes.adminRecords.export, icon: "file-spreadsheet" },
      ],
    },
    {
      label: tr("Services", "ޚިދުމަތް"),
      items: [
        { label: tr("Applications", "އެޕްލިކޭޝަން"), href: NB_ROUTES.index, icon: "file-text", badge: 24 },
        { label: tr("Payments", "ފައިސާ"), href: routes.adminRecords.indexList, icon: "credit-card" },
        { label: tr("Islands", "ރަށްރަށް"), href: routes.adminRecords.indexGrid, icon: "globe" },
      ],
    },
    {
      label: tr("Platform", "ޕްލެޓްފޯމް"),
      items: [
        { label: tr("API keys", "އޭޕީއައި ކީ"), href: routes.adminSettings.apiKeys, icon: "key" },
        { label: tr("Settings", "ސެޓިންގްސް"), href: routes.adminSettings.settings, icon: "settings" },
      ],
    },
  ]
  const ago = (minutes: number) => new Date(NB_NOW.getTime() - minutes * 60_000)

  return (
    <NeonBentoRoot variant="app">
      <AppLayout
        contentWidth="full"
        sidebar={
          <AppSidebar
            collapsible="icon"
            groups={nav}
            currentHref={current}
            match="exact"
            header={
              <Logo alt="Onu Platform" text={tr("Onu Console", "އޮނު ކޮންސޯލް")} href={NB_ROUTES.landing}>
                <NbMark />
              </Logo>
            }
            footer={
              <UserProfile
                name={tr("Aishath Shifa", "އައިޝަތު ޝިފާ")}
                subtitle={tr("Addu City Council", "އައްޑޫ ސިޓީ ކައުންސިލް")}
                onSignOut={() => {}}
                side="top"
              />
            }
          />
        }
        header={
          <AppHeader
            sidebarTrigger
            className="nb-appheader"
            logo={
              <span className="md:hidden">
                <Logo alt="Onu Console" href={NB_ROUTES.landing}>
                  <NbMark />
                </Logo>
              </span>
            }
            actions={
              <>
                <NbLanguage />
                <ThemeToggle />
                <NotificationCenter
                  now={NB_NOW}
                  notifications={[
                    {
                      id: "1",
                      title: tr("SLA breach risk: 6 housing files", "ހައުސިންގ 6 ފައިލް ލަސްވެދާނެ"),
                      time: ago(8),
                      variant: "warning",
                      icon: "warning",
                    },
                    {
                      id: "2",
                      title: tr("Fuvahmulah council went live", "ފުވައްމުލައް ކައުންސިލް ލައިވް"),
                      time: ago(120),
                      variant: "success",
                      icon: "success",
                    },
                    {
                      id: "3",
                      title: tr("Weekly report is ready", "ހަފްތާގެ ރިޕޯޓް ތައްޔާރު"),
                      time: ago(26 * 60),
                      read: true,
                      icon: "file-text",
                    },
                  ]}
                  onMarkRead={() => {}}
                />
              </>
            }
          >
            <CommandPalette
              groups={[
                {
                  heading: tr("Go to", "ދާ"),
                  items: [
                    {
                      id: "insights",
                      label: tr("Insights", "އިންސައިޓްސް"),
                      icon: "home",
                      href: "#" + NB_ROUTES.dashboard,
                    },
                    {
                      id: "applications",
                      label: tr("Applications", "އެޕްލިކޭޝަން"),
                      icon: "file-text",
                      href: "#" + NB_ROUTES.index,
                    },
                    {
                      id: "site",
                      label: tr("Onu Platform site", "އޮނު ޕްލެޓްފޯމް"),
                      icon: "globe",
                      href: "#" + NB_ROUTES.landing,
                    },
                  ],
                },
                {
                  heading: tr("Actions", "ޢަމަލުތައް"),
                  items: [
                    { id: "new", label: tr("New application", "އައު އެޕްލިކޭޝަން"), icon: "plus", shortcut: "N" },
                    { id: "export", label: tr("Export CSV", "އެކްސްޕޯޓް"), icon: "download", shortcut: "E" },
                  ],
                },
              ]}
              trigger={
                <button
                  type="button"
                  className="gap-2 h-9 px-3 text-sm max-w-sm sm:flex hidden w-full items-center rounded-lg border bg-card/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Icon name="search" className="size-4" />
                  <span className="flex-1 text-start">{tr("Search or jump to…", "ހޯދާ ނުވަތަ ދާ…")}</span>
                  <span className="gap-1 flex" aria-hidden dir="ltr">
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                  </span>
                </button>
              }
            />
          </AppHeader>
        }
      >
        {children}
      </AppLayout>
    </NeonBentoRoot>
  )
}
