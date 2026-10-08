import * as React from "react"
import {
  AppHeader,
  AppLayout,
  AppSidebar,
  KeyboardKey,
  LanguageSwitcher,
  Logo,
  NotificationCenter,
  SearchBox,
  ThemeToggle,
  UserProfile,
  cn,
  type NavGroup,
} from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"

import "./aurora-glass.css"

/**
 * Root of an Aurora Glass page: the scoped class, the drifting aurora with film
 * grain, the SVG gradients the charts fade into, and the cursor spotlight for
 * every `.ag-spot` card (mouse only; CSS turns it off for touch and reduced motion).
 */
export function AuroraRoot({ className, children }: { className?: string; children: React.ReactNode }) {
  // Portaled surfaces (phone sidebar, popovers) live outside the root, so mark <body> while mounted.
  React.useEffect(() => {
    document.body.classList.add("ag-portal")
    return () => document.body.classList.remove("ag-portal")
  }, [])

  const onPointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return
    const card = (event.target as HTMLElement).closest<HTMLElement>(".ag-spot")
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`)
    card.style.setProperty("--my", `${event.clientY - rect.top}px`)
  }, [])

  return (
    <div className={cn("design-aurora-glass", className)} onPointerMove={onPointerMove}>
      <div className="ag-aurora" aria-hidden>
        <div className="ag-aurora__field ag-aurora__field--a" />
        <div className="ag-aurora__field ag-aurora__field--b" />
        <div className="ag-aurora__field ag-aurora__field--c" />
        <div className="ag-aurora__field ag-aurora__field--d" />
        <div className="ag-aurora__curtain" />
        <div className="ag-aurora__grain" />
      </div>
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="ag-fade-a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--ag-a)", stopOpacity: 0.45 }} />
            <stop offset="100%" style={{ stopColor: "var(--ag-a)", stopOpacity: 0 }} />
          </linearGradient>
          <linearGradient id="ag-fade-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--ag-b)", stopOpacity: 0.35 }} />
            <stop offset="100%" style={{ stopColor: "var(--ag-b)", stopOpacity: 0 }} />
          </linearGradient>
        </defs>
      </svg>
      {children}
    </div>
  )
}

/** The Raajje Cloud mark: a lit ring around an island dot, in the brand hues. */
export function AuroraMark({ className }: { className?: string }) {
  const id = `ag${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7 shrink-0", className)}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--ag-b)" }} />
          <stop offset="55%" style={{ stopColor: "var(--ag-a)" }} />
          <stop offset="100%" style={{ stopColor: "var(--ag-c)" }} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id}-g)`} />
      <circle cx="16" cy="16" r="8.5" fill="none" className="ag-mark-line" strokeWidth="2.25" opacity="0.9" />
      <path d="M9.5 19.5c2.2-1.6 4.4-1.6 6.5 0s4.3 1.6 6.5 0" fill="none" className="ag-mark-line" strokeWidth="2" />
      <circle cx="16" cy="13" r="2.2" className="ag-mark-dot" />
    </svg>
  )
}

/** The Aurora Glass pages, for links between them. */
export const AG_ROUTES = {
  landing: "/pages/design-options/aurora-glass-landing",
  index: "/pages/design-options/aurora-glass-index",
  dashboard: "/pages/design-options/aurora-glass-dashboard",
}

/** Fixed demo "now", so relative times (and screenshots) are stable. */
export const AG_NOW = new Date("2026-10-08T10:42:00+05:00")

function Language() {
  const { settings, update } = useSettings()
  return (
    <LanguageSwitcher
      variant="menu"
      value={settings.locale}
      onChange={(code) => update({ locale: code as "en" | "dv" })}
      size="sm"
    />
  )
}

/** The Raajje Cloud app shell: floating glass sidebar and glass header. */
export function AuroraShell({ current, children }: { current: string; children: React.ReactNode }) {
  const tr = useTr()
  const dv = useDv()
  const NOW = AG_NOW
  const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000)
  const nav: NavGroup[] = [
    {
      items: [
        { label: tr("Command centre", "ކޮމާންޑް ސެންޓަރ"), href: AG_ROUTES.dashboard, icon: "monitor" },
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: AG_ROUTES.index, icon: "file-text", badge: 24 },
        { label: tr("Payments", "ފައިސާ"), href: routes.citizen.payments, icon: "credit-card" },
        { label: tr("Citizens", "ރައްޔިތުން"), href: routes.adminSettings.users, icon: "users" },
        { label: tr("Islands", "ރަށްރަށް"), href: routes.public.services, icon: "map-pin" },
      ],
    },
    {
      label: tr("Platform", "ޕްލެޓްފޯމް"),
      items: [
        { label: tr("Incidents", "ހާދިސާތައް"), href: routes.adminRecords.activityLog, icon: "warning", badge: 2 },
        { label: tr("Integrations", "އިންޓަގްރޭޝަން"), href: routes.adminSettings.apiKeys, icon: "key" },
        { label: tr("Audit log", "އޮޑިޓް ލޮގް"), href: routes.adminRecords.activityLog, icon: "history" },
        { label: tr("Settings", "ސެޓިންގްސް"), href: routes.adminSettings.settings, icon: "settings" },
      ],
    },
  ]

  return (
    <AppLayout
      contentWidth="wide"
      classNames={{ body: "bg-transparent", main: "md:p-8 lg:px-10" }}
      sidebar={
        <AppSidebar
          variant="floating"
          collapsible="icon"
          groups={nav}
          currentHref={current}
          header={
            <Logo
              alt="Raajje Cloud"
              href={AG_ROUTES.landing}
              text={<span className="ag-title">{tr("Raajje Cloud", "ރާއްޖެ ކްލައުޑް")}</span>}
            >
              <AuroraMark />
            </Logo>
          }
          footer={
            <div className="gap-3 grid">
              <div className="ag-chip p-3 text-xs gap-1 grid rounded-xl group-data-[collapsible=icon]:hidden">
                <span className="gap-2 font-medium flex items-center">
                  <span className="ag-pulse" aria-hidden />
                  {tr("All systems normal", "ހުރިހާ ސިސްޓަމެއް ރަނގަޅު")}
                </span>
                <span className="text-muted-foreground">{tr("Region: Malé · 12 ms", "ރީޖަން: މާލެ · 12 ms")}</span>
              </div>
              <UserProfile
                name={tr("Aishath Shifa", "އައިޝަތު ޝިފާ")}
                subtitle={tr("Duty officer", "ޑިއުޓީ އޮފިސަރ")}
                profileHref={routes.adminSettings.userProfile}
                settingsHref={routes.adminSettings.settings}
                onSignOut={() => {}}
                side="top"
              />
            </div>
          }
        />
      }
      header={
        <AppHeader
          sidebarTrigger
          className="ag-header"
          actions={
            <>
              <Language />
              <ThemeToggle />
              <NotificationCenter
                now={NOW}
                notifications={[
                  {
                    id: "1",
                    title: tr("SMS delivery is slow in Haa Dhaalu", "ހދ ގައި އެސްއެމްއެސް ލަސް"),
                    description: tr("Retrying through the backup carrier", "ބެކަޕް ކެރިއަރ މެދުވެރިކޮށް"),
                    time: minutesAgo(6),
                    variant: "warning",
                  },
                  {
                    id: "2",
                    title: tr("Daily reconciliation complete", "ދުވަހުގެ ރިކަންސިލިއޭޝަން ނިމިއްޖެ"),
                    time: minutesAgo(58),
                    variant: "success",
                  },
                  {
                    id: "3",
                    title: tr("Fuvahmulah council joined", "ފުވައްމުލައް ކައުންސިލް ގުޅިއްޖެ"),
                    time: minutesAgo(180),
                    variant: "info",
                    read: true,
                  },
                ]}
                onMarkRead={() => {}}
              />
            </>
          }
        >
          <div className="max-w-md gap-2 flex w-full items-center">
            <SearchBox
              aria-label={tr("Search requests, citizens and islands", "ރިކުއެސްޓް، ރައްޔިތުން އަދި ރަށް ހޯއްދަވާ")}
              placeholder={tr("Search or jump to…", "ހޯއްދަވާ…")}
              thaana={dv}
              landmark
              className="flex-1"
              classNames={{ root: "ag-field rounded-xl" }}
            />
            <KeyboardKey keys="mod+k" platform="mac" className="lg:inline-flex hidden" />
          </div>
        </AppHeader>
      }
    >
      {children}
    </AppLayout>
  )
}
