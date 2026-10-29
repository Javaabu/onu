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
  PageTitle,
  ProgressBar,
  SearchBox,
  ThemeToggle,
  UserProfile,
  cn,
  type BreadcrumbsItem,
  type NavGroup,
  type PageTitleFigure,
} from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { LABEL_COLORS } from "../_shared/shells"
import { ISLANDS, SERVICES, useApplications } from "../admin-records/_data"

import "./proton-ant.css"

export { LABEL_COLORS }

export const PA_ROUTES = {
  index: "/pages/design-options/proton-ant-index",
  dashboard: "/pages/design-options/proton-ant-dashboard",
}

/** Listing state param prefix used by the index (the sidebar folders and labels link into it). */
export const PA_PARAM = "pa_"

/** A link into the index, filtered (`pa_filter[service]=building`). */
export function filteredIndex(key: string, value: string) {
  const params = new URLSearchParams({ [`${PA_PARAM}filter[${key}]`]: value })
  return `${PA_ROUTES.index}?${params.toString()}`
}

/** The label colour of an island (the sidebar labels and the table's island cells match). */
export function islandColor(value: string) {
  const i = ISLANDS.findIndex((x) => x.value === value)
  return LABEL_COLORS[((i < 0 ? 0 : i) + 4) % LABEL_COLORS.length]!
}

/** A coloured label dot, as in Proton Mail's label list. */
export function LabelDot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pa-dot size-2.5 shrink-0 rounded-full", className)}
      style={{ "--pa-dot": color } as React.CSSProperties}
    />
  )
}

/** Ant Pro's trend text: a coloured caret and a percentage, red for up and green for down. */
export function Trend({ label, value, flip = false }: { label?: string; value: number; flip?: boolean }) {
  const up = value >= 0
  // Ant Design Pro colours "up" red and "down" green; `flip` swaps that for metrics where down is bad.
  const bad = flip ? !up : up
  return (
    <span className="pa-trend">
      {label ? <span className="pa-trend__label">{label}</span> : null}
      <span className="tabular-nums" dir="ltr">
        {Math.abs(value)}%
      </span>
      <span aria-hidden className={cn("pa-trend__caret", up ? "is-up" : "is-down", bad ? "is-red" : "is-green")} />
      <span className="sr-only">{up ? "▲" : "▼"}</span>
    </span>
  )
}

/** The product mark: a rounded tile with a soft gradient from the brand colour. */
function Mark() {
  return (
    <span aria-hidden className="pa-mark">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M5 16.5c2.4-1.6 4.6-1.6 7 0s4.6 1.6 7 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M8 12.5V8.2A4.2 4.2 0 0 1 12.2 4h.3a3.5 3.5 0 0 1 0 7H10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

/** "Atoll Records" wordmark, two-tone like Proton's product logos. */
function Wordmark() {
  const tr = useTr()
  return (
    <ConditionalLink
      href={PA_ROUTES.dashboard}
      className="gap-2 min-w-0 flex items-center rounded-md"
      aria-label={tr("Atoll Records, home", "އެޓޮލް ރެކޯޑްސް، ފުރަތަމަ ސަފްހާ")}
    >
      <Mark />
      <span className="pa-wordmark truncate">
        <span className="pa-wordmark__brand">{tr("Atoll", "އެޓޮލް")}</span>{" "}
        <span className="pa-wordmark__product">{tr("Records", "ރެކޯޑްސް")}</span>
      </span>
    </ConditionalLink>
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

function useNav(): NavGroup[] {
  const tr = useTr()
  const apps = useApplications()
  const count = (fn: (s: string) => boolean) => apps.filter((a) => fn(a.status)).length
  return [
    {
      items: [
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: PA_ROUTES.dashboard, icon: "home" },
        {
          label: tr("Applications", "އެޕްލިކޭޝަންތައް"),
          href: PA_ROUTES.index,
          icon: "file-text",
          badge: count((s) => s === "submitted"),
        },
        {
          label: tr("Assigned to me", "އަޅުގަނޑާ ޙަވާލުކުރި"),
          href: filteredIndex("assignee", "shifa"),
          icon: "user",
        },
        {
          label: tr("In review", "ރިވިއުކުރަނީ"),
          href: filteredIndex("status", "in_review"),
          icon: "clock",
          badge: count((s) => s === "in_review"),
        },
        { label: tr("Starred", "ތަރި ޖަހާފަ"), href: routes.adminRecords.indexList, icon: "star" },
        { label: tr("Archive", "އާކައިވް"), href: routes.adminRecords.indexGrid, icon: "archive" },
        { label: tr("Trash", "ކުނިފޮށި"), href: routes.adminRecords.trash, icon: "trash" },
      ],
    },
    {
      label: tr("Folders", "ފޯލްޑަރުތައް"),
      items: SERVICES.slice(0, 4).map((s, i) => ({
        id: `folder-${s.value}`,
        label: tr(s.en, s.dv),
        href: filteredIndex("service", s.value),
        icon: "folder",
        color: LABEL_COLORS[i],
      })),
    },
    {
      label: tr("Labels", "ލޭބަލްތައް"),
      items: ISLANDS.slice(0, 4).map((isl) => ({
        id: `label-${isl.value}`,
        label: tr(isl.en, isl.dv),
        href: filteredIndex("island", isl.value),
        color: islandColor(isl.value),
      })),
    },
  ]
}

/** Fixed demo time for notifications (computed once, not during render). */
const NOW = Date.now()

export interface ProtonAntShellProps {
  /** Breadcrumb trail at the top of the PageHeader band (the last item is the current page). */
  breadcrumbs: BreadcrumbsItem[]
  /** Page title (the page's h1). */
  title: React.ReactNode
  /** Grey sub-title next to the title. */
  subTitle?: React.ReactNode
  /** Tags after the title. */
  tags?: React.ReactNode
  /** Buttons at the end of the title row. */
  extra?: React.ReactNode
  /** Description under the title. */
  description?: React.ReactNode
  /** Key figures at the end of the description row. */
  figures?: PageTitleFigure[]
  /** A tab bar at the bottom of the page header. */
  footer?: React.ReactNode
  /** The header search field (the index binds it to the listing). */
  search?: React.ReactNode
  /** "grey": Ant's layout grey behind the cards (dashboard); "panel": cards sit on the white panel (index). */
  layout?: "panel" | "grey"
  children: React.ReactNode
}

/**
 * ProtonAnt's shell, now Onu's default look: `AppLayout` (shell colour, white
 * content panel), `AppSidebar` (wordmark and an `ActionMenu` of apps, the "New
 * application" action, nav with count pills, coloured folders and labels, a
 * quota `ProgressBar`), `AppHeader` (wide rounded search, upgrade, settings, help,
 * language, theme, notifications, account) and `PageTitle`'s Ant PageHeader
 * band (breadcrumb, title, tags, extra, description with key figures, tabs).
 */
export function ProtonAntShell({
  breadcrumbs,
  title,
  subTitle,
  tags,
  extra,
  description,
  figures,
  footer,
  search,
  layout = "panel",
  children,
}: ProtonAntShellProps) {
  const tr = useTr()
  const current = useLocation().pathname
  const groups = useNav()

  // Portalled menus, dialogs and toasts render in <body>: scope the theme there too while mounted.
  React.useEffect(() => {
    const body = document.body
    const hadTheme = body.hasAttribute("data-onu-theme")
    body.classList.add("design-proton-ant-body")
    if (!hadTheme) body.setAttribute("data-onu-theme", "")
    return () => {
      body.classList.remove("design-proton-ant-body")
      if (!hadTheme) body.removeAttribute("data-onu-theme")
    }
  }, [])

  return (
    <div className="design-proton-ant" data-onu-theme="" data-pa-layout={layout}>
      <AppLayout
        contentWidth="full"
        background={layout === "grey" ? "layout" : "default"}
        breadcrumbs={breadcrumbs}
        sidebar={
          <AppSidebar
            groups={groups}
            currentHref={current}
            navLabel={tr("Main", "މައި")}
            header={
              <div className="gap-2 flex items-center justify-between">
                <Wordmark />
                <ActionMenu
                  align="start"
                  trigger={
                    <Button variant="ghost" size="icon" aria-label={tr("Switch app", "އެޕް ބަދަލުކުރޭ")}>
                      <Icon name="grid" />
                    </Button>
                  }
                  items={[
                    { type: "label", label: tr("Atoll apps", "އެޓޮލް އެޕްތައް") },
                    { icon: "file-text", label: tr("Records", "ރެކޯޑްސް"), href: PA_ROUTES.index },
                    { icon: "credit-card", label: tr("Payments", "ފައިސާ"), href: routes.adminRecords.export },
                    { icon: "calendar", label: tr("Calendar", "ކަލެންޑަރު"), href: routes.adminRecords.activityLog },
                    { icon: "folder", label: tr("Drive", "ޑްރައިވް"), href: routes.adminRecords.import },
                    { icon: "users", label: tr("Directory", "ޑިރެކްޓަރީ"), href: routes.adminSettings.users },
                  ]}
                />
              </div>
            }
            action={
              <LinkButton href={routes.adminRecords.create} startIcon="add">
                {tr("New application", "އައު އެޕްލިކޭޝަން")}
              </LinkButton>
            }
            footer={
              <div className="gap-2 pt-3 grid border-t border-shell-border">
                <ProgressBar
                  size="sm"
                  value={1284}
                  max={2000}
                  showValue
                  label={
                    <span className="gap-1.5 inline-flex items-center">
                      <Icon name="file-archive" className="size-4" />
                      {tr("Records quota", "ރެކޯޑު ކޯޓާ")}
                    </span>
                  }
                  formatValue={(v, m) => `${v.toLocaleString("en")} / ${m.toLocaleString("en")}`}
                  classNames={{ label: "text-xs", value: "text-xs tabular-nums", track: "bg-shell-weak" }}
                />
                <div className="gap-2 text-xs flex items-center justify-between">
                  <ConditionalLink
                    href={routes.adminSettings.settings}
                    className="touch:min-h-11 inline-flex items-center rounded-sm text-primary underline-offset-4 hover:underline"
                  >
                    {tr("Get more space", "އިތުރު ޖާގަ")}
                  </ConditionalLink>
                  <span dir="ltr" className="text-muted-foreground">
                    v5.0.42
                  </span>
                </div>
              </div>
            }
          />
        }
        header={
          <AppHeader
            sidebarTrigger
            actions={
              <>
                <LinkButton
                  href={routes.adminSettings.settings}
                  variant="outline"
                  size="sm"
                  className="pa-upgrade me-1 lg:inline-flex hidden"
                  startIcon="star"
                >
                  {tr("Upgrade", "އަޕްގްރޭޑް")}
                </LinkButton>
                <span className="sm:contents hidden">
                  <LinkButton
                    href={routes.adminSettings.settings}
                    variant="ghost"
                    size="icon"
                    aria-label={tr("Settings", "ސެޓިންގްސް")}
                  >
                    <Icon name="settings" />
                  </LinkButton>
                  <LinkButton href="/" variant="ghost" size="icon" aria-label={tr("Help", "އެހީ")}>
                    <Icon name="help" />
                  </LinkButton>
                  <Language />
                </span>
                <ThemeToggle />
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
                <UserProfile
                  name={tr("Aishath Shifa", "އައިޝަތު ޝިފާ")}
                  subtitle="shifa@atoll.mv"
                  profileHref={routes.adminSettings.userProfile}
                  settingsHref={routes.adminSettings.settings}
                  onSignOut={() => {}}
                  align="end"
                  className="ms-1"
                />
              </>
            }
          >
            {search ?? <SearchBox placeholder={tr("Search applications", "އެޕްލިކޭޝަން ހޯދާ")} />}
          </AppHeader>
        }
      >
        <div className={cn("grid", layout === "grey" ? "gap-4 sm:gap-6" : "gap-4")}>
          <PageTitle
            title={title}
            subtitle={subTitle}
            tags={tags}
            actions={extra}
            description={description}
            figures={figures}
            tabs={footer}
          />
          <div>{children}</div>
        </div>
      </AppLayout>
    </div>
  )
}
