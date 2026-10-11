import * as React from "react"
import { useLocation } from "react-router"
import {
  ActionMenu,
  AppHeader,
  AppLayout,
  AppSidebar,
  Button,
  ConditionalLink,
  Icon,
  LanguageSwitcher,
  LinkButton,
  NotificationCenter,
  SearchBox,
  StatusBadge,
  ThemeToggle,
  UserAvatar,
  cn,
  type NavGroup,
} from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import type { Application, ApplicationStatus } from "../admin-records/_data"

import "./atlassian.css"

export const ATL_ROUTES = {
  index: "/pages/design-options/atlassian-index",
  dashboard: "/pages/design-options/atlassian-dashboard",
}

/** Fixed demo clock, so pages and screenshots are stable. */
export const ATL_NOW = new Date("2026-10-07T18:30:00Z")
const minutesAgo = (m: number) => new Date(ATL_NOW.getTime() - m * 60_000)

type Tr = ReturnType<typeof useTr>

// ---------------------------------------------------------------------------
// Small Atlassian-style pieces

/** A Jira-style key ("APP-1042") for an application. */
export const issueKey = (a: Pick<Application, "id">) => `APP-${a.id}`

export type LozengeAppearance = "default" | "inprogress" | "success" | "removed" | "moved" | "new"

/** How application statuses map onto Atlassian lozenge appearances. */
export const STATUS_APPEARANCE: Record<ApplicationStatus, LozengeAppearance> = {
  submitted: "default",
  in_review: "inprogress",
  approved: "success",
  rejected: "removed",
  suspended: "moved",
}

/**
 * Atlassian's Lozenge: a small, bold, uppercase status label in a subtle colour.
 * Built on Onu's StatusBadge (the text carries the meaning, so no icon).
 */
export function Lozenge({
  appearance = "default",
  children,
  className,
}: {
  appearance?: LozengeAppearance
  children: React.ReactNode
  className?: string
}) {
  return (
    <StatusBadge status="neutral" icon={false} className={cn("atl-lozenge", className)} data-appearance={appearance}>
      {children}
    </StatusBadge>
  )
}

/** A stable avatar colour for a name (Atlassian's coloured default avatars). */
export function avatarTone(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997
  return `atl-av-${h % 6}`
}

/** UserAvatar with an Atlassian-style coloured fallback. */
export function AtlAvatar({ name, ...props }: React.ComponentProps<typeof UserAvatar> & { name: string }) {
  return (
    <UserAvatar
      name={name}
      {...props}
      classNames={{ ...props.classNames, fallback: cn(avatarTone(name), props.classNames?.fallback) }}
    />
  )
}

export type Priority = "highest" | "high" | "medium" | "low" | "lowest"

/** Priority from the fee: bigger permits get looked at first. */
export function priorityOf(a: Pick<Application, "amount">): Priority {
  if (a.amount >= 7500) return "highest"
  if (a.amount >= 2500) return "high"
  if (a.amount >= 1000) return "medium"
  if (a.amount >= 500) return "low"
  return "lowest"
}

export const PRIORITY_RANK: Record<Priority, number> = { highest: 5, high: 4, medium: 3, low: 2, lowest: 1 }

export function priorityLabel(p: Priority, tr: Tr) {
  return {
    highest: tr("Highest", "އެންމެ މުހިންމު"),
    high: tr("High", "މުހިންމު"),
    medium: tr("Medium", "މެދު"),
    low: tr("Low", "ދަށް"),
    lowest: tr("Lowest", "އެންމެ ދަށް"),
  }[p]
}

/** Jira's priority glyphs: red chevrons up, an orange "=", blue chevrons down. */
export function PriorityIcon({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={cn("atl-priority size-4 shrink-0", `atl-priority--${priority}`, className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {priority === "highest" ? (
        <>
          <path d="M3.5 8 8 3.5 12.5 8" />
          <path d="M3.5 12.5 8 8l4.5 4.5" />
        </>
      ) : priority === "high" ? (
        <path d="M3.5 10.5 8 6l4.5 4.5" />
      ) : priority === "medium" ? (
        <>
          <path d="M3 6h10" />
          <path d="M3 10h10" />
        </>
      ) : priority === "low" ? (
        <path d="M3.5 5.5 8 10l4.5-4.5" />
      ) : (
        <>
          <path d="M3.5 3.5 8 8l4.5-4.5" />
          <path d="M3.5 8 8 12.5 12.5 8" />
        </>
      )}
    </svg>
  )
}

const SERVICE_ICON: Record<string, string> = {
  building: "building",
  business: "file-text",
  land: "map-pin",
  vessel: "navigation",
  event: "calendar",
  trade: "credit-card",
}

/** Jira's issue-type tile: a 16px coloured square with a white glyph, one colour per service. */
export function TypeIcon({ service, label, className }: { service: string; label?: string; className?: string }) {
  return (
    <span
      className={cn("atl-type", `atl-type--${service}`, className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      title={label}
    >
      <Icon name={SERVICE_ICON[service] ?? "file"} />
    </span>
  )
}

/** A gadget / panel: white raised surface, 1px border, small title bar with actions. */
export function Gadget({
  title,
  actions,
  children,
  className,
  bodyClassName,
  id,
}: {
  title: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  id?: string
}) {
  const headingId = React.useId()
  return (
    <section aria-labelledby={id ?? headingId} className={cn("atl-gadget", className)}>
      <header className="atl-gadget__head">
        <h2 id={id ?? headingId} className="atl-heading-xs min-w-0 truncate">
          {title}
        </h2>
        {actions ? <div className="gap-0.5 flex shrink-0 items-center">{actions}</div> : null}
      </header>
      <div className={cn("atl-gadget__body", bodyClassName)}>{children}</div>
    </section>
  )
}

/** The ⋯ and refresh buttons in a gadget header. */
export function GadgetActions({ name, tr }: { name: string; tr: Tr }) {
  return (
    <>
      <Button variant="ghost" size="icon-sm" aria-label={tr(`Refresh ${name}`, `${name} ރިފްރެޝްކުރޭ`)}>
        <Icon name="refresh" />
      </Button>
      <ActionMenu
        label={tr(`More actions for ${name}`, `${name} އިތުރު`)}
        classNames={{ trigger: "size-7" }}
        items={[
          { id: "edit", label: tr("Configure", "ސެޓްކުރޭ"), icon: "settings" },
          { id: "min", label: tr("Minimise", "ކުޑަކުރޭ"), icon: "minimize" },
          { type: "separator", id: "sep" },
          { id: "delete", label: tr("Delete gadget", "ގެޖެޓް ފޮހެލާ"), icon: "trash", variant: "destructive" },
        ]}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Shell

/** The mark: a brand tile with two stacked chevrons (an original glyph, not a product logo). */
function ProductMark() {
  return (
    <span aria-hidden className="atl-mark">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M4 6.5 8 3l4 3.5" />
        <path d="M4 12 8 8.5l4 3.5" strokeOpacity=".7" />
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

function sideNav(tr: Tr): NavGroup[] {
  return [
    {
      label: tr("Planning", "ރާވުން"),
      items: [
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: ATL_ROUTES.dashboard, icon: "home" },
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: ATL_ROUTES.index, icon: "list" },
        { label: tr("Board", "ބޯޑް"), href: routes.adminRecords.indexKanban, icon: "kanban" },
        { label: tr("Reports", "ރިޕޯޓުތައް"), href: routes.adminRecords.export, icon: "file-spreadsheet" },
      ],
    },
    {
      label: tr("Operations", "މަސައްކަތް"),
      items: [
        { label: tr("Activity log", "އެކްޓިވިޓީ ލޮގް"), href: routes.adminRecords.activityLog, icon: "history" },
        { label: tr("Team", "ޓީމް"), href: routes.adminSettings.users, icon: "users" },
        {
          label: tr("Project settings", "ޕްރޮޖެކްޓް ސެޓިންގްސް"),
          href: routes.adminSettings.settings,
          icon: "settings",
        },
      ],
    },
  ]
}

/** Top navigation links (Jira's "Your work / Projects / Filters / Dashboards"). */
function TopLinks({ active, tr }: { active: "index" | "dashboard"; tr: Tr }) {
  const links = [
    { id: "work", label: tr("Your work", "ތިބާގެ މަސައްކަތް"), href: routes.adminRecords.activityLog },
    { id: "index", label: tr("Projects", "ޕްރޮޖެކްޓްތައް"), href: ATL_ROUTES.index, menu: true },
    { id: "filters", label: tr("Filters", "ފިލްޓަރުތައް"), href: routes.adminRecords.indexList, menu: true },
    { id: "dashboard", label: tr("Dashboards", "ޑޭޝްބޯޑުތައް"), href: ATL_ROUTES.dashboard, menu: true },
    { id: "teams", label: tr("Teams", "ޓީމުތައް"), href: routes.adminSettings.users },
  ]
  return (
    <nav aria-label={tr("Product", "ޕްރޮޑަކްޓް")} className="lg:block hidden">
      <ul className="gap-0.5 flex items-center">
        {links.map((l) => (
          <li key={l.id}>
            <ConditionalLink href={l.href} className="atl-toplink" aria-current={l.id === active ? "page" : undefined}>
              {l.label}
              {l.menu ? <Icon name="chevron-down" className="size-3.5 opacity-70" /> : null}
            </ConditionalLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Keeps <body> in the Atlassian scope while mounted, so portalled menus and sheets match. */
function useBodyScope() {
  React.useEffect(() => {
    const body = document.body
    body.classList.add("atl-portal")
    body.setAttribute("data-onu-theme", "")
    return () => {
      body.classList.remove("atl-portal")
      body.removeAttribute("data-onu-theme")
    }
  }, [])
}

/**
 * The Atlassian app shell: a full-width top navigation bar (sidebar toggle, app
 * switcher, product, nav links, Create, search, notifications, help, settings,
 * avatar) over a left side navigation with a project header and grouped links.
 */
export function AtlassianShell({
  active,
  sunken = false,
  children,
}: {
  active: "index" | "dashboard"
  sunken?: boolean
  children: React.ReactNode
}) {
  const tr = useTr()
  const current = useLocation().pathname
  useBodyScope()

  return (
    <div data-onu-theme className="design-atlassian">
      <AppLayout
        classNames={{
          main: cn("atl-main", sunken && "atl-main--sunken"),
        }}
        sidebar={
          <AppSidebar
            groups={sideNav(tr)}
            currentHref={current}
            match="exact"
            navLabel={tr("Project", "ޕްރޮޖެކްޓް")}
            classNames={{ content: "px-2", groupLabel: "atl-group-label", header: "px-3 pt-4 pb-2" }}
            header={
              <div className="gap-2 flex items-center">
                <span aria-hidden className="atl-project-avatar">
                  <Icon name="file-text" />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="atl-heading-xs truncate">{tr("Permits Service Desk", "ހުއްދަތަކުގެ ޑެސްކު")}</p>
                  <p className="text-xs truncate text-muted-foreground">
                    {tr("Service project", "ޚިދުމަތުގެ ޕްރޮޖެކްޓް")}
                  </p>
                </div>
              </div>
            }
            footer={
              <p className="atl-sidebar-note">
                {tr("You're in a team-managed project", "މިއީ ޓީމުން ހިންގާ ޕްރޮޖެކްޓެކެވެ")}
              </p>
            }
          />
        }
        header={
          <AppHeader
            sidebarTrigger
            className="atl-topnav"
            classNames={{ center: "gap-2", end: "gap-0.5" }}
            logo={
              <div className="gap-1 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:inline-flex hidden"
                  aria-label={tr("Switch apps", "އެޕް ބަދަލުކުރޭ")}
                >
                  <Icon name="grid" />
                </Button>
                <ConditionalLink href={ATL_ROUTES.dashboard} className="atl-product">
                  <ProductMark />
                  <span className="atl-product__name">{tr("Atoll Desk", "އެޓޮލް ޑެސްކް")}</span>
                </ConditionalLink>
              </div>
            }
            actions={
              <>
                <div className="me-1 md:block w-48 xl:w-60 hidden">
                  <SearchBox landmark placeholder={tr("Search", "ހޯދާ")} classNames={{ input: "atl-nav-search" }} />
                </div>
                <NotificationCenter
                  now={ATL_NOW}
                  notifications={[
                    {
                      id: "1",
                      title: tr("Shifa assigned APP-1042 to you", "ޝިފާ APP-1042 ތިބާއާ ޙަވާލުކުރެއްވި"),
                      time: minutesAgo(12),
                    },
                    {
                      id: "2",
                      title: tr("APP-1037 moved to In review", "APP-1037 ރިވިއުއަށް ބަދަލުކުރެވިއްޖެ"),
                      time: minutesAgo(180),
                    },
                    {
                      id: "3",
                      title: tr("Weekly report is ready", "ހަފްތާގެ ރިޕޯޓް ތައްޔާރު"),
                      time: minutesAgo(1560),
                      read: true,
                    },
                  ]}
                  onMarkRead={() => {}}
                />
                <Button variant="ghost" size="icon" className="sm:inline-flex hidden" aria-label={tr("Help", "އެހީ")}>
                  <Icon name="help" />
                </Button>
                <Language />
                <ThemeToggle />
                <ConditionalLink
                  href={routes.adminSettings.userProfile}
                  className="atl-avatar-link ms-1"
                  aria-label={tr("Your profile: Aishath Shifa", "ޕްރޮފައިލް: އައިޝަތު ޝިފާ")}
                >
                  <AtlAvatar name={tr("Aishath Shifa", "އައިޝަތު ޝިފާ")} size="xs" decorative />
                </ConditionalLink>
              </>
            }
          >
            <TopLinks active={active} tr={tr} />
            <LinkButton href={routes.adminRecords.create} startIcon="add" className="atl-create">
              <span className="sm:not-sr-only sr-only">{tr("Create", "ހަދާ")}</span>
            </LinkButton>
          </AppHeader>
        }
      >
        {children}
      </AppLayout>
    </div>
  )
}
