import * as React from "react"
import { useLocation } from "react-router"
import {
  AppHeader,
  AppLayout,
  AppSidebar,
  BottomNav,
  Breadcrumbs,
  Density,
  LanguageSwitcher,
  Logo,
  NotificationCenter,
  SiteFooter,
  ThemeToggle,
  TopNav,
  UserProfile,
  cn,
  type NavGroup,
} from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useTr } from "./i18n"
import { routes } from "./routes"
import { BrandMark } from "../../components/layout"

// Fixed demo times, computed once (not during render).
const NOW = Date.now()

function useCurrent() {
  return useLocation().pathname
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

/** Breadcrumbs in app headers: hidden on phones, where the page title already says where you are. */
function HeaderCrumbs({ items }: { items: Crumb[] }) {
  return items.length ? (
    <div className="min-w-0 sm:block hidden">
      <Breadcrumbs items={items} />
    </div>
  ) : null
}

function adminNav(tr: ReturnType<typeof useTr>): NavGroup[] {
  return [
    {
      items: [{ label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: routes.adminRecords.dashboard, icon: "home" }],
    },
    {
      label: tr("Records", "ރެކޯޑުތައް"),
      items: [
        {
          label: tr("Applications", "އެޕްލިކޭޝަންތައް"),
          icon: "file-text",
          badge: 12,
          items: [
            { label: tr("All applications", "ހުރިހާ އެޕްލިކޭޝަނެއް"), href: routes.adminRecords.indexTable },
            { label: tr("List view", "ލިސްޓް"), href: routes.adminRecords.indexList },
            { label: tr("Grid view", "ގްރިޑް"), href: routes.adminRecords.indexGrid },
            { label: tr("Board", "ބޯޑް"), href: routes.adminRecords.indexKanban },
            { label: tr("Trash", "ކުނިފޮށި"), href: routes.adminRecords.trash },
          ],
        },
        { label: tr("Activity log", "އެކްޓިވިޓީ ލޮގް"), href: routes.adminRecords.activityLog, icon: "history" },
        { label: tr("Import", "އިމްޕޯޓް"), href: routes.adminRecords.import, icon: "upload" },
        { label: tr("Export", "އެކްސްޕޯޓް"), href: routes.adminRecords.export, icon: "download" },
      ],
    },
    {
      label: tr("Content", "ކޮންޓެންޓް"),
      items: [
        { label: tr("Posts", "ޕޯސްޓްތައް"), href: routes.adminContent.postEditor, icon: "edit" },
        { label: tr("Pages", "ސަފްހާތައް"), href: routes.adminContent.pageBuilder, icon: "file" },
        { label: tr("Media", "މީޑިއާ"), href: routes.adminContent.mediaLibrary, icon: "image" },
        { label: tr("Menus", "މެނޫތައް"), href: routes.adminContent.menuBuilder, icon: "menu" },
        { label: tr("Translations", "ތަރުޖަމާ"), href: routes.adminContent.translations, icon: "languages" },
      ],
    },
    {
      label: tr("Settings & access", "ސެޓިންގްސް"),
      items: [
        { label: tr("Users", "މެމްބަރުން"), href: routes.adminSettings.users, icon: "users" },
        { label: tr("Roles", "ރޯލްތައް"), href: routes.adminSettings.roles, icon: "lock" },
        { label: tr("API keys", "އޭޕީއައި ކީ"), href: routes.adminSettings.apiKeys, icon: "key" },
        { label: tr("Notifications", "ނޮޓިފިކޭޝަން"), href: routes.adminSettings.notifications, icon: "bell" },
        { label: tr("Settings", "ސެޓިންގްސް"), href: routes.adminSettings.settings, icon: "settings" },
      ],
    },
  ]
}

/** Admin panel shell: sidebar, header with breadcrumbs, theme/language, notifications. */
export function AdminShell({
  breadcrumbs = [],
  children,
  contentWidth = "default",
}: {
  breadcrumbs?: Crumb[]
  children: React.ReactNode
  contentWidth?: "full" | "wide" | "default" | "narrow"
}) {
  const tr = useTr()
  const current = useCurrent()
  return (
    <AppLayout
      contentWidth={contentWidth}
      sidebar={
        <AppSidebar
          collapsible="icon"
          groups={adminNav(tr)}
          currentHref={current}
          header={
            <Logo
              children={<BrandMark className="size-7" />}
              alt="Onu"
              text={tr("Onu Admin", "އޮނު އެޑްމިން")}
              href={routes.adminRecords.dashboard}
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
        <AppHeader
          sidebarTrigger
          actions={
            <>
              <Language variant="menu" />
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
            </>
          }
        >
          <HeaderCrumbs items={breadcrumbs} />
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
        sidebar={
          <AppSidebar
            items={items}
            currentHref={current}
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
          >
            {breadcrumbs.length ? <Breadcrumbs items={breadcrumbs} /> : null}
          </AppHeader>
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
