import * as React from "react"
import { useLocation, useNavigate } from "react-router"
import {
  ActionMenu,
  AppHeader,
  AppLayout,
  AppSidebar,
  BottomNav,
  Button,
  ConditionalLink,
  Density,
  Icon,
  LanguageSwitcher,
  LinkButton,
  Logo,
  NotificationCenter,
  ProgressBar,
  SearchBox,
  SiteFooter,
  ThemeToggle,
  TopNav,
  UserProfile,
  cn,
  type BreadcrumbsItem,
  type NavGroup,
} from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useTr } from "./i18n"
import { routes } from "./routes"
import { BrandMark } from "../../components/brand-mark"
import { ISLANDS, SERVICES, useApplications } from "../admin-records/_data"

// Fixed demo times, computed once (not during render).
const NOW = Date.now()

/** The current path and query, so sidebar items that link to a filtered list (folders, labels) light up. */
function useCurrent() {
  const { pathname, search } = useLocation()
  return `${pathname}${search}`
}

function Language({ variant = "select" }: { variant?: "select" | "menu" }) {
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

export interface Crumb {
  label: string
  href?: string
}

/** Proton's label palette for folders and labels. Decorative only: every colour sits next to a text label. */
export const LABEL_COLORS = ["#8080ff", "#db60d6", "#415df0", "#179fd9", "#1da583", "#f78400", "#e93671", "#b4a40e"]

/** The applications index, filtered (`app_filter[service]=building`), as the sidebar folders and labels link to it. */
export function filteredApplications(key: string, value: string) {
  const params = new URLSearchParams({ [`app_filter[${key}]`]: value })
  return `${routes.adminRecords.indexTable}?${params.toString()}`
}

function adminNav(tr: ReturnType<typeof useTr>, counts: { submitted: number; inReview: number }): NavGroup[] {
  return [
    {
      items: [
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: routes.adminRecords.dashboard, icon: "home" },
        {
          label: tr("Applications", "އެޕްލިކޭޝަންތައް"),
          href: routes.adminRecords.indexTable,
          icon: "file-text",
          badge: counts.submitted,
        },
        {
          label: tr("In review", "ރިވިއުކުރަނީ"),
          href: filteredApplications("status", "in_review"),
          icon: "clock",
          badge: counts.inReview,
          badgeTone: "neutral",
        },
        { label: tr("Board", "ބޯޑް"), href: routes.adminRecords.indexKanban, icon: "kanban" },
        { label: tr("Activity log", "އެކްޓިވިޓީ ލޮގް"), href: routes.adminRecords.activityLog, icon: "history" },
        {
          label: tr("Import & export", "އިމްޕޯޓް އަދި އެކްސްޕޯޓް"),
          icon: "upload",
          items: [
            { label: tr("Import", "އިމްޕޯޓް"), href: routes.adminRecords.import },
            { label: tr("Export", "އެކްސްޕޯޓް"), href: routes.adminRecords.export },
          ],
        },
        { label: tr("Trash", "ކުނިފޮށި"), href: routes.adminRecords.trash, icon: "trash" },
      ],
    },
    {
      label: tr("Folders", "ފޯލްޑަރުތައް"),
      items: SERVICES.slice(0, 4).map((s, i) => ({
        id: `folder-${s.value}`,
        label: tr(s.en, s.dv),
        href: filteredApplications("service", s.value),
        icon: "folder",
        color: LABEL_COLORS[i],
      })),
    },
    {
      label: tr("Labels", "ލޭބަލްތައް"),
      items: ISLANDS.slice(0, 3).map((isl, i) => ({
        id: `label-${isl.value}`,
        label: tr(isl.en, isl.dv),
        href: filteredApplications("island", isl.value),
        color: LABEL_COLORS[(i + 4) % LABEL_COLORS.length],
      })),
    },
    {
      label: tr("Administration", "އިދާރީ"),
      items: [
        {
          label: tr("Content", "ކޮންޓެންޓް"),
          icon: "edit",
          items: [
            { label: tr("Posts", "ޕޯސްޓްތައް"), href: routes.adminContent.postEditor },
            { label: tr("Pages", "ސަފްހާތައް"), href: routes.adminContent.pageBuilder },
            { label: tr("Media", "މީޑިއާ"), href: routes.adminContent.mediaLibrary },
            { label: tr("Menus", "މެނޫތައް"), href: routes.adminContent.menuBuilder },
            { label: tr("Translations", "ތަރުޖަމާ"), href: routes.adminContent.translations },
          ],
        },
        {
          label: tr("Settings & access", "ސެޓިންގްސް"),
          icon: "settings",
          items: [
            { label: tr("Users", "މެމްބަރުން"), href: routes.adminSettings.users },
            { label: tr("Roles", "ރޯލްތައް"), href: routes.adminSettings.roles },
            { label: tr("API keys", "އޭޕީއައި ކީ"), href: routes.adminSettings.apiKeys },
            { label: tr("Notifications", "ނޮޓިފިކޭޝަން"), href: routes.adminSettings.notifications },
            { label: tr("Settings", "ސެޓިންގްސް"), href: routes.adminSettings.settings },
          ],
        },
      ],
    },
  ]
}

/** The header search: searches the applications index. */
function AdminSearch() {
  const tr = useTr()
  const navigate = useNavigate()
  const { settings } = useSettings()
  return (
    <SearchBox
      placeholder={tr("Search applications", "އެޕްލިކޭޝަން ހޯދާ")}
      thaana={settings.locale === "dv"}
      onSearch={(q) => {
        const params = new URLSearchParams(q ? { app_search: q } : {})
        void navigate(`${routes.adminRecords.indexTable}${q ? `?${params.toString()}` : ""}`)
      }}
    />
  )
}

/**
 * Admin panel shell (Proton): the sidebar with the app switcher, a "New
 * application" button, nav with counts, folders, labels and a quota meter; the
 * header with search, settings, help, language, theme, notifications and the
 * account menu; the page on a white panel. Breadcrumbs show in the page header.
 */
export function AdminShell({
  breadcrumbs = [],
  children,
  contentWidth = "default",
  background,
}: {
  breadcrumbs?: Crumb[]
  children: React.ReactNode
  contentWidth?: "full" | "wide" | "default" | "narrow"
  /** `layout`: the light grey behind dashboards made of cards. */
  background?: "default" | "layout"
}) {
  const tr = useTr()
  const current = useCurrent()
  const apps = useApplications()
  const counts = {
    submitted: apps.filter((a) => a.status === "submitted").length,
    inReview: apps.filter((a) => a.status === "in_review").length,
  }
  const trail: BreadcrumbsItem[] = breadcrumbs.length
    ? [{ label: tr("Home", "ފުރަތަމަ ސަފްހާ"), href: routes.adminRecords.dashboard }, ...breadcrumbs]
    : []

  return (
    <AppLayout
      contentWidth={contentWidth}
      background={background}
      breadcrumbs={trail}
      sidebar={
        <AppSidebar
          collapsible="icon"
          groups={adminNav(tr, counts)}
          currentHref={current}
          header={
            <div className="gap-2 flex items-center justify-between">
              <Logo
                children={<BrandMark className="size-7" />}
                alt="Onu"
                text={tr("Onu Admin", "އޮނު އެޑްމިން")}
                href={routes.adminRecords.dashboard}
              />
              <ActionMenu
                align="start"
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="group-data-[collapsible=icon]:hidden"
                    aria-label={tr("Switch app", "އެޕް ބަދަލުކުރޭ")}
                  >
                    <Icon name="grid" />
                  </Button>
                }
                items={[
                  { type: "label", label: tr("Onu apps", "އޮނު އެޕްތައް") },
                  { label: tr("Records", "ރެކޯޑްސް"), href: routes.adminRecords.dashboard, icon: "file-text" },
                  { label: tr("Content", "ކޮންޓެންޓް"), href: routes.adminContent.postEditor, icon: "edit" },
                  { label: tr("Maps", "މެޕް"), href: routes.maps.fleet, icon: "map-pin" },
                  { label: tr("Learning", "ދަސްކުރުން"), href: routes.learning.courses, icon: "play" },
                  { label: tr("Directory", "ޑިރެކްޓަރީ"), href: routes.adminSettings.users, icon: "users" },
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
              <span className="sm:contents hidden">
                <LinkButton
                  href={routes.adminSettings.settings}
                  variant="ghost"
                  size="icon"
                  aria-label={tr("Settings", "ސެޓިންގްސް")}
                >
                  <Icon name="settings" />
                </LinkButton>
                <Language variant="menu" />
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
                    title: tr("Payment received: MVR 250.00", "ފައިސާ ލިބިއްޖެ: ރ. 250.00"),
                    time: new Date(NOW - 1000 * 60 * 60 * 3),
                    read: true,
                  },
                ]}
                onMarkRead={() => {}}
              />
              <UserProfile
                name={tr("Aishath Shifa", "އައިޝަތު ޝިފާ")}
                subtitle="shifa@javaabu.com"
                profileHref={routes.adminSettings.userProfile}
                settingsHref={routes.adminSettings.settings}
                onSignOut={() => {}}
                align="end"
                className="ms-1"
              />
            </>
          }
        >
          <AdminSearch />
        </AppHeader>
      }
    >
      {children}
    </AppLayout>
  )
}

/** Citizen / member portal shell: lighter sidebar, bottom navigation on phones. */
export function CitizenShell({ breadcrumbs = [], children }: { breadcrumbs?: Crumb[]; children: React.ReactNode }) {
  const tr = useTr()
  const current = useCurrent()
  const items = [
    { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: routes.citizen.dashboard, icon: "home" },
    {
      label: tr("My applications", "އަޅުގަނޑުގެ އެޕްލިކޭޝަންތައް"),
      href: routes.citizen.applications,
      icon: "file-text",
      badge: 2,
    },
    { label: tr("My documents", "ލިޔެކިޔުންތައް"), href: routes.citizen.documents, icon: "folder" },
    { label: tr("My payments", "ފައިސާ ދެއްކުންތައް"), href: routes.citizen.payments, icon: "credit-card" },
    { label: tr("Notifications", "ނޮޓިފިކޭޝަންތައް"), href: routes.citizen.notifications, icon: "bell", badge: 3 },
    { label: tr("Profile", "ޕްރޮފައިލް"), href: routes.citizen.profile, icon: "user" },
  ]
  return (
    <Density value="comfortable" className="contents">
      <AppLayout
        breadcrumbs={breadcrumbs}
        sidebar={
          <AppSidebar
            items={items}
            currentHref={current}
            action={
              <LinkButton href={routes.applications.wizard} startIcon="add">
                {tr("Apply for a service", "ޚިދުމަތަކަށް އެދޭ")}
              </LinkButton>
            }
            header={
              <Logo
                children={<BrandMark className="size-7" />}
                alt="eServices"
                text={tr("eServices", "އީ ސަރވިސަސް")}
                href={routes.citizen.dashboard}
              />
            }
            footer={
              <UserProfile
                name={tr("Ahmed Ali", "އަޙްމަދު ޢަލީ")}
                subtitle="A123456"
                profileHref={routes.citizen.profile}
                onSignOut={() => {}}
                side="top"
              />
            }
          />
        }
        header={
          <AppHeader
            sidebarTrigger
            actions={
              <>
                <Language />
                <ThemeToggle />
              </>
            }
          />
        }
        bottomNav={<BottomNav currentHref={current} items={items.slice(0, 4)} />}
      >
        {children}
      </AppLayout>
    </Density>
  )
}

/** Public portal shell: top navigation and a full footer, comfortable density. */
export function PortalShell({ children, className }: { children: React.ReactNode; className?: string }) {
  const tr = useTr()
  const current = useCurrent()
  return (
    <Density value="comfortable" className="flex min-h-svh flex-col bg-background">
      <header className="top-0 backdrop-blur sticky z-30 border-b bg-background/95">
        <div className="max-w-6xl gap-4 px-4 py-2 mx-auto flex items-center">
          {/* TopNav shows `logo` only in its phone drawer; the bar shows it here. */}
          <div className="md:block hidden shrink-0">
            <Logo
              children={<BrandMark className="size-7" />}
              alt="Onu"
              text={tr("Ministry of Services", "ޚިދުމަތްތަކުގެ ވުޒާރާ")}
              href={routes.public.home}
            />
          </div>
          <TopNav
            className="flex-1"
            currentHref={current}
            logo={
              <Logo
                children={<BrandMark className="size-7" />}
                alt="Onu"
                text={tr("Ministry of Services", "ޚިދުމަތްތަކުގެ ވުޒާރާ")}
                href={routes.public.home}
              />
            }
            items={[
              { label: tr("Services", "ޚިދުމަތްތައް"), href: routes.public.services },
              { label: tr("News", "ޚަބަރު"), href: routes.public.news },
              { label: tr("Events", "ހަރަކާތްތައް"), href: routes.public.events },
              { label: tr("Jobs", "ވަޒީފާ"), href: routes.public.jobs },
              { label: tr("Laws", "ޤާނޫނުތައް"), href: routes.public.laws },
              { label: tr("About", "އަޅުގަނޑުމެން"), href: routes.public.about },
              { label: tr("Contact", "ގުޅުއްވާ"), href: routes.public.contact },
            ]}
          />
          <Language />
        </div>
      </header>
      <main id="main" className={cn("flex-1", className)}>
        {children}
      </main>
      <SiteFooter
        logo={
          <Logo
            children={<BrandMark className="size-7" />}
            alt=""
            text={tr("Ministry of Services", "ޚިދުމަތްތަކުގެ ވުޒާރާ")}
            href={null}
          />
        }
        description={tr("Government services for every island.", "ކޮންމެ ރަށަކަށް ސަރުކާރުގެ ޚިދުމަތް.")}
        columns={[
          {
            title: tr("Services", "ޚިދުމަތްތައް"),
            links: [
              { label: tr("All services", "ހުރިހާ ޚިދުމަތެއް"), href: routes.public.services },
              { label: tr("eServices sign in", "އީ ސަރވިސަސް"), href: routes.auth.signIn },
            ],
          },
          {
            title: tr("Media", "މީޑިއާ"),
            links: [
              { label: tr("News", "ޚަބަރު"), href: routes.public.news },
              { label: tr("Gallery", "ގެލަރީ"), href: routes.public.gallery },
              { label: tr("Events", "ހަރަކާތްތައް"), href: routes.public.events },
            ],
          },
          {
            title: tr("About", "އަޅުގަނޑުމެން"),
            links: [
              { label: tr("About us", "އަޅުގަނޑުމެން"), href: routes.public.about },
              { label: tr("Jobs", "ވަޒީފާ"), href: routes.public.jobs },
              { label: tr("Contact", "ގުޅުއްވާ"), href: routes.public.contact },
            ],
          },
        ]}
        name={tr("Ministry of Services", "ޚިދުމަތްތަކުގެ ވުޒާރާ")}
      />
    </Density>
  )
}

/** Auth pages: centred card with logo and language switcher. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const tr = useTr()
  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <div className="gap-2 p-4 flex items-center justify-between">
        <Logo
          children={<BrandMark className="size-7" />}
          alt="Onu"
          text={tr("eServices", "އީ ސަރވިސަސް")}
          href={routes.public.home}
        />
        <Language />
      </div>
      <main id="main" className="px-4 pb-16 pt-4 sm:items-center flex flex-1 items-start justify-center">
        <div className="max-w-md w-full">{children}</div>
      </main>
    </div>
  )
}

/** Kiosk: touch density, full screen, large type. */
export function KioskShell({ children, className }: { children: React.ReactNode; className?: string }) {
  const tr = useTr()
  return (
    <Density value="touch" className="flex min-h-svh flex-col bg-background">
      <header className="gap-4 px-6 py-4 flex items-center justify-between border-b">
        <Logo
          children={<BrandMark className="size-7" />}
          alt="Onu"
          text={tr("Self-service kiosk", "ސެލްފް ސަރވިސް ކިއޮސްކް")}
          href={routes.kiosk.start}
        />
        <Language />
      </header>
      <main id="main" className={cn("p-6 flex flex-1 flex-col items-center justify-center", className)}>
        {children}
      </main>
    </Density>
  )
}
