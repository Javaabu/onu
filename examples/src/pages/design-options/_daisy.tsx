import * as React from "react"
import {
  AppHeader,
  AppLayout,
  AppSidebar,
  KeyboardKey,
  LanguageSwitcher,
  Logo,
  NotificationCenter,
  SearchBox,
  ThemeToggle,
  UserProfile,
  cn,
  useTheme,
  type NavGroup,
} from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import "./daisy.css"

export const DY_ROUTES = {
  index: "/pages/design-options/daisy-index",
  dashboard: "/pages/design-options/daisy-dashboard",
}

/** Fixed demo clock, so pages and screenshots are stable. */
export const DY_NOW = new Date("2026-10-08T10:30:00+05:00")
export const minutesAgo = (m: number) => new Date(DY_NOW.getTime() - m * 60_000)

/**
 * Root of a Daisy page: the scoped theme (base-100/200/300 surfaces and the
 * primary / secondary / accent / neutral roles, all derived from --primary).
 * Portaled surfaces (the phone drawer, menus, popovers) live outside the root,
 * so <body> carries the same scope while a Daisy page is mounted.
 */
export function DaisyRoot({ className, children }: { className?: string; children: React.ReactNode }) {
  React.useEffect(() => {
    const body = document.body
    body.classList.add("dy-portal")
    body.setAttribute("data-onu-theme", "")
    return () => {
      body.classList.remove("dy-portal")
      body.removeAttribute("data-onu-theme")
    }
  }, [])
  return (
    <div data-onu-theme className={cn("design-daisy", className)}>
      {children}
    </div>
  )
}

/** The "Raajje Desk" mark: a chunky flower of four petals in the role colours. */
export function DaisyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="10" className="dy-fill-neutral" />
      <circle cx="16" cy="10.5" r="5" className="dy-fill-primary" />
      <circle cx="21.5" cy="16" r="5" className="dy-fill-secondary" />
      <circle cx="16" cy="21.5" r="5" className="dy-fill-accent" />
      <circle cx="10.5" cy="16" r="5" className="dy-fill-info" />
      <circle cx="16" cy="16" r="3.2" className="dy-fill-base" />
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

/**
 * A daisyUI-style theme controller: the swatches and name of the active preset
 * ("cupcake" light, "night" dark) next to Onu's own ThemeToggle, which does the
 * switching (and persists and announces it).
 */
export function DaisyThemeSwitch() {
  const tr = useTr()
  const { resolvedTheme } = useTheme()
  const night = resolvedTheme === "dark"
  return (
    <div className="dy-theme gap-2 ps-2 sm:flex hidden items-center" data-preset={night ? "night" : "cupcake"}>
      <span aria-hidden className="dy-theme__swatch">
        <span className="dy-bg-primary" />
        <span className="dy-bg-secondary" />
        <span className="dy-bg-accent" />
        <span className="dy-bg-neutral" />
      </span>
      <span className="text-xs font-semibold lg:inline hidden">
        {night ? tr("night", "ރޭގަނޑު") : tr("cupcake", "ކަޕްކޭކް")}
      </span>
      <ThemeToggle variant="segmented" showSystem={false} size="sm" />
    </div>
  )
}

function nav(tr: ReturnType<typeof useTr>): NavGroup[] {
  return [
    {
      items: [
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: DY_ROUTES.dashboard, icon: "home" },
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: DY_ROUTES.index, icon: "file-text", badge: 12 },
        { label: tr("Inspections", "ޗެކްކުރުން"), href: routes.adminRecords.indexKanban, icon: "calendar" },
        { label: tr("Payments", "ފައިސާ"), href: routes.adminRecords.export, icon: "credit-card" },
        { label: tr("Citizens", "ރައްޔިތުން"), href: routes.adminSettings.users, icon: "users" },
      ],
    },
    {
      label: tr("Workspace", "ވޯކްސްޕޭސް"),
      items: [
        { label: tr("Reports", "ރިޕޯޓް"), href: routes.adminRecords.export, icon: "file-spreadsheet" },
        { label: tr("Activity log", "އެކްޓިވިޓީ ލޮގް"), href: routes.adminRecords.activityLog, icon: "history" },
        { label: tr("Settings", "ސެޓިންގްސް"), href: routes.adminSettings.settings, icon: "settings" },
      ],
    },
  ]
}

/** The Daisy app shell: a "menu" sidebar (a drawer on phones) and a floating navbar. */
export function DaisyShell({ current, children }: { current: string; children: React.ReactNode }) {
  const tr = useTr()
  const dv = useDv()
  return (
    <DaisyRoot>
      <AppLayout
        contentWidth="wide"
        classNames={{ main: "md:px-6 lg:px-8 md:py-6" }}
        sidebar={
          <AppSidebar
            collapsible="icon"
            groups={nav(tr)}
            currentHref={current}
            header={
              <Logo
                alt="Raajje Desk"
                href={DY_ROUTES.dashboard}
                text={<span className="dy-brand">{tr("Raajje Desk", "ރާއްޖެ ޑެސްކް")}</span>}
              >
                <DaisyMark />
              </Logo>
            }
            footer={
              <div className="gap-3 grid">
                <div className="dy-promo p-3 gap-2 grid group-data-[collapsible=icon]:hidden">
                  <p className="text-sm font-semibold">{tr("Monthly target", "މަހުގެ ލަނޑުދަނޑި")}</p>
                  <div className="dy-meter" role="presentation">
                    <span style={{ inlineSize: "72%" }} />
                  </div>
                  <p className="text-xs">
                    {tr("1,080 of 1,500 applications closed", "1,500 އިން 1,080 އެޕްލިކޭޝަން ނިމިއްޖެ")}
                  </p>
                </div>
                <UserProfile
                  name={tr("Aishath Shifa", "އައިޝަތު ޝިފާ")}
                  subtitle={tr("Case officer", "ކޭސް އޮފިސަރ")}
                  profileHref={routes.adminSettings.userProfile}
                  settingsHref={routes.adminSettings.settings}
                  onSignOut={() => {}}
                  side="top"
                />
              </div>
            }
          />
        }
        header={
          <AppHeader
            sidebarTrigger
            actions={
              <>
                <DaisyThemeSwitch />
                <Language />
                <NotificationCenter
                  now={DY_NOW}
                  notifications={[
                    {
                      id: "1",
                      title: tr("3 applications waiting over 7 days", "7 ދުވަހަށްވުރެ ގިނައިރު 3 އެޕްލިކޭޝަން"),
                      description: tr("Building permits · Addu City", "ބިނާކުރުމުގެ ހުއްދަ · އައްޑޫ ސިޓީ"),
                      time: minutesAgo(8),
                      variant: "warning",
                    },
                    {
                      id: "2",
                      title: tr("Payment received: MVR 2,500.00", "ފައިސާ ލިބިއްޖެ: ރ. 2,500.00"),
                      time: minutesAgo(42),
                      variant: "success",
                    },
                    {
                      id: "3",
                      title: tr("Ibrahim Nazeer assigned you a case", "އިބްރާހީމް ނަޒީރު ކޭހެއް ޙަވާލުކުރެއްވި"),
                      time: minutesAgo(150),
                      variant: "info",
                      read: true,
                    },
                  ]}
                  onMarkRead={() => {}}
                />
              </>
            }
          >
            <div className="max-w-md gap-2 flex w-full items-center">
              <SearchBox
                aria-label={tr("Search applications and citizens", "އެޕްލިކޭޝަން އަދި ރައްޔިތުން ހޯއްދަވާ")}
                placeholder={tr("Search…", "ހޯއްދަވާ…")}
                thaana={dv}
                landmark
                className="flex-1"
              />
              <KeyboardKey keys="mod+k" platform="mac" className="lg:inline-flex hidden" />
            </div>
          </AppHeader>
        }
      >
        {children}
      </AppLayout>
    </DaisyRoot>
  )
}

/** daisyUI "radial-progress": a chunky ring with the value in the middle. */
export function RadialProgress({
  value,
  label,
  tone = "primary",
  size = "6rem",
  children,
}: {
  value: number
  label: string
  tone?: "primary" | "secondary" | "accent" | "success" | "warning" | "info" | "error"
  size?: string
  children?: React.ReactNode
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="dy-radial"
      data-tone={tone}
      style={{ "--value": value, "--size": size } as React.CSSProperties}
    >
      <span className="dy-radial__value" dir="ltr">
        {children ?? `${value}%`}
      </span>
    </div>
  )
}

export interface Step {
  label: string
  count?: React.ReactNode
  done?: boolean
  current?: boolean
}

/** daisyUI "steps": numbered circles joined by a bar; done steps fill with the primary colour. */
export function Steps({ steps, label }: { steps: Step[]; label: string }) {
  return (
    <ol className="dy-steps" aria-label={label}>
      {steps.map((s, i) => (
        <li key={s.label} data-done={s.done || undefined} aria-current={s.current ? "step" : undefined}>
          <span className="dy-steps__dot" aria-hidden>
            {s.done ? "✓" : i + 1}
          </span>
          <span className="dy-steps__label">{s.label}</span>
          {s.count !== undefined ? <span className="dy-steps__count">{s.count}</span> : null}
        </li>
      ))}
    </ol>
  )
}
