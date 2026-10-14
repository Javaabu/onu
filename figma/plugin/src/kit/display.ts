import type { Color } from "../core"
import type { KitComponent } from "../components"
import { DIRS, tr } from "./shared"

const BADGE_LOOK: Record<
  string,
  { fill?: Color; fillOpacity?: number; stroke?: Color; text: Color; underline?: boolean }
> = {
  default: { fill: "primary", text: "primary-foreground" },
  secondary: { fill: "secondary", text: "secondary-foreground" },
  destructive: { fill: "destructive", fillOpacity: 0.1, text: "destructive" },
  outline: { stroke: "border", text: "foreground" },
  ghost: { text: "foreground" },
  link: { text: "primary", underline: true },
}

export const badge: KitComponent = {
  name: "Badge",
  page: "Display",
  key: "primitives/badge",
  description: '<Badge variant> from "@javaabu/onu" (shadcn primitive; for statuses use StatusBadge, for labels Tag).',
  variants: { variant: Object.keys(BADGE_LOOK) },
  props: { children: { type: "TEXT", default: "Badge" } },
  width: 800,
  build(root, v, b) {
    const look = BADGE_LOOK[v.variant!]!
    b.style(root, {
      h: 5,
      px: 2,
      gap: 1,
      align: "center",
      cross: "center",
      radius: "4xl",
      fill: look.fill,
      fillOpacity: look.fillOpacity,
      stroke: look.stroke,
    })
    b.add(root, [
      b.text("Badge", { prop: "children", size: "xs", weight: "Medium", color: look.text, underline: look.underline }),
    ])
  },
}

const TAG_VARIANT: Record<string, { fill: Color; stroke: Color; text: Color }> = {
  default: { fill: "muted", stroke: "input", text: "foreground" },
  primary: { fill: "primary-1", stroke: "primary-3", text: "primary-8" },
  outline: { fill: "card", stroke: "input", text: "foreground" },
}
const preset = (c: string) => ({ fill: `preset-${c}`, stroke: `preset-${c}-border`, text: `preset-${c}-foreground` })
const TAG_SIZE: Record<string, { h: number; px: number; text: "xs" | "sm"; icon: number }> = {
  sm: { h: 5, px: 1.5, text: "xs", icon: 12 },
  md: { h: 5.5, px: 1.75, text: "xs", icon: 12 },
  lg: { h: 7, px: 2.5, text: "sm", icon: 14 },
}

export const tag: KitComponent = {
  name: "Tag",
  page: "Display",
  key: "display-and-feedback/tag",
  description:
    '<Tag variant color size icon onRemove> from "@javaabu/onu". color=none means no preset colour (the variant applies); removable shows the × (onRemove).',
  variants: {
    variant: ["default", "primary", "outline"],
    color: ["none", "blue", "cyan", "green", "red", "gold"],
    size: ["md", "sm", "lg"],
    dir: DIRS,
  },
  filter: (v) =>
    (v.color === "none" || v.variant === "default") &&
    (v.size === "md" || (v.color === "none" && v.dir === "ltr")) &&
    (v.dir === "ltr" || v.color === "none"),
  props: {
    children: { type: "TEXT", default: "Tag" },
    icon: { type: "BOOLEAN", default: false },
    "icon glyph": { type: "INSTANCE_SWAP", default: "circle-check" },
    removable: { type: "BOOLEAN", default: false },
  },
  width: 1200,
  build(root, v, b) {
    const look = v.color === "none" ? TAG_VARIANT[v.variant!]! : preset(v.color!)
    const size = TAG_SIZE[v.size!]!
    b.style(root, {
      h: size.h,
      px: size.px,
      gap: 1,
      cross: "center",
      radius: "sm",
      fill: look.fill,
      stroke: look.stroke,
    })
    b.add(root, [
      b.icon("circle-check", {
        size: size.icon,
        color: look.text,
        prop: "icon glyph",
        visibleProp: "icon",
        visible: false,
      }),
      b.text(tr(b, "Tag", "ޓެގް"), { name: "children", size: size.text, color: look.text }),
      b.icon("x", { size: size.icon, color: look.text, visibleProp: "removable", visible: false, layer: "remove" }),
    ])
  },
}

const STATUS: Record<string, { color: string; icon: string; label: string; dv: string }> = {
  neutral: { color: "", icon: "", label: "Draft", dv: "ޑްރާފްޓް" },
  info: { color: "blue", icon: "info", label: "In review", dv: "ރިވިއު ކުރަމުން" },
  success: { color: "green", icon: "circle-check", label: "Approved", dv: "ފާސްކުރެވިފަ" },
  warning: { color: "gold", icon: "triangle-alert", label: "Suspended", dv: "ހިފަހައްޓާފަ" },
  danger: { color: "red", icon: "circle-x", label: "Rejected", dv: "ރަދްދުކުރެވިފަ" },
  pending: { color: "cyan", icon: "circle-question-mark", label: "Pending", dv: "މަޑުކުރަމުން" },
}

export const statusBadge: KitComponent = {
  name: "StatusBadge",
  page: "Display",
  key: "display-and-feedback/status-badge",
  description: '<StatusBadge status size /> from "@javaabu/onu" (status is a tone or a key of statusMap).',
  variants: { status: Object.keys(STATUS), size: ["md", "sm", "lg"], dir: DIRS },
  filter: (v) => v.size === "md" || v.dir === "ltr",
  // No TEXT property: each status shows its own default label (edit the layer to override, like `children`).
  width: 1200,
  build(root, v, b) {
    const s = STATUS[v.status!]!
    const look = s.color ? preset(s.color) : TAG_VARIANT.default!
    const size = TAG_SIZE[v.size!]!
    b.style(root, {
      h: size.h,
      px: size.px,
      gap: 1,
      cross: "center",
      radius: "sm",
      fill: look.fill,
      stroke: look.stroke,
    })
    const lead = s.icon
      ? b.icon(s.icon, { size: size.icon, color: look.text })
      : b.ellipse("dot", { size: 8, fill: "muted-foreground" })
    b.add(root, [lead, b.text(tr(b, s.label, s.dv), { name: "children", size: size.text, color: look.text })])
  },
}

const CALLOUT: Record<
  string,
  { fill: Color; fillOpacity: number; stroke: Color; strokeOpacity: number; icon: string; tone: Color }
> = {
  default: { fill: "card", fillOpacity: 1, stroke: "border", strokeOpacity: 1, icon: "info", tone: "muted-foreground" },
  info: { fill: "info", fillOpacity: 0.05, stroke: "info", strokeOpacity: 0.3, icon: "info", tone: "info" },
  success: {
    fill: "success",
    fillOpacity: 0.05,
    stroke: "success",
    strokeOpacity: 0.3,
    icon: "circle-check",
    tone: "success",
  },
  warning: {
    fill: "warning",
    fillOpacity: 0.1,
    stroke: "warning",
    strokeOpacity: 0.4,
    icon: "triangle-alert",
    tone: "warning",
  },
  destructive: {
    fill: "destructive",
    fillOpacity: 0.05,
    stroke: "destructive",
    strokeOpacity: 0.3,
    icon: "circle-x",
    tone: "destructive",
  },
}

export const callout: KitComponent = {
  name: "Alert",
  page: "Display",
  key: "display-and-feedback/callout",
  description:
    '<Callout variant title description actions dismissible icon /> from "@javaabu/onu" (the Alert: shadcn Alert with Onu tones).',
  variants: { variant: Object.keys(CALLOUT), dir: DIRS },
  props: {
    title: { type: "TEXT", default: "Your application was received" },
    description: { type: "TEXT", default: "We will email you when it has been reviewed." },
    actions: { type: "BOOLEAN", default: false },
    dismissible: { type: "BOOLEAN", default: false },
  },
  width: 1100,
  build(root, v, b) {
    const look = CALLOUT[v.variant!]!
    b.style(root, {
      wPx: 480,
      px: 4,
      py: 3,
      gap: 2.5,
      radius: "lg",
      fill: look.fill,
      fillOpacity: look.fillOpacity,
      stroke: look.stroke,
      strokeOpacity: look.strokeOpacity,
    })
    const body = b.col("body", { gap: 1, grow: true }, [
      b.text(tr(b, "Your application was received", "ތިޔަ އެޕްލިކޭޝަން ލިބިއްޖެ"), {
        prop: "title",
        weight: "Medium",
        color: v.variant === "destructive" ? "destructive" : "foreground",
        fillW: true,
      }),
      b.text(tr(b, "We will email you when it has been reviewed.", "ރިވިއު ކުރެވުމުން އީމެއިލް ކުރެވޭނެ."), {
        prop: "description",
        color: "muted-foreground",
        fillW: true,
      }),
      b.toggled(
        b.row("actions", { gap: 2, pt: 1 }, [
          b.instance("Button", { variant: "outline", size: "sm", children: "View" }),
        ]),
        "actions",
        false,
      ),
    ])
    b.add(root, [
      b.icon(look.icon, { color: look.tone }),
      body,
      b.icon("x", { color: "muted-foreground", visibleProp: "dismissible", visible: false, layer: "dismiss" }),
    ])
  },
}

export const card: KitComponent = {
  name: "Card",
  page: "Display",
  key: "layout-and-navigation/card",
  description: '<Card variant size title description actions footer interactive> from "@javaabu/onu".',
  variants: { variant: ["default", "outline", "muted"], size: ["default", "sm"], dir: DIRS },
  filter: (v) => v.dir === "ltr" || (v.variant === "default" && v.size === "default"),
  props: {
    title: { type: "TEXT", default: "Card title" },
    description: { type: "TEXT", default: "A short description of the card." },
    actions: { type: "BOOLEAN", default: true },
    footer: { type: "BOOLEAN", default: true },
  },
  width: 1300,
  build(root, v, b) {
    const sm = v.size === "sm"
    b.style(root, {
      dir: "V",
      wPx: 360,
      py: sm ? 4 : 6,
      gap: sm ? 4 : 6,
      radius: "xl",
      fill: v.variant === "muted" ? "muted" : v.variant === "outline" ? undefined : "card",
      fillOpacity: v.variant === "muted" ? 0.5 : 1,
      stroke: v.variant === "muted" ? undefined : "border",
      clip: true,
    })
    const pad = sm ? 4 : 6
    const header = b.row("header", { px: pad, gap: 2, fillW: true }, [
      b.col("heading", { gap: 1, grow: true }, [
        b.text(tr(b, "Card title", "ކާޑުގެ ސުރުޚީ"), {
          prop: "title",
          size: sm ? "sm" : "base",
          weight: "Semibold",
          fillW: true,
        }),
        b.text(tr(b, "A short description of the card.", "ކާޑުގެ ކުރު ތަފްޞީލެއް."), {
          prop: "description",
          color: "muted-foreground",
          fillW: true,
        }),
      ]),
      b.toggled(
        b.instance("IconButton", { variant: "ghost", size: "icon-sm", "startIcon glyph": b.iconId("ellipsis") }),
        "actions",
        true,
      ),
    ])
    const content = b.col("content", { px: pad, fillW: true }, [
      b.frame("slot", { hPx: 96, fill: "muted", radius: "lg", fillW: true, align: "center", cross: "center" }, [
        b.text(tr(b, "Content", "ކޮންޓެންޓް"), { color: "muted-foreground" }),
      ]),
    ])
    const footer = b.toggled(
      b.row("footer", { px: pad, gap: 2, fillW: true }, [
        b.instance("Button", { children: tr(b, "Save", "ސޭވް ކުރޭ") }),
        b.instance("Button", { variant: "outline", children: tr(b, "Cancel", "ބާތިލް ކުރޭ") }),
      ]),
      "footer",
      true,
    )
    b.add(root, [header, content, footer])
  },
}

const AVATAR_SIZE: Record<string, { px: number; text: "xs" | "sm" | "base" | "lg" }> = {
  xs: { px: 24, text: "xs" },
  sm: { px: 32, text: "xs" },
  md: { px: 40, text: "sm" },
  lg: { px: 48, text: "base" },
  xl: { px: 64, text: "lg" },
}
const PRESENCE: Record<string, Color> = {
  online: "success",
  offline: "muted-foreground",
  busy: "destructive",
  away: "warning",
}

export const userAvatar: KitComponent = {
  name: "Avatar",
  page: "Display",
  key: "display-and-feedback/user-avatar",
  description:
    '<UserAvatar name src size shape status /> from "@javaabu/onu" (initials when there is no image). status=none: no presence dot.',
  variants: { size: Object.keys(AVATAR_SIZE), shape: ["circle", "square"], status: ["none", ...Object.keys(PRESENCE)] },
  filter: (v) => v.status === "none" || (v.size === "md" && v.shape === "circle"),
  props: { initials: { type: "TEXT", default: "AM" } },
  width: 900,
  build(root, v, b) {
    const s = AVATAR_SIZE[v.size!]!
    b.style(root, { wPx: s.px, hPx: s.px })
    root.layoutMode = "NONE"
    const face = b.frame("image", {
      wPx: s.px,
      hPx: s.px,
      radius: v.shape === "circle" ? "full" : "lg",
      fill: "primary-1",
      align: "center",
      cross: "center",
    })
    b.add(face, [b.text("AM", { prop: "initials", size: s.text, weight: "Medium", color: "primary-8", script: "UI" })])
    root.appendChild(face)
    if (v.status !== "none") {
      const dotSize = Math.max(8, Math.round(s.px / 4))
      const dot = b.ellipse("status", {
        size: dotSize,
        fill: PRESENCE[v.status!]!,
        stroke: "background",
        strokeWidth: 2,
      })
      root.appendChild(dot)
      dot.x = s.px - dotSize
      dot.y = s.px - dotSize
    }
  },
}

export const DISPLAY = [badge, tag, statusBadge, callout, card, userAvatar]
