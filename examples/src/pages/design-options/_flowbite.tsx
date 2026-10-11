import * as React from "react"
import { useLocation } from "react-router"
import {
  AppHeader,
  AppLayout,
  AppSidebar,
  Button,
  ConditionalLink,
  Icon,
  LanguageSwitcher,
  Logo,
  NotificationCenter,
  PopoverPanel,
  SearchBox,
  ThemeToggle,
  UserProfile,
  cn,
  type NavGroup,
} from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"

import "./flowbite.css"

export const FB_ROUTES = {
  index: "/pages/design-options/flowbite-index",
  dashboard: "/pages/design-options/flowbite-dashboard",
}

// Fixed demo time for notifications (computed once, not during render).
const NOW = Date.now()

/** Class added to <body> while a Flowbite page is mounted, so portalled menus and dialogs pick up the theme. */
const PORTAL_CLASS = "design-flowbite-portal"

function usePortalScope() {
  React.useEffect(() => {
    const body = document.body
    const hadTheme = body.hasAttribute("data-onu-theme")
    body.classList.add(PORTAL_CLASS)
    if (!hadTheme) body.setAttribute("data-onu-theme", "")
    return () => {
      body.classList.remove(PORTAL_CLASS)
      if (!hadTheme) body.removeAttribute("data-onu-theme")
    }
  }, [])
}

export type PillTone = "brand" | "gray" | "green" | "red" | "yellow" | "purple" | "orange"

/** Flowbite's small rounded badge (`bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full`). */
export function Pill({
  tone = "brand",
  className,
  children,
}: {
  tone?: PillTone
  className?: string
  children: React.ReactNode
}) {
  return <span className={cn("fb-pill", `fb-pill--${tone}`, className)}>{children}</span>
}

/** A coloured status dot followed by its label (Flowbite's `h-2.5 w-2.5 rounded-full bg-green-500 me-2`). */
export function Dot({ tone = "green", children }: { tone?: PillTone; children: React.ReactNode }) {
  return (
    <span className="gap-2 inline-flex items-center whitespace-nowrap">
      <span aria-hidden className={cn("fb-dot", `fb-dot--${tone}`)} />
      {children}
    </span>
  )
}

/** Flowbite's trend figure: a green or red percentage with an arrow. */
export function Trend({ value, good = true, className }: { value: number; good?: boolean; className?: string }) {
  const up = value >= 0
  const positive = up === good
  return (
    <span
      className={cn("fb-trend", positive ? "fb-trend--up" : "fb-trend--down", className)}
      dir="ltr"
      data-direction={up ? "up" : "down"}
    >
      <span className="sr-only">{up ? "+" : "−"}</span>
      {Math.abs(value).toFixed(1)}%
      <Icon name={up ? "arrow-up" : "arrow-down"} className="size-4" />
    </span>
  )
}

/** A white `rounded-lg border border-gray-200` card with Flowbite's bold title row. */
export function FbCard({
  title,
  description,
  actions,
  footer,
  className,
  bodyClassName,
  children,
  headingLevel = 2,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  bodyClassName?: string
  children: React.ReactNode
  headingLevel?: 2 | 3
}) {
  const Heading = `h${headingLevel}` as const
  return (
    <section className={cn("fb-card", className)}>
      {title || actions ? (
        <div className="gap-3 mb-4 flex flex-wrap items-start justify-between">
          <div className="min-w-0 gap-1 grid">
            {title ? <Heading className="fb-card__title">{title}</Heading> : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="gap-2 flex shrink-0 items-center">{actions}</div> : null}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
      {footer ? <div className="fb-card__footer">{footer}</div> : null}
    </section>
  )
}

/** The mark: a rounded square with a folded "A" for the demo brand. */
function Mark() {
  return (
    <span aria-hidden className="fb-mark">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
        <path d="M5 19 12 5l7 14" />
        <path d="M8.5 13.5h7" />
      </svg>
    </span>
  )
}

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

function nav(tr: ReturnType<typeof useTr>): NavGroup[] {
  return [
    {
      items: [
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: FB_ROUTES.dashboard, icon: "home" },
        {
          label: tr("Applications", "އެޕްލިކޭޝަންތައް"),
          href: FB_ROUTES.index,
          icon: "file-text",
          badge: <span className="fb-nav-count">12</span>,
        },
        {
          id: "records",
          label: tr("Records", "ރެކޯޑުތައް"),
          icon: "folder",
          items: [
            { label: tr("Activity log", "އެކްޓިވިޓީ ލޮގް"), href: routes.adminRecords.activityLog },
            { label: tr("Import", "އިމްޕޯޓް"), href: routes.adminRecords.import },
            { label: tr("Export", "އެކްސްޕޯޓް"), href: routes.adminRecords.export },
            { label: tr("Trash", "ކުނިފޮށި"), href: routes.adminRecords.trash },
          ],
        },
        {
          label: tr("Payments", "ފައިސާ"),
          href: routes.adminRecords.export,
          icon: "credit-card",
          badge: <span className="fb-pill fb-pill--gray">{tr("Pro", "ޕްރޯ")}</span>,
        },
        {
          label: tr("Inbox", "އިންބޮކްސް"),
          href: routes.adminRecords.activityLog,
          icon: "mail",
          badge: <span className="fb-nav-count">3</span>,
        },
        { label: tr("Users", "މެމްބަރުން"), href: routes.adminSettings.users, icon: "users" },
      ],
    },
    {
      id: "support",
      items: [
        {
          id: "settings",
          label: tr("Settings", "ސެޓިންގްސް"),
          icon: "settings",
          items: [
            { label: tr("General", "އާންމު"), href: routes.adminSettings.settings },
            { label: tr("Roles", "ރޯލްތައް"), href: routes.adminSettings.roles },
          ],
        },
        { label: tr("Documentation", "ޑޮކިއުމެންޓޭޝަން"), href: "/", icon: "file" },
        { label: tr("Help", "އެހީ"), href: "/", icon: "help" },
      ],
    },
  ]
}

const APPS = [
  { icon: "file-text", en: "Applications", dv: "އެޕްލިކޭޝަން", href: FB_ROUTES.index },
  { icon: "home", en: "Dashboard", dv: "ޑޭޝްބޯޑް", href: FB_ROUTES.dashboard },
  { icon: "users", en: "Users", dv: "މެމްބަރުން", href: routes.adminSettings.users },
  { icon: "history", en: "Activity", dv: "ހަރަކާތް", href: routes.adminRecords.activityLog },
  { icon: "upload", en: "Import", dv: "އިމްޕޯޓް", href: routes.adminRecords.import },
  { icon: "settings", en: "Settings", dv: "ސެޓިންގްސް", href: routes.adminSettings.settings },
]

function AppsMenu() {
  const tr = useTr()
  return (
    <PopoverPanel
      title={tr("Apps", "އެޕްތައް")}
      align="end"
      className="w-80"
      trigger={
        <Button variant="ghost" size="icon" className="fb-icon-btn" aria-label={tr("Apps", "އެޕްތައް")}>
          <Icon name="grid" />
        </Button>
      }
    >
      <ul className="gap-2 grid grid-cols-3">
        {APPS.map((app) => (
          <li key={app.icon}>
            <ConditionalLink href={app.href} className="fb-app-tile">
              <Icon name={app.icon} className="size-6" />
              <span className="text-sm font-medium">{tr(app.en, app.dv)}</span>
            </ConditionalLink>
          </li>
        ))}
      </ul>
    </PopoverPanel>
  )
}

/**
 * The Flowbite admin shell: a fixed, full-width top navbar (toggle, logo,
 * search, notifications, apps grid, avatar) over a white sidebar with icon +
 * label items, collapsible groups and pill badges, and a gray-50 content area.
 */
export function FlowbiteShell({ children }: { children: React.ReactNode }) {
  const tr = useTr()
  const current = useLocation().pathname
  usePortalScope()

  return (
    <div className="design-flowbite" data-onu-theme>
      <AppLayout
        contentWidth="full"
        classNames={{ main: "p-4 md:p-6", content: "max-w-[110rem]" }}
        sidebar={
          <AppSidebar
            groups={nav(tr)}
            currentHref={current}
            classNames={{ content: "px-1 pt-2" }}
            footer={
              <div className="fb-cta" role="note">
                <div className="gap-2 mb-2 flex items-center">
                  <Pill tone="orange">{tr("Beta", "ބީޓާ")}</Pill>
                </div>
                <p className="text-sm">
                  {tr(
                    "Preview the new review queue, with saved filters and keyboard shortcuts.",
                    "ސޭވްކުރެވޭ ފިލްޓަރުތަކާއި ކީބޯޑް ޝޯޓްކަޓްތަކާއެކު، އައު ރިވިއު ކިއު ބައްލަވާ.",
                  )}
                </p>
                <ConditionalLink href={FB_ROUTES.index} className="fb-link text-sm mt-2 inline-block">
                  {tr("Try the new queue", "އައު ކިއު ބައްލަވާ")}
                </ConditionalLink>
              </div>
            }
          />
        }
        header={
          <AppHeader
            sidebarTrigger
            classNames={{ start: "gap-3", center: "gap-6", end: "gap-1" }}
            logo={
              <Logo
                alt="Atoll Admin"
                href={FB_ROUTES.dashboard}
                text={<span className="fb-brand">{tr("Atoll Admin", "އެޓޮލް އެޑްމިން")}</span>}
              >
                <Mark />
              </Logo>
            }
            actions={
              <>
                <NotificationCenter
                  notifications={[
                    {
                      id: "1",
                      title: tr("New application from Hulhumalé", "ހުޅުމާލެއިން އައު އެޕްލިކޭޝަނެއް"),
                      time: new Date(NOW - 1000 * 60 * 12),
                    },
                    {
                      id: "2",
                      title: tr("Payment received: MVR 2,500.00", "ފައިސާ ލިބިއްޖެ: ރ. 2,500.00"),
                      time: new Date(NOW - 1000 * 60 * 60 * 3),
                    },
                    {
                      id: "3",
                      title: tr("Weekly report is ready", "ހަފްތާގެ ރިޕޯޓް ތައްޔާރު"),
                      time: new Date(NOW - 1000 * 60 * 60 * 26),
                      read: true,
                    },
                  ]}
                  onMarkRead={() => {}}
                />
                <span className="sm:inline-flex hidden">
                  <AppsMenu />
                </span>
                <Language />
                <ThemeToggle />
                <UserProfile
                  compact
                  name={tr("Aishath Shifa", "އައިޝަތު ޝިފާ")}
                  subtitle="shifa@atoll.mv"
                  profileHref={routes.adminSettings.userProfile}
                  settingsHref={routes.adminSettings.settings}
                  onSignOut={() => {}}
                  className="ms-1"
                />
              </>
            }
          >
            <div className="lg:block max-w-sm ms-6 hidden w-full">
              <SearchBox landmark placeholder={tr("Search", "ހޯދާ")} classNames={{ input: "fb-input" }} />
            </div>
          </AppHeader>
        }
        footer={
          <footer className="fb-footer">
            <p className="text-sm text-muted-foreground">
              © 2026 {tr("Atoll Admin. All rights reserved.", "އެޓޮލް އެޑްމިން. ހުރިހާ ޙައްޤެއް ރައްކާތެރިކުރެވިފައި.")}
            </p>
            <ul className="gap-x-6 gap-y-2 text-sm flex flex-wrap">
              {[
                tr("Terms and conditions", "ޝަރުޠުތައް"),
                tr("Privacy policy", "ޕްރައިވެސީ"),
                tr("Licensing", "ލައިސަންސް"),
                tr("Contact", "ގުޅުއްވާ"),
              ].map((label) => (
                <li key={label}>
                  <ConditionalLink href="/" className="fb-footer__link">
                    {label}
                  </ConditionalLink>
                </li>
              ))}
            </ul>
          </footer>
        }
      >
        {children}
      </AppLayout>
    </div>
  )
}
