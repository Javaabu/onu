import type { Builder, Color } from "../core"
import type { KitComponent } from "../components"
import { DIRS, tr } from "./shared"

export const tab: KitComponent = {
  name: "Tabs / Tab",
  page: "Navigation",
  description: 'One trigger of <Tabs items variant> (TabItem: label, icon, count, disabled) from "@javaabu/onu".',
  variants: { variant: ["default", "line"], state: ["inactive", "active", "hover", "disabled"], dir: DIRS },
  filter: (v) => v.dir === "ltr" || v.state !== "hover",
  props: {
    label: { type: "TEXT", default: "Overview" },
    icon: { type: "BOOLEAN", default: false },
    "icon glyph": { type: "INSTANCE_SWAP", default: "layout-dashboard" },
    count: { type: "BOOLEAN", default: false },
  },
  width: 1000,
  build(root, v, b) {
    const active = v.state === "active"
    const line = v.variant === "line"
    const text: Color = active
      ? line
        ? "primary"
        : "foreground"
      : v.state === "hover"
        ? "foreground"
        : "muted-foreground"
    b.style(root, {
      h: line ? 10 : 7,
      px: line ? 0 : 3,
      gap: 1.5,
      align: "center",
      cross: "center",
      radius: line ? undefined : "md",
      fill: !line && active ? "background" : undefined,
      shadow: !line && active ? "sm" : undefined,
      stroke: line && active ? "primary" : undefined,
      strokeWidth: 2,
      sides: line && active ? ["bottom"] : undefined,
      opacity: v.state === "disabled" ? 0.5 : undefined,
    })
    b.add(root, [
      b.icon("layout-dashboard", { color: text, prop: "icon glyph", visibleProp: "icon", visible: false }),
      b.text(tr(b, "Overview", "ޚުލާޞާ"), { prop: "label", weight: active ? "Medium" : "Regular", color: text }),
      b.toggled(
        b.row("count", { h: 5, px: 1.5, radius: "full", fill: "secondary", cross: "center" }, [
          b.text("12", { size: "xs", color: "muted-foreground", script: "UI" }),
        ]),
        "count",
        false,
      ),
    ])
  },
}

export const tabs: KitComponent = {
  name: "Tabs",
  page: "Navigation",
  key: "layout-and-navigation/tabs",
  description: '<Tabs items variant defaultValue /> from "@javaabu/onu". Each tab is a "Tabs / Tab" instance.',
  variants: { variant: ["default", "line"], dir: DIRS },
  width: 1000,
  build(root, v, b) {
    const line = v.variant === "line"
    b.style(root, {
      h: line ? undefined : 8,
      p: line ? undefined : 0.75,
      gap: line ? 8 : 0,
      cross: "center",
      radius: line ? undefined : "lg",
      fill: line ? undefined : "muted",
      stroke: line ? "border" : undefined,
      sides: line ? ["bottom"] : undefined,
    })
    const labels = [
      [tr(b, "Overview", "ޚުލާޞާ"), "active"],
      [tr(b, "Activity", "ހަރަކާތްތައް"), "inactive"],
      [tr(b, "Settings", "ސެޓިންގްސް"), "inactive"],
    ]
    b.add(
      root,
      labels.map(([label, state]) => b.instance("Tabs / Tab", { variant: v.variant!, state: state!, label: label! })),
    )
  },
}

export const breadcrumbs: KitComponent = {
  name: "Breadcrumbs",
  page: "Navigation",
  key: "layout-and-navigation/breadcrumbs",
  description: '<Breadcrumbs items maxItems separator /> from "@javaabu/onu". The last item is the current page.',
  variants: { dir: DIRS },
  props: { current: { type: "TEXT", default: "Ahmed Mohamed" } },
  width: 900,
  build(root, _v, b) {
    b.style(root, { gap: 1.5, cross: "center" })
    const sep = () => b.icon("chevron-right", { size: 14, color: "muted-foreground", layer: "separator" })
    b.add(root, [
      b.text(tr(b, "Home", "ހޯމް"), { color: "muted-foreground", name: "item" }),
      sep(),
      b.text(tr(b, "Users", "ޔޫޒަރުން"), { color: "muted-foreground", name: "item" }),
      sep(),
      b.text(tr(b, "Ahmed Mohamed", "އަޙްމަދު މުޙައްމަދު"), { prop: "current", name: "page" }),
    ])
  },
}

function pageButton(b: Builder, label: string, active: boolean, small: boolean) {
  return b.row(
    "page",
    {
      h: small ? 6 : 8,
      w: small ? 6 : 8,
      align: "center",
      cross: "center",
      radius: small ? "sm" : "lg",
      fill: "card",
      stroke: active ? "primary" : undefined,
    },
    [b.text(label, { size: small ? "xs" : "sm", color: active ? "primary" : "foreground", script: "UI" })],
  )
}

export const pagination: KitComponent = {
  name: "Pagination",
  page: "Navigation",
  key: "listing-pages/pagination",
  description:
    '<Pagination page perPage total numbered showSummary onPageChange /> from "@javaabu/onu" (or paginator={laravelPaginator}).',
  variants: { size: ["default", "sm"], dir: DIRS },
  props: {
    summary: { type: "TEXT", default: "Showing 1–10 of 97" },
    numbered: { type: "BOOLEAN", default: true },
    showSummary: { type: "BOOLEAN", default: true },
  },
  width: 1500,
  build(root, v, b) {
    const small = v.size === "sm"
    b.style(root, { wPx: 640, align: "between", cross: "center", gap: 4 })
    const nav = (icon: string) =>
      b.instance("IconButton", {
        variant: "outline",
        size: small ? "icon-xs" : "icon",
        "startIcon glyph": b.iconId(icon),
      })
    // Prev/next point along the reading direction, so the glyphs mirror in RTL.
    const prev = b.rtl ? "chevron-right" : "chevron-left"
    const next = b.rtl ? "chevron-left" : "chevron-right"
    const pages = b.row("pages", { gap: 1, cross: "center" }, [
      pageButton(b, "1", true, small),
      pageButton(b, "2", false, small),
      pageButton(b, "3", false, small),
      b.text("…", { color: "muted-foreground", script: "UI" }),
      pageButton(b, "10", false, small),
    ])
    b.toggled(pages, "numbered", true)
    b.add(root, [
      b.toggled(
        b.text(tr(b, "Showing 1–10 of 97", "97 ން 1–10 ދައްކަނީ"), {
          prop: "summary",
          size: small ? "xs" : "sm",
          color: "muted-foreground",
        }),
        "showSummary",
        true,
      ),
      b.row("controls", { gap: 2, cross: "center" }, [nav(prev), pages, nav(next)]),
    ])
  },
}

export const sidebarItem: KitComponent = {
  name: "AppSidebar / Item",
  page: "Navigation",
  description:
    'A NavItem in <AppSidebar items groups currentHref> (label, icon, badge, isActive, disabled) from "@javaabu/onu".',
  variants: { state: ["default", "hover", "active", "disabled"], dir: DIRS },
  props: {
    label: { type: "TEXT", default: "Dashboard" },
    "icon glyph": { type: "INSTANCE_SWAP", default: "layout-dashboard" },
    badge: { type: "BOOLEAN", default: false },
    badgeText: { type: "TEXT", default: "3" },
  },
  width: 700,
  build(root, v, b) {
    const active = v.state === "active"
    const text: Color = active ? "sidebar-accent-foreground" : "sidebar-foreground"
    b.style(root, {
      wPx: 232,
      h: 8,
      px: 2,
      gap: 2,
      cross: "center",
      radius: "md",
      fill: active || v.state === "hover" ? "sidebar-accent" : undefined,
      opacity: v.state === "disabled" ? 0.5 : undefined,
    })
    b.add(root, [
      b.icon("layout-dashboard", { color: active ? "primary" : text, prop: "icon glyph" }),
      b.text(tr(b, "Dashboard", "ޑޭޝްބޯޑް"), {
        prop: "label",
        weight: active ? "Medium" : "Regular",
        color: text,
        fillW: true,
      }),
      b.toggled(
        b.row("badge", { h: 5, px: 1.5, radius: "full", fill: "primary", cross: "center" }, [
          b.text("3", { prop: "badgeText", size: "xs", color: "primary-foreground", script: "UI" }),
        ]),
        "badge",
        false,
      ),
    ])
  },
}

const NAV = [
  { icon: "layout-dashboard", en: "Dashboard", dv: "ޑޭޝްބޯޑް", state: "active" },
  { icon: "inbox", en: "Applications", dv: "އެޕްލިކޭޝަންތައް", badge: "12" },
  { icon: "users", en: "Users", dv: "ޔޫޒަރުން" },
  { icon: "chart-column", en: "Reports", dv: "ރިޕޯޓުތައް" },
  { icon: "settings", en: "Settings", dv: "ސެޓިންގްސް" },
]

export function logo(b: Builder) {
  return b.row("logo", { gap: 2, cross: "center" }, [
    b.frame("mark", { hPx: 24, wPx: 24, radius: "md", fill: "primary", align: "center", cross: "center" }, [
      b.text("O", { size: "xs", weight: "Bold", color: "primary-foreground", script: "UI" }),
    ]),
    b.text("Onu", { size: "base", weight: "Semibold", script: "UI" }),
  ])
}

export const appSidebar: KitComponent = {
  name: "AppSidebar",
  page: "Navigation",
  key: "layout-and-navigation/app-sidebar",
  description:
    '<AppSidebar items groups currentHref header action footer surface /> from "@javaabu/onu". Items are "AppSidebar / Item" instances.',
  variants: { surface: ["sidebar", "shell"], dir: DIRS },
  props: { action: { type: "BOOLEAN", default: true }, footer: { type: "BOOLEAN", default: true } },
  width: 1200,
  build(root, v, b) {
    const surface: Color = v.surface === "shell" ? "shell" : "sidebar"
    b.style(root, {
      dir: "V",
      wPx: 256,
      hPx: 720,
      p: 3,
      gap: 4,
      fill: surface,
      stroke: v.surface === "shell" ? undefined : "sidebar-border",
      sides: ["end"],
    })
    const items = NAV.map((item) =>
      b.instance("AppSidebar / Item", {
        state: item.state ?? "default",
        label: tr(b, item.en, item.dv),
        "icon glyph": b.iconId(item.icon),
        badge: Boolean(item.badge),
        ...(item.badge ? { badgeText: item.badge } : {}),
      }),
    )
    const group = b.col("group", { gap: 0.5, fillW: true }, [
      b.row("group-label", { px: 2, h: 8, cross: "center", fillW: true }, [
        b.text(tr(b, "Main", "މައިގަނޑު"), { size: "xs", weight: "Medium", color: "muted-foreground" }),
      ]),
      ...items,
    ])
    items.forEach((i) => (i.layoutSizingHorizontal = "FILL"))
    const action = b.toggled(
      b.instance("Button", { children: tr(b, "New application", "އައު އެޕްލިކޭޝަން"), startIcon: true }),
      "action",
      true,
    )
    const footer = b.toggled(
      b.row("footer", { gap: 2, cross: "center", p: 2, fillW: true }, [
        b.instance("Avatar", { size: "sm" }),
        b.col("user", { gap: 0 }, [
          b.text(tr(b, "Aishath Ali", "އައިޝަތު ޢަލީ"), { weight: "Medium" }),
          b.text("aishath@example.mv", { size: "xs", color: "muted-foreground", script: "UI" }),
        ]),
      ]),
      "footer",
      true,
    )
    const spacer = b.frame("spacer", { grow: true })
    b.add(root, [
      b.row("header", { px: 2, h: 8, cross: "center", fillW: true }, [logo(b)]),
      action,
      group,
      spacer,
      footer,
    ])
    action.layoutSizingHorizontal = "FILL"
  },
}

export const appHeader: KitComponent = {
  name: "AppHeader",
  page: "Navigation",
  key: "layout-and-navigation/app-header",
  description: '<AppHeader logo actions variant sidebarTrigger sticky>{search}</AppHeader> from "@javaabu/onu".',
  variants: { variant: ["default", "plain", "shell", "primary"], dir: DIRS },
  props: { sidebarTrigger: { type: "BOOLEAN", default: true }, search: { type: "BOOLEAN", default: true } },
  width: 1100,
  build(root, v, b) {
    const primary = v.variant === "primary"
    const fg: Color = primary ? "primary-foreground" : v.variant === "shell" ? "shell-foreground" : "foreground"
    b.style(root, {
      wPx: 1024,
      hPx: 56,
      px: 4,
      gap: 2,
      cross: "center",
      fill: primary ? "primary" : v.variant === "shell" ? "shell" : "background",
      stroke: v.variant === "default" ? "border" : undefined,
      sides: ["bottom"],
    })
    const trigger = b.toggled(
      b.instance("IconButton", { variant: "ghost", size: "icon", "startIcon glyph": b.iconId("panel-left") }),
      "sidebarTrigger",
      true,
    )
    const search = b.toggled(
      b.row(
        "search",
        {
          wPx: 320,
          h: 8,
          px: 2.5,
          gap: 2,
          cross: "center",
          radius: "lg",
          fill: v.variant === "shell" ? "shell-field" : "card",
          stroke: primary ? undefined : "input",
        },
        [
          b.icon("search", { color: "muted-foreground" }),
          b.text(tr(b, "Search…", "ހޯދާ…"), { color: "muted-foreground" }),
        ],
      ),
      "search",
      true,
    )
    const bell = b.instance("IconButton", { variant: "ghost", size: "icon", "startIcon glyph": b.iconId("bell") })
    if (primary || v.variant === "shell") for (const i of [trigger, bell]) b.recolor(i, fg)
    b.add(root, [
      trigger,
      b.text(tr(b, "Dashboard", "ޑޭޝްބޯޑް"), { size: "base", weight: "Semibold", color: fg }),
      b.frame("spacer", { grow: true }),
      search,
      bell,
      b.instance("Avatar", { size: "sm" }),
    ])
  },
}

export const NAVIGATION = [tab, tabs, breadcrumbs, pagination, sidebarItem, appSidebar, appHeader]
