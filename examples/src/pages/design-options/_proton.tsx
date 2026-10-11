import * as React from "react"
import { useLocation } from "react-router"
import {
  AppHeader,
  AppLayout,
  AppSidebar,
  Breadcrumbs,
  Button,
  ConditionalLink,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Icon,
  LanguageSwitcher,
  LinkButton,
  NotificationCenter,
  ProgressBar,
  SearchBox,
  ThemeToggle,
  UserProfile,
  cn,
  type BreadcrumbsItem,
  type NavGroup,
} from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { ISLANDS, SERVICES, useApplications } from "../admin-records/_data"

import "./proton.css"

export const PT_ROUTES = {
  index: "/pages/design-options/proton-index",
  dashboard: "/pages/design-options/proton-dashboard",
}

/** Listing state param prefix used by the Proton index (the sidebar folders link into it). */
export const PT_PARAM = "pt_"

/** A link into the index, filtered (`pt_filter[service]=building`). */
export function filteredIndex(key: string, value: string) {
  const params = new URLSearchParams({ [`${PT_PARAM}filter[${key}]`]: value })
  return `${PT_ROUTES.index}?${params.toString()}`
}

/**
 * Proton's label palette (folder and label colours). Decorative only: every
 * dot sits next to a text label.
 */
export const LABEL_COLORS = ["#8080ff", "#db60d6", "#415df0", "#179fd9", "#1da583", "#f78400", "#e93671", "#b4a40e"]

/** The label colour of an island (the sidebar labels and the list pills match). */
export function islandColor(value: string) {
  const i = ISLANDS.findIndex((x) => x.value === value)
  return LABEL_COLORS[((i < 0 ? 0 : i) + 4) % LABEL_COLORS.length]!
}

/** A coloured label dot, as in Proton Mail's label list. */
export function LabelDot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pt-dot size-2.5 shrink-0 rounded-full", className)}
      style={{ "--pt-dot": color } as React.CSSProperties}
    />
  )
}

/** A coloured folder glyph, as in Proton Mail's folder list. */
function FolderIcon({ color }: { color: string }) {
  return (
    <span aria-hidden className="pt-folder" style={{ "--pt-dot": color } as React.CSSProperties}>
      <Icon name="folder" />
    </span>
  )
}

/** The product mark: a rounded tile with a soft gradient from the brand colour. */
export function ProtonMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("pt-mark", className)}>
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
      href={PT_ROUTES.dashboard}
      className="gap-2 min-w-0 flex items-center rounded-md"
      aria-label={tr("Atoll Records, home", "އެޓޮލް ރެކޯޑްސް، ފުރަތަމަ ސަފްހާ")}
    >
      <ProtonMark />
      <span className="pt-wordmark truncate">
        <span className="pt-wordmark__brand">{tr("Atoll", "އެޓޮލް")}</span>{" "}
        <span className="pt-wordmark__product">{tr("Records", "ރެކޯޑްސް")}</span>
      </span>
    </ConditionalLink>
  )
}

/** The app switcher (a grid button opening the list of products). */
function AppSwitcher() {
  const tr = useTr()
  const apps = [
    { icon: "file-text", label: tr("Records", "ރެކޯޑްސް"), href: PT_ROUTES.index, current: true },
    { icon: "credit-card", label: tr("Payments", "ފައިސާ"), href: routes.adminRecords.export },
    { icon: "calendar", label: tr("Calendar", "ކަލެންޑަރު"), href: routes.adminRecords.activityLog },
    { icon: "folder", label: tr("Drive", "ޑްރައިވް"), href: routes.adminRecords.import },
    { icon: "users", label: tr("Directory", "ޑިރެކްޓަރީ"), href: routes.adminSettings.users },
  ]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="pt-icon-btn shrink-0"
          aria-label={tr("Switch app", "އެޕް ބަދަލުކުރޭ")}
        >
          <Icon name="grid" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{tr("Atoll apps", "އެޓޮލް އެޕްތައް")}</DropdownMenuLabel>
        {apps.map((a) => (
          <DropdownMenuItem key={a.label} asChild>
            <ConditionalLink href={a.href} aria-current={a.current ? "page" : undefined}>
              <span className="pt-app-tile" aria-hidden>
                <Icon name={a.icon} />
              </span>
              {a.label}
            </ConditionalLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: PT_ROUTES.dashboard, icon: "home" },
        {
          label: tr("Applications", "އެޕްލިކޭޝަންތައް"),
          href: PT_ROUTES.index,
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
        icon: <FolderIcon color={LABEL_COLORS[i]!} />,
      })),
    },
    {
      label: tr("Labels", "ލޭބަލްތައް"),
      items: ISLANDS.slice(0, 4).map((isl) => ({
        id: `label-${isl.value}`,
        label: tr(isl.en, isl.dv),
        href: filteredIndex("island", isl.value),
        icon: <LabelDot color={islandColor(isl.value)} className="mx-[3px]" />,
      })),
    },
  ]
}

/** Fixed demo time for notifications (computed once, not during render). */
const NOW = Date.now()

/**
 * The Proton-style app shell: a warm-grey sidebar with the product logo, app
 * switcher, a big "New application" button, navigation with counts, coloured
 * folders and labels, and a storage-style quota meter; a header with a rounded
 * search field, upgrade, settings and help buttons and the user menu; and the
 * content on a white panel with a rounded corner.
 */
export function ProtonShell({
  breadcrumbs,
  search,
  children,
}: {
  breadcrumbs: BreadcrumbsItem[]
  /** The header search field (the index binds it to the listing). */
  search?: React.ReactNode
  children: React.ReactNode
}) {
  const tr = useTr()
  const current = useLocation().pathname
  const groups = useNav()

  // Portalled menus, dialogs and toasts render in <body>: scope the theme there too while mounted.
  React.useEffect(() => {
    const body = document.body
    body.classList.add("design-proton-body")
    body.setAttribute("data-onu-theme", "")
    return () => {
      body.classList.remove("design-proton-body")
      body.removeAttribute("data-onu-theme")
    }
  }, [])

  const used = 1284
  const quota = 2000

  return (
    <div className="design-proton" data-onu-theme>
      <AppLayout
        classNames={{ body: "pt-body", main: "pt-main", content: "pt-content" }}
        sidebar={
          <AppSidebar
            groups={groups}
            currentHref={current}
            navLabel={tr("Main", "މައި")}
            classNames={{ content: "px-1.5", groupLabel: "pt-group-label", badge: "pt-count" }}
            header={
              <div className="gap-4 px-1 pt-2 grid">
                <div className="gap-2 flex items-center justify-between">
                  <Wordmark />
                  <AppSwitcher />
                </div>
                <LinkButton href={routes.adminRecords.create} className="pt-cta w-full" size="lg" startIcon="add">
                  {tr("New application", "އައު އެޕްލިކޭޝަން")}
                </LinkButton>
              </div>
            }
            footer={
              <div className="pt-quota gap-2 px-2 pb-1 grid">
                <ProgressBar
                  value={used}
                  max={quota}
                  size="sm"
                  label={
                    <span className="gap-1.5 inline-flex items-center">
                      <Icon name="file-archive" className="size-4" />
                      {tr("Records quota", "ރެކޯޑު ކޯޓާ")}
                    </span>
                  }
                  showValue
                  formatValue={(v, m) => `${v.toLocaleString("en")} / ${m.toLocaleString("en")}`}
                  classNames={{ label: "text-xs", value: "text-xs tabular-nums" }}
                />
                <div className="gap-2 flex items-center justify-between">
                  <ConditionalLink href={routes.adminSettings.settings} className="pt-link text-xs rounded-sm">
                    {tr("Get more space", "އިތުރު ޖާގަ")}
                  </ConditionalLink>
                  <span className="text-xs text-muted-foreground" dir="ltr">
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
            variant="plain"
            className="pt-header"
            classNames={{ center: "gap-3", end: "gap-1" }}
            actions={
              <>
                <LinkButton
                  href={routes.adminSettings.settings}
                  variant="outline"
                  size="sm"
                  className="pt-upgrade me-1 lg:inline-flex hidden"
                  startIcon="star"
                >
                  {tr("Upgrade", "އަޕްގްރޭޑް")}
                </LinkButton>
                <span className="sm:contents hidden">
                  <LinkButton
                    href={routes.adminSettings.settings}
                    variant="ghost"
                    size="icon"
                    className="pt-icon-btn"
                    aria-label={tr("Settings", "ސެޓިންގްސް")}
                  >
                    <Icon name="settings" />
                  </LinkButton>
                  <LinkButton
                    href="/"
                    variant="ghost"
                    size="icon"
                    className="pt-icon-btn"
                    aria-label={tr("Help", "އެހީ")}
                  >
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
                      title: tr("Two-factor authentication turned on", "ޓޫ-ފެކްޓަރ އޮތެންޓިކޭޝަން ހުޅުވިއްޖެ"),
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
                  className="pt-user ms-1"
                  classNames={{ trigger: "pt-user__trigger", subtitle: "pt-user__email" }}
                />
              </>
            }
          >
            <div className="pt-search min-w-0 max-w-xl flex-1">
              {search ?? (
                <SearchBox
                  landmark
                  placeholder={tr("Search applications", "އެޕްލިކޭޝަން ހޯދާ")}
                  className="sm:max-w-none"
                />
              )}
            </div>
          </AppHeader>
        }
      >
        <Breadcrumbs items={breadcrumbs} className="pt-crumbs mb-3" />
        {children}
      </AppLayout>
    </div>
  )
}
