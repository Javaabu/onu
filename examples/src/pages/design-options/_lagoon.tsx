import * as React from "react"
import { useLocation } from "react-router"
import {
  AppHeader,
  AppLayout,
  AppSidebar,
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

/** Routes of the Lagoon pages. */
export const LAGOON = {
  landing: "/pages/design-options/lagoon-landing",
  index: "/pages/design-options/lagoon-index",
  dashboard: "/pages/design-options/lagoon-dashboard",
} as const

// Fixed demo time (no clocks during render).
const NOW = new Date("2026-10-08T10:42:00")

/** Language switcher bound to the showcase settings. */
export function LagoonLanguage({ variant = "menu" }: { variant?: "select" | "menu" }) {
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

/** eRaajje mark: a sun over an island inside a lagoon ring. */
export function LagoonMark({ className }: { className?: string }) {
  const id = React.useId()
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8 shrink-0", className)}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--lg-lagoon)" />
          <stop offset="1" stopColor="var(--lg-deep)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill={`url(#${id}-g)`} />
      <circle cx="20.5" cy="11.5" r="3.6" fill="var(--lg-coral)" />
      <path d="M6 21.5c3.2-4.6 8.8-6 13.4-3.6 2 1 3.6 2.4 4.6 3.6" fill="none" stroke="white" strokeWidth="1.8" />
      <path
        d="M5.5 25c2-1.2 3.6-1.2 5.4 0s3.6 1.2 5.4 0 3.6-1.2 5.4 0 3.6 1.2 5 0"
        fill="none"
        stroke="white"
        strokeOpacity=".75"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const WAVE =
  "M0 40 C 120 10 240 10 360 40 S 600 70 720 40 S 960 10 1080 40 S 1320 70 1440 40 S 1680 10 1800 40 S 2040 70 2160 40 S 2400 10 2520 40 S 2760 70 2880 40 V 120 H 0 Z"

/**
 * Layered wave divider. The two back layers drift; the front layer is solid in
 * `fill` (the colour of the next section) so the seam disappears.
 */
export function Wave({ className, flip, fill }: { className?: string; flip?: boolean; fill?: string }) {
  return (
    <div
      aria-hidden
      dir="ltr"
      className={cn("lg-wave h-14 sm:h-20 relative", flip && "-scale-y-100", className)}
      style={fill ? ({ "--lg-fill": fill } as React.CSSProperties) : undefined}
    >
      <svg viewBox="0 0 2880 120" preserveAspectRatio="none" className="inset-y-0 absolute">
        <path className="lg-wave-a" d={WAVE} transform="translate(0 -12)" />
      </svg>
      <svg viewBox="0 0 2880 120" preserveAspectRatio="none" className="inset-y-0 absolute">
        <path className="lg-wave-b" d={WAVE} transform="translate(0 4) scale(1 0.8)" />
      </svg>
      <svg viewBox="0 0 2880 120" preserveAspectRatio="none" className="relative">
        <path className="lg-wave-c" d={WAVE} transform="translate(-720 14)" />
      </svg>
    </div>
  )
}

/** Line-art island: sun, palms, a reef ring in the distance, ripples. Decorative. */
export function IslandArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 300"
      aria-hidden
      className={cn("lg-art", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle className="lg-art-sun" cx="360" cy="78" r="34" stroke="none" opacity=".9" />
      <circle cx="360" cy="78" r="50" strokeOpacity=".18" strokeWidth="1.2" />
      <circle cx="360" cy="78" r="68" strokeOpacity=".1" strokeWidth="1.2" />
      {/* distant atoll ring */}
      <ellipse cx="96" cy="150" rx="70" ry="9" strokeOpacity=".35" strokeWidth="1.4" />
      <ellipse cx="96" cy="150" rx="52" ry="5" strokeOpacity=".2" strokeWidth="1.2" />
      {/* island */}
      <path className="lg-art-sand" stroke="none" d="M150 214c30-34 92-46 156-38 40 5 70 20 88 38z" />
      <path d="M150 214c30-34 92-46 156-38 40 5 70 20 88 38" strokeWidth="2" />
      {/* palm 1 */}
      <path d="M262 182c-2-30 4-62 22-90" strokeWidth="2.4" />
      <path
        d="M284 92c-18-10-42-8-58 6M284 92c-6-18-24-30-46-30M284 92c10-16 30-22 52-16M284 92c18-4 38 6 48 22M284 92c4 14 0 32-10 44"
        strokeWidth="2"
      />
      {/* palm 2 */}
      <path d="M222 192c-6-22-6-46 6-66" strokeWidth="2.2" />
      <path
        d="M228 126c-14-8-32-4-44 8M228 126c-2-14-14-24-30-26M228 126c8-12 24-14 38-8M228 126c12 2 22 12 26 24"
        strokeWidth="1.8"
      />
      {/* water lines */}
      <g className="lg-art-water" strokeWidth="2">
        <path d="M40 236c20-8 40-8 60 0s40 8 60 0 40-8 60 0 40 8 60 0 40-8 60 0 40 8 60 0 40-8 60 0" />
        <path d="M80 258c16-6 32-6 48 0s32 6 48 0 32-6 48 0 32 6 48 0 32-6 48 0 32 6 48 0" strokeOpacity=".6" />
        <path d="M140 278c12-4 24-4 36 0s24 4 36 0 24-4 36 0 24 4 36 0 24-4 36 0" strokeOpacity=".35" />
      </g>
      {/* dhoni */}
      <g strokeWidth="1.8">
        <path d="M60 212h46l-6 8H68z" />
        <path d="M84 212v-30l16 22" />
      </g>
      {/* birds */}
      <path d="M190 64c4-4 8-4 10 0 2-4 6-4 10 0M224 46c3-3 6-3 8 0 2-3 5-3 8 0" strokeWidth="1.5" strokeOpacity=".7" />
    </svg>
  )
}

export interface Atoll {
  code: string
  en: string
  dv: string
  x: number
  y: number
  r: number
  /** Share of today's applications, 0–1. */
  v: number
}

/** The atoll chain, north at the top. Positions are schematic, not to scale. */
export const ATOLLS: Atoll[] = [
  { code: "HA", en: "Haa Alif", dv: "ހާއަލިފު", x: 100, y: 22, r: 10, v: 0.35 },
  { code: "HDh", en: "Haa Dhaalu", dv: "ހާދާލު", x: 110, y: 52, r: 11, v: 0.55 },
  { code: "Sh", en: "Shaviyani", dv: "ޝާވިޔަނި", x: 86, y: 80, r: 9, v: 0.25 },
  { code: "N", en: "Noonu", dv: "ނޫނު", x: 98, y: 106, r: 10, v: 0.3 },
  { code: "R", en: "Raa", dv: "ރާ", x: 74, y: 132, r: 11, v: 0.45 },
  { code: "B", en: "Baa", dv: "ބާ", x: 94, y: 158, r: 9, v: 0.3 },
  { code: "Lh", en: "Lhaviyani", dv: "ޅަވިޔަނި", x: 122, y: 152, r: 8, v: 0.25 },
  { code: "K", en: "Kaafu · Malé", dv: "ކާފު · މާލެ", x: 122, y: 196, r: 14, v: 1 },
  { code: "AA", en: "Alif Alif", dv: "އަލިފު އަލިފު", x: 80, y: 196, r: 12, v: 0.3 },
  { code: "ADh", en: "Alif Dhaal", dv: "އަލިފު ދާލު", x: 84, y: 232, r: 10, v: 0.35 },
  { code: "V", en: "Vaavu", dv: "ވާވު", x: 132, y: 232, r: 8, v: 0.15 },
  { code: "M", en: "Meemu", dv: "މީމު", x: 124, y: 262, r: 9, v: 0.2 },
  { code: "F", en: "Faafu", dv: "ފާފު", x: 92, y: 266, r: 8, v: 0.15 },
  { code: "Dh", en: "Dhaalu", dv: "ދާލު", x: 100, y: 294, r: 9, v: 0.2 },
  { code: "Th", en: "Thaa", dv: "ތާ", x: 114, y: 326, r: 11, v: 0.35 },
  { code: "L", en: "Laamu", dv: "ލާމު", x: 124, y: 358, r: 10, v: 0.45 },
  { code: "GA", en: "Gaafu Alif", dv: "ގާފު އަލިފު", x: 112, y: 414, r: 13, v: 0.4 },
  { code: "GDh", en: "Gaafu Dhaalu", dv: "ގާފު ދާލު", x: 104, y: 448, r: 12, v: 0.5 },
  { code: "Gn", en: "Fuvahmulah", dv: "ފުވައްމުލައް", x: 100, y: 480, r: 5, v: 0.6 },
  { code: "S", en: "Addu", dv: "އައްޑޫ", x: 96, y: 508, r: 9, v: 0.8 },
]

/** Schematic atoll map; busier atolls fill deeper and the busiest ripple. */
export function AtollMap({ label, equator, className }: { label: string; equator: string; className?: string }) {
  const busiest = [...ATOLLS].sort((a, b) => b.v - a.v).slice(0, 3)
  return (
    <svg viewBox="40 0 130 530" role="img" aria-label={label} className={cn("h-full w-auto", className)}>
      <line
        x1="44"
        x2="166"
        y1="464"
        y2="464"
        stroke="currentColor"
        strokeOpacity=".3"
        strokeDasharray="3 4"
        className="text-muted-foreground"
      />
      <text x="166" y="460" textAnchor="end" fontSize="9" fill="currentColor" className="text-muted-foreground">
        {equator}
      </text>
      {busiest.map((a) => (
        <ellipse
          key={`p-${a.code}`}
          className="lg-atoll-ping"
          cx={a.x}
          cy={a.y}
          rx={a.r * 0.9}
          ry={a.r * 0.7}
          strokeWidth="1"
        />
      ))}
      {ATOLLS.map((a) => (
        <ellipse
          key={a.code}
          className="lg-atoll"
          cx={a.x}
          cy={a.y}
          rx={a.r * 0.9}
          ry={a.r * 0.7}
          style={{ "--v": a.v } as React.CSSProperties}
        />
      ))}
    </svg>
  )
}

/** The eRaajje Desk app shell: floating sand sidebar, glass header. Shared by the dashboard and the index. */
export function LagoonShell({ children, className }: { children: React.ReactNode; className?: string }) {
  const tr = useTr()
  const dv = useDv()
  const current = useLocation().pathname

  const groups: NavGroup[] = [
    {
      items: [
        { label: tr("Overview", "ޚުލާޞާ"), href: LAGOON.dashboard, icon: "home" },
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: LAGOON.index, icon: "file-text", badge: 24 },
        { label: tr("Queue", "ކިއު"), href: routes.kiosk.start, icon: "clock", badge: 7 },
        { label: tr("Appointments", "އެޕޮއިންޓްމަންޓް"), href: routes.public.events, icon: "calendar" },
        { label: tr("Islands", "ރަށްތައް"), href: routes.maps.zones, icon: "map-pin" },
      ],
    },
    {
      label: tr("Services", "ޚިދުމަތްތައް"),
      items: [
        { label: tr("Payments", "ފައިސާ"), href: routes.citizen.payments, icon: "credit-card" },
        { label: tr("Citizens", "ރައްޔިތުން"), href: routes.adminSettings.users, icon: "users" },
        { label: tr("Reports", "ރިޕޯޓް"), href: routes.maps.reports, icon: "table" },
      ],
    },
    {
      label: tr("Council", "ކައުންސިލް"),
      items: [
        { label: tr("Notices", "އިޢުލާން"), href: routes.public.news, icon: "megaphone" },
        { label: tr("Settings", "ސެޓިންގްސް"), href: routes.adminSettings.settings, icon: "settings" },
      ],
    },
  ]

  return (
    <div className={cn("design-lagoon lg-desk", className)}>
      <AppLayout
        contentWidth="wide"
        sidebar={
          <AppSidebar
            variant="floating"
            collapsible="icon"
            groups={groups}
            currentHref={current}
            match="exact"
            header={
              <Logo
                alt=""
                href={LAGOON.dashboard}
                children={<LagoonMark />}
                text={
                  <span className="leading-tight flex flex-col">
                    <span className="lg-serif text-base font-semibold">{tr("eRaajje Desk", "އީރާއްޖެ ޑެސްކް")}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {tr("Thinadhoo Council", "ތިނަދޫ ކައުންސިލް")}
                    </span>
                  </span>
                }
              />
            }
            footer={
              <UserProfile
                name={tr("Mariyam Shiuna", "މަރިޔަމް ޝިއުނާ")}
                subtitle={tr("Front desk", "ފްރަންޓް ޑެސްކް")}
                profileHref={routes.adminSettings.userProfile}
                settingsHref={routes.adminSettings.settings}
                onSignOut={() => {}}
                side="top"
              />
            }
          />
        }
        header={
          <AppHeader
            sidebarTrigger
            variant="plain"
            className="lg-header"
            actions={
              <>
                <LagoonLanguage />
                <ThemeToggle />
                <NotificationCenter
                  now={NOW}
                  notifications={[
                    {
                      id: "1",
                      title: tr("Ticket A-043 checked in from home", "A-043 ގޭގައި ހުރެ ޗެކްއިން ކޮށްފި"),
                      time: new Date("2026-10-08T10:30:00"),
                      variant: "info",
                    },
                    {
                      id: "2",
                      title: tr("Payment received: MVR 250.00", "ފައިސާ ލިބިއްޖެ: ރ 250.00"),
                      time: new Date("2026-10-08T09:12:00"),
                      variant: "success",
                    },
                    {
                      id: "3",
                      title: tr("Ferry delayed to Madaveli", "މަޑަވެލި ފެރީ ލަސްވެއްޖެ"),
                      time: new Date("2026-10-08T07:50:00"),
                      variant: "warning",
                      read: true,
                    },
                  ]}
                  onMarkRead={() => {}}
                />
              </>
            }
          >
            <div className="max-w-md min-w-0 sm:block hidden flex-1">
              <SearchBox
                aria-label={tr(
                  "Search citizens, tickets and references",
                  "ރައްޔިތުން، ޓިކެޓް އަދި ރެފަރެންސް ހޯއްދަވާ",
                )}
                placeholder={tr("Search citizens, tickets, references…", "ރައްޔިތުން، ޓިކެޓް، ރެފަރެންސް…")}
                thaana={dv}
                submitOnBlur={false}
                classNames={{ root: "rounded-full bg-card/70" }}
              />
            </div>
          </AppHeader>
        }
      >
        {children}
      </AppLayout>
    </div>
  )
}
