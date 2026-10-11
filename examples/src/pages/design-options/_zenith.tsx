import * as React from "react"
import { useLocation, useNavigate } from "react-router"
import {
  AccountSwitcher,
  AppHeader,
  AppLayout,
  AppSidebar,
  Breadcrumbs,
  CommandPalette,
  ConditionalLink,
  DynamicIcon,
  KeyboardKey,
  LanguageSwitcher,
  NotificationCenter,
  ThemeToggle,
  UserAvatar,
  UserProfile,
  cn,
  type NavGroup,
} from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"

import "./zenith.css"

export const ZN_ROUTES = {
  index: "/pages/design-options/zenith-index",
  dashboard: "/pages/design-options/zenith-dashboard",
}

// Fixed demo time for notifications (computed once, not during render).
const NOW = Date.now()

export type Tr = ReturnType<typeof useTr>

/** A Lucide glyph by id (the full Lucide set, for the template's richer iconography). */
export function Glyph({ id, className }: { id: string; className?: string }) {
  return <DynamicIcon id={`lucide:${id}`} className={className} />
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

function nav(tr: Tr): NavGroup[] {
  return [
    {
      label: tr("Overview", "ޚުލާޞާ"),
      items: [
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: ZN_ROUTES.dashboard, icon: <Glyph id="layout-dashboard" /> },
        {
          label: tr("Analytics", "އެނަލިޓިކްސް"),
          href: routes.adminRecords.dashboard,
          icon: <Glyph id="chart-no-axes-column" />,
        },
      ],
    },
    {
      label: tr("Records", "ރެކޯޑުތައް"),
      items: [
        {
          label: tr("Applications", "އެޕްލިކޭޝަންތައް"),
          href: ZN_ROUTES.index,
          icon: <Glyph id="files" />,
          badge: 12,
        },
        { label: tr("Payments", "ފައިސާ"), href: routes.adminRecords.export, icon: <Glyph id="wallet" /> },
        {
          label: tr("Activity log", "އެކްޓިވިޓީ ލޮގް"),
          href: routes.adminRecords.activityLog,
          icon: <Glyph id="activity" />,
        },
        { label: tr("Trash", "ކުނިފޮށި"), href: routes.adminRecords.trash, icon: <Glyph id="trash-2" /> },
      ],
    },
    {
      label: tr("Workspace", "ވޯކްސްޕޭސް"),
      items: [
        { label: tr("Team", "ޓީމު"), href: routes.adminSettings.users, icon: <Glyph id="users" />, badge: 4 },
        { label: tr("Roles", "ރޯލްތައް"), href: routes.adminSettings.roles, icon: <Glyph id="shield-check" /> },
        { label: tr("Settings", "ސެޓިންގްސް"), href: routes.adminSettings.settings, icon: <Glyph id="settings-2" /> },
      ],
    },
  ]
}

/**
 * Scopes the Zenith tokens to `<body>` while a Zenith page is mounted, so
 * portalled menus, popovers and sheets pick up the same look.
 */
function useBodyScope() {
  React.useEffect(() => {
    const body = document.body
    body.classList.add("zenith-portals")
    body.setAttribute("data-onu-theme", "")
    return () => {
      body.classList.remove("zenith-portals")
      body.removeAttribute("data-onu-theme")
    }
  }, [])
}

/** The ⌘K search: a quiet search-field lookalike in the header that opens the command palette. */
function SearchCommand() {
  const tr = useTr()
  const navigate = useNavigate()
  return (
    <CommandPalette
      title={tr("Search", "ހޯދާ")}
      placeholder={tr("Search pages and records…", "ސަފްހާތަކާއި ރެކޯޑުތައް ހޯދާ…")}
      onNavigate={(href) => void navigate(href)}
      recent={false}
      groups={[
        {
          heading: tr("Pages", "ސަފްހާތައް"),
          items: [
            { id: "dash", label: tr("Dashboard", "ޑޭޝްބޯޑް"), icon: "home", href: ZN_ROUTES.dashboard },
            { id: "apps", label: tr("Applications", "އެޕްލިކޭޝަންތައް"), icon: "file-text", href: ZN_ROUTES.index },
            { id: "team", label: tr("Team", "ޓީމު"), icon: "users", href: routes.adminSettings.users },
            {
              id: "settings",
              label: tr("Settings", "ސެޓިންގްސް"),
              icon: "settings",
              href: routes.adminSettings.settings,
            },
          ],
        },
      ]}
      trigger={
        <button type="button" className="zn-search" aria-label={tr("Search (⌘K)", "ހޯދާ (⌘K)")}>
          <Glyph id="search" className="size-4 shrink-0 opacity-70" />
          <span className="truncate">{tr("Search…", "ހޯދާ…")}</span>
          <KeyboardKey keys="mod+k" className="zn-search__kbd" />
        </button>
      }
    />
  )
}

/**
 * The Zenith app shell: a white, collapsible sidebar with a workspace switcher,
 * grouped navigation with icons and count badges, and the user menu at the
 * bottom; a slim header with breadcrumbs, ⌘K search, notifications and avatar.
 */
export function ZenithShell({
  crumbs,
  children,
}: {
  crumbs: { label: string; href?: string }[]
  children: React.ReactNode
}) {
  const tr = useTr()
  const current = useLocation().pathname
  const [workspace, setWorkspace] = React.useState("male")
  useBodyScope()

  return (
    <div className="design-zenith" data-onu-theme="">
      <AppLayout
        contentWidth="wide"
        classNames={{ main: "zn-main" }}
        sidebar={
          <AppSidebar
            collapsible="icon"
            groups={nav(tr)}
            currentHref={current}
            header={
              <AccountSwitcher
                className="zn-workspace"
                size="lg"
                value={workspace}
                onValueChange={setWorkspace}
                classNames={{ avatar: "zn-workspace__logo" }}
                accounts={[
                  {
                    id: "male",
                    name: tr("Malé City Council", "މާލޭ ސިޓީ ކައުންސިލް"),
                    description: tr("Enterprise", "އެންޓަޕްރައިޒް"),
                    type: "organisation",
                  },
                  {
                    id: "addu",
                    name: tr("Addu City Council", "އައްޑޫ ސިޓީ ކައުންސިލް"),
                    description: tr("Pro", "ޕްރޯ"),
                    type: "organisation",
                  },
                  {
                    id: "fuvahmulah",
                    name: tr("Fuvahmulah Council", "ފުވައްމުލައް ކައުންސިލް"),
                    description: tr("Starter", "ސްޓާޓަރ"),
                    type: "organisation",
                  },
                ]}
              />
            }
            footer={
              <UserProfile
                name={tr("Aishath Shifa", "އައިޝަތު ޝިފާ")}
                subtitle="shifa@javaabu.com"
                profileHref={routes.adminSettings.userProfile}
                settingsHref={routes.adminSettings.settings}
                onSignOut={() => {}}
                side="top"
              />
            }
          />
        }
        header={
          <AppHeader sidebarTrigger classNames={{ center: "gap-3" }} actions={<HeaderActions />}>
            <span aria-hidden className="zn-header-sep sm:block hidden" />
            <div className="min-w-0 sm:block hidden">
              <Breadcrumbs items={crumbs} />
            </div>
            <p className="text-sm font-medium sm:hidden truncate">{crumbs[crumbs.length - 1]?.label}</p>
          </AppHeader>
        }
      >
        {children}
      </AppLayout>
    </div>
  )
}

function HeaderActions() {
  const tr = useTr()
  return (
    <>
      <div className="me-1 md:block hidden">
        <SearchCommand />
      </div>
      <Language />
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
      <ConditionalLink
        href={routes.adminSettings.userProfile}
        className="ms-1 sm:inline-flex hidden rounded-full"
        aria-label={tr("Your profile: Aishath Shifa", "ޕްރޮފައިލް: އައިޝަތު ޝިފާ")}
      >
        <UserAvatar name={tr("Aishath Shifa", "އައިޝަތު ޝިފާ")} size="sm" decorative />
      </ConditionalLink>
    </>
  )
}

/** A Zenith card: white surface, 1px border, no shadow, a tight title row with an optional action. */
export function ZnCard({
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}) {
  const headingId = React.useId()
  return (
    <section className={cn("zn-card", className)} aria-labelledby={title ? headingId : undefined}>
      {title ? (
        <header className="zn-card__head">
          <div className="gap-1 min-w-0 grid">
            <h2 id={headingId} className="zn-card__title">
              {title}
            </h2>
            {description ? <p className="zn-card__desc">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn("zn-card__body", bodyClassName)}>{children}</div>
    </section>
  )
}
