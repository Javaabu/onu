import type { Builder, Color } from "../core"

/** Sample copy: English in LTR variants, Dhivehi in RTL ones. */
export const tr = (b: Builder, en: string, dv: string) => (b.rtl ? dv : en)

export const DIRS = ["ltr", "rtl"]
export const FIELD_STATES = ["default", "hover", "focus", "error", "disabled"]

/** Border, fill and ring of a field (Input, Textarea, Select trigger) in one state (ui/input.tsx). */
export function fieldLook(state: string): {
  fill: Color
  fillOpacity?: number
  stroke: Color
  shadow?: "focus" | "focus-destructive"
  opacity?: number
} {
  switch (state) {
    case "hover":
      return { fill: "card", stroke: "primary-5" }
    case "focus":
      return { fill: "card", stroke: "primary", shadow: "focus" }
    case "error":
      return { fill: "card", stroke: "destructive", shadow: "focus-destructive" }
    case "disabled":
      return { fill: "input", fillOpacity: 0.5, stroke: "input", opacity: 0.5 }
    default:
      return { fill: "card", stroke: "input" }
  }
}

/**
 * The FormField wrapper around a control: label (+ required marker), the control,
 * help text and, in the error state, the error message. Property names follow
 * FormField: `label`, `help`, `error`, `required`.
 */
export function field(b: Builder, control: SceneNode, state: string, o: { label?: string; help?: string } = {}) {
  const label = b.row("Label", { gap: 1, cross: "center", fillW: true }, [
    b.text(o.label ?? tr(b, "Full name", "ފުރިހަމަ ނަން"), { prop: "label", weight: "Medium" }),
    b.toggled(b.text("*", { color: "destructive", name: "required" }), "required", false),
  ])
  b.toggled(label, "withLabel", true)
  const help = b.toggled(
    b.text(o.help ?? tr(b, "As shown on your ID card.", "ކާޑުގައި ވާ ގޮތަށް."), {
      prop: "help",
      color: "muted-foreground",
      fillW: true,
    }),
    "withHelp",
    true,
  )
  const error = b.text(tr(b, "Enter your full name.", "ފުރިހަމަ ނަން ލިޔުއްވާ."), {
    prop: "error",
    color: "destructive",
    fillW: true,
  })
  error.visible = state === "error"
  return [label, control, help, error]
}

export const fieldProps = {
  label: { type: "TEXT", default: "Full name" },
  help: { type: "TEXT", default: "As shown on your ID card." },
  error: { type: "TEXT", default: "Enter your full name." },
  withLabel: { type: "BOOLEAN", default: true },
  withHelp: { type: "BOOLEAN", default: true },
  required: { type: "BOOLEAN", default: false },
} as const
