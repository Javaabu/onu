import * as React from "react"
import { useLocation } from "react-router"
import {
  AppHeader,
  AppLayout,
  AppSidebar,
  Breadcrumbs,
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
  type BreadcrumbsItem,
  type NavGroup,
} from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"

import "./ant.css"

export const ANT_ROUTES = {
  index: "/pages/design-options/ant-index",
  dashboard: "/pages/design-options/ant-dashboard",
}

// Fixed demo time for notifications (computed once, not during render).
const NOW = Date.now()

/**
 * Portalled overlays (menus, popovers, the phone drawer) render under <body>,
 * outside `.design-ant`. While a page of this option is mounted, <body> gets a
 * scoping class and `data-onu-theme` so they pick up the same tokens.
 */
function useBodyScope() {
  React.useEffect(() => {
    const body = document.body
    const hadTheme = body.hasAttribute("data-onu-theme")
    body.classList.add("design-ant-portal")
    if (!hadTheme) body.setAttribute("data-onu-theme", "")
    return () => {
      body.classList.remove("design-ant-portal")
      if (!hadTheme) body.removeAttribute("data-onu-theme")
    }
  }, [])
}

/** Ant's trend text: a coloured caret and a percentage, red for up and green for down (Ant Pro's convention). */
export function Trend({ label, value, flip = false }: { label?: string; value: number; flip?: boolean }) {
  const up = value >= 0
  // Ant Design Pro colours "up" red and "down" green; `flip` swaps that for metrics where down is bad.
  const bad = flip ? !up : up
  return (
    <span className="ant-trend">
      {label ? <span className="ant-trend__label">{label}</span> : null}
      <span className="tabular-nums" dir="ltr">
        {Math.abs(value)}%
      </span>
      <span aria-hidden className={cn("ant-trend__caret", up ? "is-up" : "is-down", bad ? "is-red" : "is-green")} />
      <span className="sr-only">{up ? "▲" : "▼"}</span>
    </span>
  )
}

/** The Ant Design mark: a blue diamond of stacked rhombi. */
export function AntMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={cn("ant-mark", className)}>
      <path d="M16 2 30 16 16 30 2 16Z" fill="currentColor" opacity=".35" />
      <path d="M16 7 25 16 16 25 7 16Z" fill="currentColor" opacity=".7" />
      <path d="M16 12 20 16 16 20 12 16Z" fill="currentColor" />
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

function nav(tr: ReturnType<typeof useTr>): NavGroup[] {
  return [
    {
      items: [
        {
          label: tr("Dashboard", "ޑޭޝްބޯޑް"),
          icon: "home",
          items: [
            { label: tr("Analysis", "އެނަލިސިސް"), href: ANT_ROUTES.dashboard },
            { label: tr("Workplace", "ވޯކްޕްލޭސް"), href: routes.adminRecords.dashboard },
          ],
        },
        {
          label: tr("Applications", "އެޕްލިކޭޝަންތައް"),
          icon: "file-text",
          items: [
            { label: tr("Application list", "އެޕްލިކޭޝަން ލިސްޓު"), href: ANT_ROUTES.index, badge: 12 },
            { label: tr("New application", "އައު އެޕްލިކޭޝަން"), href: routes.adminRecords.create },
            { label: tr("Board", "ބޯޑް"), href: routes.adminRecords.indexKanban },
          ],
        },
        { label: tr("Activity log", "އެކްޓިވިޓީ ލޮގް"), href: routes.adminRecords.activityLog, icon: "history" },
        { label: tr("Payments", "ފައިސާ"), href: routes.adminRecords.export, icon: "credit-card" },
        { label: tr("Users", "މެމްބަރުން"), href: routes.adminSettings.users, icon: "users" },
        { label: tr("Roles", "ރޯލްތައް"), href: routes.adminSettings.roles, icon: "lock" },
        { label: tr("Settings", "ސެޓިންގްސް"), href: routes.adminSettings.settings, icon: "settings" },
      ],
    },
  ]
}

export interface AntShellProps {
  /** Breadcrumb trail above the title (the last item is the current page). */
  breadcrumbs: BreadcrumbsItem[]
  /** Page title (the page's h1). */
  title: React.ReactNode
  /** Grey sub-title next to the title. */
  subTitle?: React.ReactNode
  /** Tags after the title. */
  tags?: React.ReactNode
  /** Buttons at the end of the title row. */
  extra?: React.ReactNode
  /** Content under the title (description, key figures). */
  content?: React.ReactNode
  /** A tab bar at the bottom of the page header. */
  footer?: React.ReactNode
  children: React.ReactNode
}

/**
 * The Ant Design Pro shell: a dark #001529 side menu (40px items, the selected
 * one filled with primary, inline submenus on a darker background), a white
 * 56px header with actions, and a white PageHeader band (breadcrumb, title,
 * tags, extra buttons, tabs) above the grey `colorBgLayout` content.
 */
export function AntShell({ breadcrumbs, title, subTitle, tags, extra, content, footer, children }: AntShellProps) {
  const tr = useTr()
  const current = useLocation().pathname
  useBodyScope()

  return (
    <div className="design-ant" data-onu-theme="">
      <AppLayout
        contentWidth="full"
        classNames={{ main: "p-0! pb-8!", content: "max-w-none" }}
        sidebar={
          <AppSidebar
            groups={nav(tr)}
            currentHref={current}
            match="exact"
            navLabel={tr("Main menu", "މައި މެނޫ")}
            classNames={{ content: "ant-sider__menu", header: "ant-sider__logo" }}
            header={
              <Logo
                alt="Atoll Pro"
                href={ANT_ROUTES.dashboard}
                text={<span className="ant-sider__title">{tr("Atoll Pro", "އެޓޮލް ޕްރޯ")}</span>}
                classNames={{ link: "ant-sider__brand" }}
              >
                <AntMark />
              </Logo>
            }
          />
        }
        header={
          <AppHeader
            sidebarTrigger
            className="ant-header"
            classNames={{ center: "gap-2" }}
            actions={
              <div className="ant-header__actions">
                <div className="me-1 lg:block w-52 hidden">
                  <SearchBox landmark placeholder={tr("Search the site", "ސައިޓް ހޯދާ")} />
                </div>
                <LinkButton
                  href="/"
                  variant="ghost"
                  size="icon"
                  aria-label={tr("Documentation", "ޑޮކިއުމެންޓޭޝަން")}
                  className="sm:inline-flex hidden"
                >
                  <Icon name="help" />
                </LinkButton>
                <NotificationCenter
                  notifications={[
                    {
                      id: "1",
                      title: tr("New application from Hulhumalé", "ހުޅުމާލެއިން އައު އެޕްލިކޭޝަނެއް"),
                      time: new Date(NOW - 1000 * 60 * 12),
                      variant: "info",
                    },
                    {
                      id: "2",
                      title: tr("Payment received: MVR 2,500.00", "ފައިސާ ލިބިއްޖެ: ރ. 2,500.00"),
                      time: new Date(NOW - 1000 * 60 * 60 * 3),
                      variant: "success",
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
                <Language />
                <ThemeToggle />
                <ConditionalLink
                  href={routes.adminSettings.userProfile}
                  className="ant-header__user"
                  aria-label={tr("Your profile: Aishath Shifa", "ޕްރޮފައިލް: އައިޝަތު ޝިފާ")}
                >
                  <UserAvatar
                    name={tr("Aishath Shifa", "އައިޝަތު ޝިފާ")}
                    size="sm"
                    decorative
                    classNames={{ fallback: "ant-avatar" }}
                  />
                  <span className="md:inline hidden">{tr("Aishath Shifa", "އައިޝަތު ޝިފާ")}</span>
                </ConditionalLink>
              </div>
            }
          />
        }
      >
        <div className="ant-page-header" data-has-footer={footer ? "" : undefined}>
          <Breadcrumbs items={breadcrumbs} className="ant-breadcrumb" />
          <div className="ant-page-header__heading">
            <div className="ant-page-header__left">
              <h1 className="ant-page-header__title">{title}</h1>
              {subTitle ? <span className="ant-page-header__sub">{subTitle}</span> : null}
              {tags}
            </div>
            {extra ? <div className="ant-page-header__extra">{extra}</div> : null}
          </div>
          {content ? <div className="ant-page-header__content">{content}</div> : null}
          {footer ? <div className="ant-page-header__footer">{footer}</div> : null}
        </div>
        <div className="ant-page-body">{children}</div>
      </AppLayout>
    </div>
  )
}
