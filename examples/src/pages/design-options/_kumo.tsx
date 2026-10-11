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
  NotificationCenter,
  SearchBox,
  StatusBadge,
  ThemeToggle,
  UserAvatar,
  cn,
  toast,
  type NavGroup,
} from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { useApplications, type Application, type ApplicationStatus } from "../admin-records/_data"

import "./kumo.css"

export const KUMO_ROUTES = {
  index: "/pages/design-options/kumo-index",
  dashboard: "/pages/design-options/kumo-dashboard",
}

/** Listing state param prefix used by the Kumo index (sidebar service links filter into it). */
export const KUMO_PARAM = "kumo_"

/** A link into the index, filtered (`kumo_filter[service]=building`). */
export function filteredIndex(key: string, value: string) {
  const params = new URLSearchParams({ [`${KUMO_PARAM}filter[${key}]`]: value })
  return `${KUMO_ROUTES.index}?${params.toString()}`
}

/** Fixed demo clock, so pages and screenshots are stable. */
export const KUMO_NOW = new Date("2026-10-07T18:30:00Z")
const minutesAgo = (m: number) => new Date(KUMO_NOW.getTime() - m * 60_000)

type Tr = ReturnType<typeof useTr>

// ---------------------------------------------------------------------------
// Small Kumo-style pieces

/** A stable, hex-looking resource ID (Cloudflare shows these in monospace with a copy button). */
export function resourceId(a: Pick<Application, "id" | "reference">) {
  let h = 2166136261
  for (const ch of `${a.id}:${a.reference}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  const hex = (h.toString(16) + (h * 7919).toString(16)).padEnd(12, "0")
  return `${hex.slice(0, 8)}…${hex.slice(-4)}`
}

export type KumoTone = "neutral" | "info" | "success" | "warning" | "danger" | "brand"

/** How application statuses map onto Kumo's badge variants. */
export const STATUS_TONE: Record<ApplicationStatus, KumoTone> = {
  submitted: "neutral",
  in_review: "info",
  approved: "success",
  rejected: "danger",
  suspended: "warning",
}

/**
 * Kumo's Badge: a small rounded-full pill on a tinted fill (`bg-kumo-*-tint`),
 * with a 7px status dot. Built on Onu's StatusBadge; the text carries the meaning.
 */
export function KumoBadge({
  tone = "neutral",
  dot = true,
  children,
  className,
}: {
  tone?: KumoTone
  dot?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <StatusBadge
      status="neutral"
      icon={dot ? <span aria-hidden className="kumo-badge__dot" /> : false}
      className={cn("kumo-badge", className)}
      data-tone={tone}
    >
      {children}
    </StatusBadge>
  )
}

/** A monospace ID with a small copy button (Cloudflare's account / zone ID rows). */
export function MonoId({ value, label, tr }: { value: string; label: string; tr: Tr }) {
  return (
    <span className="kumo-id">
      <code className="kumo-mono">{value}</code>
      <Button
        variant="ghost"
        size="icon-xs"
        className="kumo-id__copy"
        aria-label={tr(`Copy ${label}`, `${label} ކޮޕީކުރޭ`)}
        onClick={() => {
          void navigator.clipboard?.writeText(value).catch(() => {})
          toast.success(tr("Copied to clipboard", "ކޮޕީކުރެވިއްޖެ"))
        }}
      >
        <Icon name="copy" />
      </Button>
    </span>
  )
}

/**
 * Kumo's LayerCard: an elevated frame (hairline ring, rounded-lg) with a quiet
 * title row, holding a base-coloured inner panel with its own 1px line.
 */
export function LayerCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  flush = false,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  flush?: boolean
}) {
  const headingId = React.useId()
  return (
    <section aria-labelledby={headingId} className={cn("kumo-layer", className)}>
      <header className="kumo-layer__head">
        <div className="min-w-0">
          <h2 id={headingId} className="kumo-layer__title">
            {title}
          </h2>
          {description ? <p className="kumo-layer__desc">{description}</p> : null}
        </div>
        {actions ? <div className="gap-1 flex shrink-0 items-center">{actions}</div> : null}
      </header>
      <div className={cn("kumo-layer__body", flush && "kumo-layer__body--flush", bodyClassName)}>{children}</div>
    </section>
  )
}

/** UserAvatar on Kumo's neutral fill. */
export function KumoAvatar(props: React.ComponentProps<typeof UserAvatar>) {
  return (
    <UserAvatar {...props} classNames={{ ...props.classNames, fallback: cn("kumo-av", props.classNames?.fallback) }} />
  )
}

// ---------------------------------------------------------------------------
// Shell

/** The mark: an original two-lobed cloud glyph ("kumo" is Japanese for cloud), not a product logo. */
function CloudMark() {
  return (
    <svg aria-hidden viewBox="0 0 32 20" className="kumo-mark">
      <path
        fill="currentColor"
        d="M25.6 19H6.2A5.2 5.2 0 0 1 5.4 8.7 7.4 7.4 0 0 1 19.2 6a5.6 5.6 0 0 1 7.7 4.4A4.4 4.4 0 0 1 25.6 19Z"
      />
    </svg>
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

function sideNav(tr: Tr, open: number): NavGroup[] {
  return [
    {
      items: [
        { label: tr("Account home", "އެކައުންޓް ހޯމް"), href: KUMO_ROUTES.dashboard, icon: "home" },
        {
          label: tr("Applications", "އެޕްލިކޭޝަންތައް"),
          href: KUMO_ROUTES.index,
          icon: "file-text",
          badge: open,
        },
        { label: tr("Analytics & logs", "އެނަލިޓިކްސް"), href: routes.adminRecords.activityLog, icon: "history" },
        { label: tr("Board", "ބޯޑް"), href: routes.adminRecords.indexKanban, icon: "kanban" },
      ],
    },
    {
      label: tr("Services", "ޚިދުމަތްތައް"),
      items: [
        {
          label: tr("Building permits", "ބިނާކުރުމުގެ ހުއްދަ"),
          href: filteredIndex("service", "building"),
          icon: "building",
        },
        { label: tr("Land leases", "ބިން ކުއްޔަށް"), href: filteredIndex("service", "land"), icon: "map-pin" },
        {
          label: tr("Vessel registry", "އުޅަނދު ރަޖިސްޓްރީ"),
          href: filteredIndex("service", "vessel"),
          icon: "navigation",
        },
        {
          label: tr("Trade licences", "ވިޔަފާރީގެ ލައިސަންސް"),
          href: filteredIndex("service", "trade"),
          icon: "credit-card",
        },
      ],
    },
    {
      label: tr("Manage account", "އެކައުންޓް"),
      items: [
        { label: tr("Members", "މެންބަރުން"), href: routes.adminSettings.users, icon: "users" },
        { label: tr("Exports", "އެކްސްޕޯޓް"), href: routes.adminRecords.export, icon: "download" },
        { label: tr("Configurations", "ސެޓިންގްސް"), href: routes.adminSettings.settings, icon: "settings" },
      ],
    },
  ]
}

/** The account switcher at the top of the sidebar (Cloudflare's account picker). */
function AccountSwitcher({ tr }: { tr: Tr }) {
  return (
    <ActionMenu
      align="start"
      trigger={
        <button type="button" className="kumo-account">
          <span aria-hidden className="kumo-account__avatar">
            M
          </span>
          <span className="min-w-0 flex-1 text-start">
            <span className="kumo-account__name">{tr("Malé City Council", "މާލޭ ސިޓީ ކައުންސިލް")}</span>
            <span className="kumo-account__plan">{tr("Enterprise account", "އެންޓަޕްރައިޒް އެކައުންޓް")}</span>
          </span>
          <Icon name="chevrons-up-down" className="kumo-account__chev" />
          <span className="sr-only">{tr(", switch account", "، އެކައުންޓް ބަދަލުކުރޭ")}</span>
        </button>
      }
      items={[
        { type: "label", id: "l", label: tr("Accounts", "އެކައުންޓްތައް") },
        { id: "male", label: tr("Malé City Council", "މާލޭ ސިޓީ ކައުންސިލް"), icon: "check" },
        { id: "addu", label: tr("Addu City Council", "އައްޑޫ ސިޓީ ކައުންސިލް") },
        { id: "fvm", label: tr("Fuvahmulah City Council", "ފުވައްމުލަކު ސިޓީ ކައުންސިލް") },
        { type: "separator", id: "s" },
        { id: "all", label: tr("View all accounts", "ހުރިހާ އެކައުންޓެއް"), icon: "grid" },
      ]}
    />
  )
}

/** Keeps <body> in the Kumo scope while mounted, so portalled menus and sheets match. */
function useBodyScope() {
  React.useEffect(() => {
    const body = document.body
    body.classList.add("kumo-portal")
    body.setAttribute("data-onu-theme", "")
    return () => {
      body.classList.remove("kumo-portal")
      body.removeAttribute("data-onu-theme")
    }
  }, [])
}

/**
 * The Kumo app shell (Cloudflare dashboard): a white left sidebar (logo row,
 * account switcher, grouped icon links with counts, a support footer) beside a
 * 58px top bar (quick search "Go to…", Add, support, notifications, profile)
 * over a light-grey canvas.
 */
export function KumoShell({ children }: { children: React.ReactNode }) {
  const tr = useTr()
  const current = useLocation().pathname
  const open = useApplications().filter((a) => a.status === "submitted" || a.status === "in_review").length
  useBodyScope()

  return (
    <div data-onu-theme className="design-kumo">
      <AppLayout
        classNames={{ main: "kumo-main", body: "kumo-body" }}
        sidebar={
          <AppSidebar
            groups={sideNav(tr, open)}
            currentHref={current}
            match="exact"
            navLabel={tr("Account", "އެކައުންޓް")}
            classNames={{
              header: "kumo-side-head",
              content: "kumo-side-content",
              groupLabel: "kumo-group-label",
              badge: "kumo-nav-count",
              footer: "kumo-side-foot",
            }}
            header={
              <>
                <ConditionalLink href={KUMO_ROUTES.dashboard} className="kumo-brand">
                  <CloudMark />
                  <span className="kumo-brand__name">{tr("Atoll Cloud", "އެޓޮލް ކްލައުޑް")}</span>
                </ConditionalLink>
                <AccountSwitcher tr={tr} />
              </>
            }
            footer={
              <div className="gap-0.5 grid">
                <ConditionalLink href={routes.adminRecords.activityLog} className="kumo-foot-link">
                  <Icon name="help" />
                  {tr("Support", "އެހީ")}
                </ConditionalLink>
                <ConditionalLink href={routes.adminSettings.settings} className="kumo-foot-link">
                  <Icon name="file-text" />
                  {tr("Documentation", "ޑޮކިއުމެންޓޭޝަން")}
                  <Icon name="external-link" className="ms-auto opacity-60" />
                </ConditionalLink>
              </div>
            }
          />
        }
        header={
          <AppHeader
            sidebarTrigger
            className="kumo-topbar"
            classNames={{ center: "gap-2", end: "gap-1" }}
            actions={
              <>
                <ActionMenu
                  align="end"
                  trigger={
                    <Button variant="outline" size="sm" startIcon="add" className="kumo-add">
                      <span className="sm:not-sr-only sr-only">{tr("Add", "އިތުރުކުރޭ")}</span>
                    </Button>
                  }
                  items={[
                    {
                      id: "app",
                      label: tr("Application", "އެޕްލިކޭޝަން"),
                      icon: "file-text",
                      href: routes.adminRecords.create,
                    },
                    { id: "member", label: tr("Member", "މެންބަރެއް"), icon: "user" },
                    { id: "import", label: tr("Import records", "ރެކޯޑް އިމްޕޯޓް"), icon: "upload" },
                  ]}
                />
                <Button variant="ghost" size="sm" startIcon="help" className="lg:inline-flex hidden">
                  {tr("Support", "އެހީ")}
                </Button>
                <NotificationCenter
                  now={KUMO_NOW}
                  notifications={[
                    {
                      id: "1",
                      title: tr("APP-1042 was assigned to you", "APP-1042 ތިބާއާ ޙަވާލުކުރެވިއްޖެ"),
                      time: minutesAgo(12),
                    },
                    {
                      id: "2",
                      title: tr("Weekly usage report is ready", "ހަފްތާގެ ރިޕޯޓް ތައްޔާރު"),
                      time: minutesAgo(180),
                    },
                    {
                      id: "3",
                      title: tr("Scheduled maintenance on Sunday", "އާދިއްތަ ދުވަހު މެއިންޓެނެންސް"),
                      time: minutesAgo(1560),
                      read: true,
                    },
                  ]}
                  onMarkRead={() => {}}
                />
                <Language />
                <ThemeToggle />
                <ConditionalLink
                  href={routes.adminSettings.userProfile}
                  className="kumo-avatar-link"
                  aria-label={tr("Your profile: Aishath Shifa", "ޕްރޮފައިލް: އައިޝަތު ޝިފާ")}
                >
                  <KumoAvatar name={tr("Aishath Shifa", "އައިޝަތު ޝިފާ")} size="xs" decorative />
                </ConditionalLink>
              </>
            }
          >
            <div className="kumo-goto">
              <SearchBox
                landmark
                className="w-full"
                placeholder={tr("Go to…", "ދާނީ…")}
                classNames={{ input: "kumo-goto__input" }}
              />
              <kbd aria-hidden className="kumo-kbd kumo-goto__kbd">
                ⌘K
              </kbd>
            </div>
          </AppHeader>
        }
      >
        {children}
      </AppLayout>
    </div>
  )
}
