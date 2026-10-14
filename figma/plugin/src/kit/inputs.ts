import type { Builder, Color } from "../core"
import type { KitComponent } from "../components"
import { DIRS, FIELD_STATES, field, fieldLook, fieldProps, tr } from "./shared"

const BUTTON_VARIANTS = [
  "default",
  "outline",
  "dashed",
  "secondary",
  "ghost",
  "destructive",
  "link",
  "success",
  "warning",
]
const STATES = ["default", "hover", "focus", "disabled"]

interface ButtonLook {
  fill?: Color
  fillOpacity?: number
  stroke?: Color
  dashed?: boolean
  text: Color
  underline?: boolean
}

/** Colours per variant and state, from buttonVariants (ui/button.tsx, form/button.tsx). */
function buttonLook(variant: string, state: string): ButtonLook {
  const hover = state === "hover"
  switch (variant) {
    case "outline":
    case "dashed":
      return {
        fill: "card",
        stroke: hover ? "primary-5" : state === "focus" ? "primary" : "input",
        dashed: variant === "dashed",
        text: hover ? "primary-7" : "foreground",
      }
    case "secondary":
      return { fill: hover ? "input" : "secondary", fillOpacity: hover ? 0.7 : 1, text: "secondary-foreground" }
    case "ghost":
      return hover ? { fill: "secondary", text: "foreground" } : { text: "foreground" }
    case "destructive":
      return { fill: "destructive", fillOpacity: hover ? 0.9 : 1, text: "destructive-foreground" }
    case "link":
      return { text: hover ? "primary" : "primary-7", underline: hover }
    case "success":
    case "warning":
      return { fill: variant, fillOpacity: hover ? 0.85 : 1, text: `${variant}-foreground` }
    default:
      return { fill: hover ? "primary-hover" : "primary", text: "primary-foreground" }
  }
}

const BUTTON_SIZES: Record<string, { h: number; px: number; gap: number; radius: "sm" | "md" | "lg"; icon: number }> = {
  default: { h: 8, px: 3.75, gap: 2, radius: "lg", icon: 16 },
  xs: { h: 6, px: 2, gap: 1, radius: "sm", icon: 12 },
  sm: { h: 7, px: 2.75, gap: 1.5, radius: "md", icon: 14 },
  lg: { h: 9, px: 3.75, gap: 2, radius: "lg", icon: 16 },
}

function drawButton(root: ComponentNode, v: Record<string, string>, b: Builder) {
  const look = buttonLook(v.variant!, v.state!)
  const size = BUTTON_SIZES[v.size!]!
  b.style(root, {
    h: size.h,
    px: size.px,
    gap: size.gap,
    align: "center",
    cross: "center",
    radius: size.radius,
    fill: look.fill,
    fillOpacity: look.fillOpacity,
    stroke: look.stroke,
    dashed: look.dashed,
    shadow: v.state === "focus" ? (v.variant === "destructive" ? "focus-destructive" : "focus") : undefined,
    opacity: v.state === "disabled" ? 0.5 : undefined,
  })
  b.add(root, [
    b.toggled(b.ellipse("spinner", { size: size.icon, fill: look.text, arc: true }), "loading", false),
    b.icon("plus", {
      size: size.icon,
      color: look.text,
      prop: "startIcon glyph",
      visibleProp: "startIcon",
      visible: false,
    }),
    b.text(tr(b, "Button", "ސޭވް ކުރޭ"), {
      prop: "children",
      size: v.size === "xs" ? "xs" : "sm",
      color: look.text,
      underline: look.underline,
    }),
    b.icon("chevron-down", {
      size: size.icon,
      color: look.text,
      prop: "endIcon glyph",
      visibleProp: "endIcon",
      visible: false,
    }),
  ])
}

const buttonDescription = (extra = "") =>
  `<Button variant size startIcon endIcon loading> from "@javaabu/onu".${extra} state is Figma-only (hover, focus-visible, disabled). RTL variants mirror icon order.`

export const button: KitComponent = {
  name: "Button",
  page: "Inputs",
  key: "form-scaffolding/button",
  description: buttonDescription(),
  variants: { variant: BUTTON_VARIANTS, size: ["default", "xs", "sm", "lg"], state: STATES, dir: DIRS },
  // Full state grid at the default size; other sizes and RTL in the default state.
  filter: (v) =>
    v.dir === "ltr" ? v.size === "default" || v.state === "default" : v.size === "default" && v.state === "default",
  props: {
    children: { type: "TEXT", default: "Button" },
    loading: { type: "BOOLEAN", default: false },
    startIcon: { type: "BOOLEAN", default: false },
    "startIcon glyph": { type: "INSTANCE_SWAP", default: "plus" },
    endIcon: { type: "BOOLEAN", default: false },
    "endIcon glyph": { type: "INSTANCE_SWAP", default: "chevron-down" },
  },
  width: 1600,
  build: drawButton,
}

const ICON_SIZES: Record<string, { size: number; radius: "sm" | "md" | "lg"; icon: number }> = {
  icon: { size: 8, radius: "lg", icon: 16 },
  "icon-xs": { size: 6, radius: "sm", icon: 12 },
  "icon-sm": { size: 7, radius: "md", icon: 16 },
  "icon-lg": { size: 9, radius: "lg", icon: 16 },
}

export const iconButton: KitComponent = {
  name: "IconButton",
  page: "Inputs",
  key: "form-scaffolding/icon-button",
  description: `<Button size="icon" startIcon="plus" aria-label="Add"> from "@javaabu/onu" (icon-only Button; sizes icon, icon-xs, icon-sm, icon-lg).`,
  variants: {
    variant: BUTTON_VARIANTS.filter((x) => x !== "link"),
    size: Object.keys(ICON_SIZES),
    state: STATES,
  },
  filter: (v) => v.size === "icon" || v.state === "default",
  props: { "startIcon glyph": { type: "INSTANCE_SWAP", default: "plus" } },
  width: 1200,
  build(root, v, b) {
    const look = buttonLook(v.variant!, v.state!)
    const size = ICON_SIZES[v.size!]!
    b.style(root, {
      h: size.size,
      w: size.size,
      align: "center",
      cross: "center",
      radius: size.radius,
      fill: look.fill,
      fillOpacity: look.fillOpacity,
      stroke: look.stroke,
      dashed: look.dashed,
      shadow: v.state === "focus" ? "focus" : undefined,
      opacity: v.state === "disabled" ? 0.5 : undefined,
    })
    b.add(root, [b.icon("plus", { size: size.icon, color: look.text, prop: "startIcon glyph" })])
  },
}

function control(
  b: Builder,
  state: string,
  o: { h?: number; minHPx?: number; py?: number; cross?: "center" | "start" },
) {
  const look = fieldLook(state)
  return b.row("control", {
    h: o.h,
    hPx: o.minHPx,
    px: 2.5,
    py: o.py,
    gap: 2,
    cross: o.cross ?? "center",
    radius: "lg",
    fill: look.fill,
    fillOpacity: look.fillOpacity,
    stroke: look.stroke,
    shadow: look.shadow,
    opacity: look.opacity,
    fillW: true,
  })
}

export const textInput: KitComponent = {
  name: "TextInput",
  page: "Inputs",
  key: "text-inputs/text-input",
  description:
    '<FormField label help error required><TextInput placeholder startAddon /></FormField> from "@javaabu/onu". state=error sets aria-invalid and shows the error.',
  variants: { state: FIELD_STATES, dir: DIRS },
  props: {
    ...fieldProps,
    placeholder: { type: "TEXT", default: "Ahmed Mohamed" },
    startAddon: { type: "BOOLEAN", default: false },
    "startAddon glyph": { type: "INSTANCE_SWAP", default: "search" },
  },
  width: 1000,
  build(root, v, b) {
    b.style(root, { dir: "V", gap: 2, wPx: 280 })
    const c = control(b, v.state!, { h: 8 })
    b.add(c, [
      b.icon("search", {
        color: "muted-foreground",
        prop: "startAddon glyph",
        visibleProp: "startAddon",
        visible: false,
      }),
      b.text(tr(b, "Ahmed Mohamed", "އަޙްމަދު މުޙައްމަދު"), {
        prop: "placeholder",
        color: v.state === "focus" ? "foreground" : "muted-foreground",
        fillW: true,
      }),
    ])
    b.add(root, field(b, c, v.state!))
  },
}

export const textarea: KitComponent = {
  name: "Textarea",
  page: "Inputs",
  key: "text-inputs/textarea",
  description: '<FormField label help error><Textarea placeholder showCount /></FormField> from "@javaabu/onu".',
  variants: { state: FIELD_STATES, dir: DIRS },
  props: {
    ...fieldProps,
    label: { type: "TEXT", default: "Message" },
    help: { type: "TEXT", default: "Up to 500 characters." },
    placeholder: { type: "TEXT", default: "Write your message" },
    showCount: { type: "BOOLEAN", default: false },
  },
  width: 1000,
  build(root, v, b) {
    b.style(root, { dir: "V", gap: 2, wPx: 280 })
    const c = control(b, v.state!, { minHPx: 80, py: 2, cross: "start" })
    b.add(c, [
      b.text(tr(b, "Write your message", "މެސެޖް ލިޔުއްވާ"), {
        prop: "placeholder",
        color: "muted-foreground",
        fillW: true,
      }),
    ])
    const count = b.toggled(
      b.text("0 / 500", { color: "muted-foreground", size: "xs", align: "end", fillW: true }),
      "showCount",
      false,
    )
    const [label, , help, error] = field(b, c, v.state!, {
      label: tr(b, "Message", "މެސެޖް"),
      help: tr(b, "Up to 500 characters.", "500 އަކުރު ހިމެނޭ ވަރަށް."),
    })
    b.add(root, [label!, c, count, help!, error!])
  },
}

export const select: KitComponent = {
  name: "Select",
  page: "Inputs",
  key: "choice-inputs/select",
  description:
    '<FormField label help error><Select size options placeholder clearable /></FormField> from "@javaabu/onu" (the trigger; the open list is SelectContent).',
  variants: { size: ["default", "sm", "lg"], state: [...FIELD_STATES, "open"], dir: DIRS },
  filter: (v) => v.size === "default" || (v.state === "default" && v.dir === "ltr"),
  props: {
    ...fieldProps,
    label: { type: "TEXT", default: "Island" },
    help: { type: "TEXT", default: "Where you live now." },
    placeholder: { type: "TEXT", default: "Select an island" },
  },
  width: 1200,
  build(root, v, b) {
    b.style(root, { dir: "V", gap: 2, wPx: 280 })
    const state = v.state === "open" ? "focus" : v.state!
    const c = control(b, state, { h: v.size === "sm" ? 7 : v.size === "lg" ? 9 : 8 })
    b.add(c, [
      b.text(tr(b, "Select an island", "ރަށެއް ޚިޔާރު ކުރައްވާ"), {
        prop: "placeholder",
        color: "muted-foreground",
        fillW: true,
      }),
      b.icon(v.state === "open" ? "chevron-up" : "chevron-down", { color: "muted-foreground" }),
    ])
    const parts = field(b, c, state, {
      label: tr(b, "Island", "ރަށް"),
      help: tr(b, "Where you live now.", "މިހާރު ދިރިއުޅޭ ރަށް."),
    })
    if (v.state === "open") {
      const items = [tr(b, "Malé", "މާލެ"), tr(b, "Hulhumalé", "ހުޅުމާލެ"), tr(b, "Addu City", "އައްޑޫ ސިޓީ")]
      const list = b.col("content", { p: 1, radius: "lg", fill: "popover", shadow: "popup", fillW: true }, [
        ...items.map((label, i) =>
          b.row(
            "item",
            { px: 3, py: 1.25, radius: "sm", fill: i === 0 ? "primary-1" : undefined, fillW: true, cross: "center" },
            [b.text(label, { weight: i === 0 ? "Semibold" : "Regular", fillW: true })],
          ),
        ),
      ])
      parts.splice(2, 0, list)
    }
    b.add(root, parts)
  },
}

function choiceLabel(b: Builder, indicator: SceneNode, label: string, description: string, opacity?: number) {
  const text = b.col("text", { gap: 0.5 }, [
    b.text(label, { prop: "label" }),
    b.toggled(b.text(description, { prop: "description", color: "muted-foreground" }), "withDescription", false),
  ])
  return b.row("choice", { gap: 2, cross: "start", opacity }, [indicator, text])
}

const CHECKBOX_SIZES: Record<string, { box: number; radius: number; icon: number }> = {
  sm: { box: 14, radius: 3, icon: 12 },
  default: { box: 16, radius: 4, icon: 14 },
  lg: { box: 20, radius: 5, icon: 16 },
}

export const checkbox: KitComponent = {
  name: "Checkbox",
  page: "Inputs",
  key: "choice-inputs/checkbox",
  description:
    '<Checkbox checked size label description /> from "@javaabu/onu" (checked="indeterminate" for a partial selection).',
  variants: { checked: ["false", "true", "indeterminate"], size: ["default", "sm", "lg"], state: STATES, dir: DIRS },
  filter: (v) =>
    v.dir === "ltr" ? v.size === "default" || v.state === "default" : v.size === "default" && v.state === "default",
  props: {
    label: { type: "TEXT", default: "I agree to the terms" },
    description: { type: "TEXT", default: "You can withdraw at any time." },
    withDescription: { type: "BOOLEAN", default: false },
  },
  width: 1400,
  build(root, v, b) {
    const s = CHECKBOX_SIZES[v.size!]!
    const on = v.checked !== "false"
    const box = b.row("indicator", {
      hPx: s.box,
      wPx: s.box,
      align: "center",
      cross: "center",
      fill: on ? "primary" : "card",
      stroke: on ? "primary" : v.state === "hover" ? "primary-5" : "input",
      shadow: v.state === "focus" ? "focus" : undefined,
    })
    box.cornerRadius = s.radius
    if (on)
      b.add(box, [
        b.icon(v.checked === "indeterminate" ? "minus" : "check", { size: s.icon, color: "primary-foreground" }),
      ])
    b.style(root)
    b.add(root, [
      choiceLabel(
        b,
        box,
        tr(b, "I agree to the terms", "ޝަރުތުތަކަށް އެއްބަސް"),
        tr(b, "You can withdraw at any time.", "ކޮންމެ ވަގުތެއްގައި ބާތިލް ކުރެވޭނެ."),
        v.state === "disabled" ? 0.5 : undefined,
      ),
    ])
  },
}

export const radio: KitComponent = {
  name: "Radio",
  page: "Inputs",
  key: "choice-inputs/radio",
  description: '<RadioGroup variant size><Radio value label description /></RadioGroup> from "@javaabu/onu".',
  variants: { variant: ["default", "card"], checked: ["false", "true"], state: STATES, dir: DIRS },
  filter: (v) => v.dir === "ltr" || v.state === "default",
  props: {
    label: { type: "TEXT", default: "Card payment" },
    description: { type: "TEXT", default: "Visa, Mastercard or Amex." },
    withDescription: { type: "BOOLEAN", default: false },
  },
  width: 1400,
  build(root, v, b) {
    const on = v.checked === "true"
    const dot = b.row("indicator", {
      hPx: 16,
      wPx: 16,
      radius: "full",
      align: "center",
      cross: "center",
      fill: on ? "primary" : "card",
      stroke: on ? "primary" : v.state === "hover" ? "primary-5" : "input",
      shadow: v.state === "focus" ? "focus" : undefined,
    })
    if (on) b.add(dot, [b.ellipse("dot", { size: 6, fill: "primary-foreground" })])
    const label = tr(b, "Card payment", "ކާޑުން ފައިސާ ދެއްކުން")
    const description = tr(b, "Visa, Mastercard or Amex.", "ވިސާ، މާސްޓަރކާޑް ނުވަތަ އެމެކްސް.")
    const opacity = v.state === "disabled" ? 0.5 : undefined
    if (v.variant === "card") {
      b.style(root, {
        p: 3.5,
        wPx: 280,
        radius: "lg",
        fill: on ? "primary-1" : "card",
        stroke: on ? "primary" : v.state === "hover" ? "primary-5" : "input",
        opacity,
      })
      const inner = choiceLabel(b, dot, label, description)
      b.add(root, [inner])
      inner.layoutSizingHorizontal = "FILL"
    } else {
      b.style(root)
      b.add(root, [choiceLabel(b, dot, label, description, opacity)])
    }
  },
}

export const switchComponent: KitComponent = {
  name: "Switch",
  page: "Inputs",
  key: "choice-inputs/switch",
  description: '<Switch checked size label description labelPosition /> from "@javaabu/onu".',
  variants: { checked: ["false", "true"], size: ["default", "sm"], state: ["default", "focus", "disabled"], dir: DIRS },
  filter: (v) => v.dir === "ltr" || (v.state === "default" && v.size === "default"),
  props: {
    label: { type: "TEXT", default: "Email notifications" },
    description: { type: "TEXT", default: "Get an email when something changes." },
    withDescription: { type: "BOOLEAN", default: false },
  },
  width: 1200,
  build(root, v, b) {
    const on = v.checked === "true"
    const small = v.size === "sm"
    // The thumb sits at the end when checked: right in LTR, left in RTL.
    const atEnd = on !== b.rtl
    const track = b.frame("track", {
      hPx: small ? 16 : 22,
      wPx: small ? 28 : 44,
      p: 0.5,
      radius: "full",
      cross: "center",
      align: atEnd ? "end" : "start",
      fill: on ? "primary" : "foreground",
      fillOpacity: on ? 1 : 0.25,
      shadow: v.state === "focus" ? "focus" : undefined,
    })
    b.add(track, [b.ellipse("thumb", { size: small ? 12 : 18, fill: "background" })])
    b.style(root)
    b.add(root, [
      choiceLabel(
        b,
        track,
        tr(b, "Email notifications", "އީމެއިލް ނޮޓިފިކޭޝަން"),
        tr(b, "Get an email when something changes.", "ބަދަލެއް އައިސްފިނަމަ އީމެއިލެއް."),
        v.state === "disabled" ? 0.5 : undefined,
      ),
    ])
  },
}

export const INPUTS = [button, iconButton, textInput, textarea, select, checkbox, radio, switchComponent]
