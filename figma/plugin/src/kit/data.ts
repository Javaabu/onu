import type { Builder, Color } from "../core"
import type { KitComponent } from "../components"
import { DIRS, tr } from "./shared"

const SIZES: Record<string, { p: number; gap: number; value: "xl" | "3xl" | "4xl" }> = {
  sm: { p: 3, gap: 1.5, value: "xl" },
  default: { p: 6, gap: 2, value: "3xl" },
  lg: { p: 8, gap: 2, value: "4xl" },
}

function sparkline(b: Builder, color: Color, rising: boolean) {
  const points = rising ? [22, 18, 20, 13, 15, 9, 11, 4] : [4, 8, 6, 12, 10, 15, 14, 20]
  const vector = figma.createVector()
  vector.name = "sparkline"
  const step = 120 / (points.length - 1)
  vector.vectorPaths = [
    {
      windingRule: "NONE",
      data: points.map((y, i) => `${i === 0 ? "M" : "L"} ${Math.round(i * step)} ${y}`).join(" "),
    },
  ]
  vector.strokes = [b.paint(color)]
  vector.strokeWeight = 1.5
  vector.strokeCap = "ROUND"
  vector.strokeJoin = "ROUND"
  vector.fills = []
  return vector
}

export const statTile: KitComponent = {
  name: "StatTile",
  page: "Data",
  key: "charts/stat-tile",
  description:
    '<StatTile label value valueFormat delta deltaContext positiveIsGood icon sparkline size /> from "@javaabu/onu/charts". delta here is the sign of the change (positive, negative or none).',
  variants: { size: ["default", "sm", "lg"], delta: ["positive", "negative", "none"], dir: DIRS },
  filter: (v) => v.dir === "ltr" || (v.size === "default" && v.delta === "positive"),
  props: {
    label: { type: "TEXT", default: "Revenue" },
    value: { type: "TEXT", default: "MVR 128,400" },
    deltaContext: { type: "TEXT", default: "vs last month" },
    icon: { type: "BOOLEAN", default: true },
    "icon glyph": { type: "INSTANCE_SWAP", default: "chart-column" },
    sparkline: { type: "BOOLEAN", default: true },
  },
  width: 1300,
  build(root, v, b) {
    const s = SIZES[v.size!]!
    b.style(root, { dir: "V", wPx: 280, p: s.p, gap: s.gap, radius: "xl", fill: "card", stroke: "border" })
    const head = b.row("header", { gap: 2, cross: "center", fillW: true }, [
      b.text(tr(b, "Revenue", "އާމްދަނީ"), { prop: "label", color: "muted-foreground", fillW: true }),
      b.icon("chart-column", { color: "muted-foreground", prop: "icon glyph", visibleProp: "icon" }),
    ])
    const up = v.delta === "positive"
    const tone: Color = v.delta === "none" ? "muted-foreground" : up ? "success" : "destructive"
    const delta = b.row("delta", { gap: 1, cross: "center" }, [
      b.icon(up ? "arrow-up-right" : "arrow-down-right", { size: 14, color: tone, layer: "trend" }),
      b.text(v.delta === "none" ? "0%" : up ? "12.5%" : "4.2%", { name: "delta", color: tone, script: "UI" }),
    ])
    if (v.delta === "none") delta.children[0]!.visible = false
    b.add(root, [
      head,
      b.text("MVR 128,400", { prop: "value", size: s.value, weight: "Semibold", script: "UI" }),
      b.row("footer", { gap: 1.5, cross: "center", fillW: true }, [
        delta,
        b.text(tr(b, "vs last month", "ފާއިތުވި މަހާ އަޅާބަލާއިރު"), {
          prop: "deltaContext",
          color: "muted-foreground",
        }),
      ]),
      b.toggled(
        sparkline(b, v.delta === "negative" ? "destructive" : "primary", v.delta !== "negative"),
        "sparkline",
        true,
      ),
    ])
  },
}

/** Column widths of the sample table (selection, name, email, status, date, actions). */
const COLUMNS = [40, 220, 240, 140, 128, 56]

export const tableRow: KitComponent = {
  name: "Table / Row",
  page: "Data",
  description: 'A header or body row of <DataTable columns data selectable rowActions /> from "@javaabu/onu".',
  variants: { kind: ["header", "row"], state: ["default", "hover", "selected"], dir: DIRS },
  filter: (v) => (v.kind === "row" || v.state === "default") && (v.dir === "ltr" || v.state === "default"),
  props: {
    name: { type: "TEXT", default: "Ahmed Mohamed" },
    email: { type: "TEXT", default: "ahmed@example.mv" },
    date: { type: "TEXT", default: "12 Oct 2026" },
  },
  width: 1800,
  build(root, v, b) {
    const header = v.kind === "header"
    const selected = v.state === "selected"
    b.style(root, {
      cross: "center",
      fill: header ? "muted" : selected ? "primary-1" : v.state === "hover" ? "muted" : "card",
      stroke: "border",
      sides: ["bottom"],
    })
    const cell = (i: number, content: SceneNode[], align: "start" | "end" = "start") =>
      b.row("cell", { wPx: COLUMNS[i]!, px: i === 0 ? 3 : 4, py: header ? 3 : 3.5, cross: "center", align }, content)
    const box = b.row("select", {
      hPx: 16,
      wPx: 16,
      align: "center",
      cross: "center",
      fill: selected ? "primary" : "card",
      stroke: selected ? "primary" : "input",
    })
    box.cornerRadius = 4
    if (selected) b.add(box, [b.icon("check", { size: 14, color: "primary-foreground" })])
    if (header) {
      const h = (en: string, dv: string) => b.text(tr(b, en, dv), { weight: "Medium" })
      b.add(root, [
        cell(0, [box]),
        cell(1, [h("Name", "ނަން")]),
        cell(2, [h("Email", "އީމެއިލް")]),
        cell(3, [h("Status", "ހާލަތު")]),
        cell(4, [h("Created", "ހެދި ތާރީޚު")]),
        cell(5, []),
      ])
      return
    }
    b.add(root, [
      cell(0, [box]),
      cell(1, [
        b.row("person", { gap: 2, cross: "center" }, [
          b.instance("Avatar", { size: "xs" }),
          b.text(tr(b, "Ahmed Mohamed", "އަޙްމަދު މުޙައްމަދު"), { prop: "name" }),
        ]),
      ]),
      cell(2, [b.text("ahmed@example.mv", { prop: "email", script: "UI", color: "muted-foreground" })]),
      cell(3, [b.instance("StatusBadge", { status: "success" })]),
      cell(4, [b.text("12 Oct 2026", { prop: "date", script: "UI" })]),
      cell(
        5,
        [b.instance("IconButton", { variant: "ghost", size: "icon-sm", "startIcon glyph": b.iconId("ellipsis") })],
        "end",
      ),
    ])
  },
}

const ROWS = [
  { name: ["Ahmed Mohamed", "އަޙްމަދު މުޙައްމަދު"], email: "ahmed@example.mv", status: "success", date: "12 Oct 2026" },
  { name: ["Aishath Ali", "އައިޝަތު ޢަލީ"], email: "aishath@example.mv", status: "info", date: "11 Oct 2026" },
  { name: ["Ibrahim Hassan", "އިބްރާހީމް ޙަސަން"], email: "ibrahim@example.mv", status: "warning", date: "9 Oct 2026" },
  { name: ["Mariyam Naseer", "މަރިޔަމް ނަޞީރު"], email: "mariyam@example.mv", status: "pending", date: "7 Oct 2026" },
  { name: ["Hussain Rasheed", "ޙުސައިން ރަޝީދު"], email: "hussain@example.mv", status: "danger", date: "2 Oct 2026" },
]

export const dataTable: KitComponent = {
  name: "DataTable",
  page: "Data",
  key: "listing-pages/data-table",
  description:
    '<DataTable columns data selectable rowActions pagination /> from "@javaabu/onu". Rows are "Table / Row" instances.',
  variants: { dir: DIRS },
  width: 1900,
  build(root, _v, b) {
    b.style(root, { dir: "V", radius: "lg", stroke: "border", clip: true })
    const rows = ROWS.map((r, i) => {
      const row = b.instance("Table / Row", {
        kind: "row",
        state: i === 1 ? "selected" : "default",
        name: tr(b, r.name[0]!, r.name[1]!),
        email: r.email,
        date: r.date,
      })
      const badge = row.findOne((n) => n.type === "INSTANCE" && n.name.startsWith("StatusBadge")) as InstanceNode | null
      badge?.setProperties({ status: r.status })
      return row
    })
    b.add(root, [b.instance("Table / Row", { kind: "header" }), ...rows])
  },
}

export const DATA = [statTile, tableRow, dataTable]
