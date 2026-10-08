import * as React from "react"
import { useLocation } from "react-router"
import {
  AppHeader,
  AppLayout,
  AppSidebar,
  ConditionalLink,
  Icon,
  LanguageSwitcher,
  LinkButton,
  Logo,
  NotificationCenter,
  SearchBox,
  ThemeToggle,
  UserAvatar,
  cn,
  type NavGroup,
} from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"

import "./chakra.css"

export const CK_ROUTES = {
  index: "/pages/design-options/chakra-index",
  dashboard: "/pages/design-options/chakra-dashboard",
}

// Fixed demo time for notifications (computed once, not during render).
const NOW = Date.now()

/** A stable colourful avatar class for a name (Chakra's coloured avatar backgrounds). */
export function avatarTone(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997
  return `ck-av-${h % 5}`
}

/** UserAvatar with a coloured background. */
export function ToneAvatar({ name, ...props }: React.ComponentProps<typeof UserAvatar> & { name: string }) {
  return <UserAvatar name={name} {...props} classNames={{ ...props.classNames, fallback: avatarTone(name) }} />
}

/** Chakra's StatHelpText: a small triangle and a percentage. */
export function StatHelp({ value, context, good = true }: { value: number; context?: string; good?: boolean }) {
  const up = value >= 0
  const positive = up === good
  return (
    <span className="gap-1 text-sm inline-flex flex-wrap items-center">
      <span
        className={cn(
          "font-semibold inline-flex items-center tabular-nums",
          positive ? "text-success" : "text-destructive",
        )}
        dir="ltr"
      >
        <span aria-hidden className={cn("ck-stat-arrow", up ? "ck-stat-arrow--up" : "ck-stat-arrow--down")} />
        <span className="sr-only">{up ? "+" : "−"}</span>
        {Math.abs(value).toFixed(1)}%
      </span>
      {context ? <span className="text-muted-foreground">{context}</span> : null}
    </span>
  )
}

/** The mark: a rounded tile with two overlapping "chakra" rings. */
export function ChakraMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("ck-icon-tile ck-icon-tile--sm size-8!", className)}>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="8" cy="10" r="4.5" />
        <circle cx="12" cy="10" r="4.5" strokeOpacity=".6" />
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
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: CK_ROUTES.dashboard, icon: "home" },
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: CK_ROUTES.index, icon: "file-text", badge: 12 },
        { label: tr("Activity log", "އެކްޓިވިޓީ ލޮގް"), href: routes.adminRecords.activityLog, icon: "history" },
        { label: tr("Payments", "ފައިސާ"), href: routes.adminRecords.export, icon: "credit-card" },
      ],
    },
    {
      label: tr("Account pages", "އެކައުންޓް"),
      items: [
        { label: tr("Users", "މެމްބަރުން"), href: routes.adminSettings.users, icon: "users" },
        { label: tr("Roles", "ރޯލްތައް"), href: routes.adminSettings.roles, icon: "lock" },
        { label: tr("Settings", "ސެޓިންގްސް"), href: routes.adminSettings.settings, icon: "settings" },
      ],
    },
  ]
}

/**
 * The Chakra app shell: a sidebar on the gray.50 page with icon-tile nav items
 * (the active one lifts into a white card), a help card, and a soft header
 * with breadcrumbs, the page name, search and actions.
 */
export function ChakraShell({ page, children }: { page: string; children: React.ReactNode }) {
  const tr = useTr()
  const current = useLocation().pathname

  return (
    <div className="design-chakra">
      <AppLayout
        contentWidth="wide"
        classNames={{ main: "md:px-8 md:pt-4 pb-10" }}
        sidebar={
          <AppSidebar
            groups={nav(tr)}
            currentHref={current}
            classNames={{ content: "px-2", groupLabel: "px-3" }}
            header={
              <div className="gap-4 pt-3 grid">
                <Logo
                  alt="Atoll Admin"
                  href={CK_ROUTES.dashboard}
                  text={<span className="ck-heading text-base">{tr("Atoll Admin", "އެޓޮލް އެޑްމިން")}</span>}
                >
                  <ChakraMark />
                </Logo>
                <div className="ck-divider" aria-hidden />
              </div>
            }
            footer={
              <div className="ck-help p-4 gap-3 m-1 grid">
                <span className="size-9 bg-white/90 flex items-center justify-center rounded-xl text-[var(--c-700)]">
                  <Icon name="help" className="size-4" />
                </span>
                <div>
                  <p className="font-bold">{tr("Need help?", "އެހީއަށް ބޭނުންތޯ؟")}</p>
                  <p className="text-sm text-white/90">
                    {tr("Read the staff handbook", "މުވައްޒަފުންގެ ގައިޑު ބައްލަވާ")}
                  </p>
                </div>
                <LinkButton href="/" size="sm" className="ck-help__btn w-full">
                  {tr("Documentation", "ޑޮކިއުމެންޓޭޝަން")}
                </LinkButton>
              </div>
            }
          />
        }
        header={
          <AppHeader
            sidebarTrigger
            classNames={{ center: "gap-4" }}
            actions={
              <>
                <div className="me-2 lg:block w-56 hidden">
                  <SearchBox
                    landmark
                    placeholder={tr("Type here…", "މިތާ ލިޔުއްވާ…")}
                    classNames={{ input: "rounded-full bg-card" }}
                  />
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
                  <ToneAvatar name={tr("Aishath Shifa", "އައިޝަތު ޝިފާ")} size="sm" decorative />
                </ConditionalLink>
              </>
            }
          >
            <div className="min-w-0 leading-tight">
              <p className="text-xs gap-1 sm:flex hidden text-muted-foreground">
                <span>{tr("Pages", "ސަފްހާތައް")}</span>
                <span aria-hidden>/</span>
                <span className="text-foreground">{page}</span>
              </p>
              <p className="ck-heading text-sm sm:text-base truncate">{page}</p>
            </div>
          </AppHeader>
        }
      >
        {children}
      </AppLayout>
    </div>
  )
}
