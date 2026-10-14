import { Builder, type Dir, type Kit } from "../core"
import { docFrame } from "./foundations"
import { tr } from "./shared"

/**
 * Sample screens built only from kit instances (REQUIREMENTS R3: the sample pages
 * exist as Figma frames): an admin dashboard (light and dark) and an application
 * form (LTR and RTL).
 */
export async function samples(kit: Kit, page: PageNode): Promise<SceneNode[]> {
  const frames = [
    dashboard(kit, page, "Admin dashboard", "ltr"),
    dashboard(kit, page, "Admin dashboard (Dark)", "ltr", "Dark"),
    applicationForm(kit, page, "Application form", "ltr"),
    applicationForm(kit, page, "Application form (RTL)", "rtl"),
  ]
  await Promise.all(kit.pending.splice(0))
  return frames
}

function setColorMode(kit: Kit, frame: FrameNode, mode: string) {
  const collection = kit.vars.collections.get("Onu / Color")
  const modeId = kit.vars.modes.get("Onu / Color")?.get(mode)
  if (collection && modeId) frame.setExplicitVariableModeForCollection(collection, modeId)
}

function dashboard(kit: Kit, page: PageNode, name: string, dir: Dir, mode?: string) {
  const b = new Builder(kit, dir)
  const frame = docFrame(page, name)
  b.style(frame, { wPx: 1440, hPx: 960, fill: "shell", clip: true })
  if (mode) setColorMode(kit, frame, mode)

  const sidebar = b.instance("AppSidebar", { surface: "shell" })
  const tiles = b.row("stats", { gap: 4, fillW: true }, [
    b.instance("StatTile", { label: tr(b, "Applications", "އެޕްލިކޭޝަންތައް"), value: "1,284" }),
    b.instance("StatTile", { label: tr(b, "Approved", "ފާސްކުރެވިފަ"), value: "962" }),
    b.instance("StatTile", { delta: "negative", label: tr(b, "Pending", "މަޑުކުރަމުން"), value: "214" }),
    b.instance("StatTile", { label: tr(b, "Revenue", "އާމްދަނީ"), value: "MVR 128,400" }),
  ])
  for (const tile of tiles.children) (tile as InstanceNode).layoutSizingHorizontal = "FILL"

  const tableCard = b.col("Applications", { p: 6, gap: 4, radius: "xl", fill: "card", stroke: "border", fillW: true }, [
    b.row("toolbar", { gap: 2, cross: "center", fillW: true }, [
      b.instance("Tabs", { variant: "line" }),
      b.frame("spacer", { grow: true }),
      b.instance("Button", {
        variant: "outline",
        children: tr(b, "Export", "އެކްސްޕޯޓް"),
        startIcon: true,
        "startIcon glyph": b.iconId("download"),
      }),
      b.instance("Button", { children: tr(b, "New application", "އައު އެޕްލިކޭޝަން"), startIcon: true }),
    ]),
    b.instance("DataTable", {}),
    b.instance("Pagination", {}),
  ])
  const content = b.col("content", { p: 6, gap: 6, fill: "layout", radius: "xl", grow: true, fillH: true }, [
    b.instance("Breadcrumbs", { current: tr(b, "Dashboard", "ޑޭޝްބޯޑް") }),
    b.text(tr(b, "Dashboard", "ޑޭޝްބޯޑް"), { size: "3xl", weight: "Semibold" }),
    tiles,
    tableCard,
  ])
  const main = b.col("main", { grow: true, fillH: true, pe: 2, pb: 2 }, [
    b.instance("AppHeader", { variant: "shell", search: true }),
    content,
  ])
  b.add(frame, [sidebar, main])
  ;(main.children[0] as InstanceNode).layoutSizingHorizontal = "FILL"
  for (const child of tableCard.children.slice(1)) (child as InstanceNode).layoutSizingHorizontal = "FILL"
  return frame
}

function applicationForm(kit: Kit, page: PageNode, name: string, dir: Dir) {
  const b = new Builder(kit, dir)
  const frame = docFrame(page, name)
  b.style(frame, { dir: "V", wPx: 1440, fill: "layout", cross: "center" })

  const fields = [
    b.instance("TextInput", { label: tr(b, "Full name", "ފުރިހަމަ ނަން"), required: true }),
    b.instance("TextInput", {
      label: tr(b, "Email", "އީމެއިލް"),
      help: tr(b, "We send updates here.", "އަޕްޑޭޓްތައް ފޮނުވާނީ މިއަށް."),
      placeholder: "ahmed@example.mv",
    }),
    b.instance("TextInput", {
      state: "error",
      label: tr(b, "National ID", "އައިޑީ ކާޑު ނަންބަރު"),
      placeholder: "A123456",
    }),
    b.instance("Select", {}),
    b.instance("Textarea", { label: tr(b, "Why are you applying?", "އެދޭ ސަބަބު") }),
  ]
  const choices = b.col("payment", { gap: 2, fillW: true }, [
    b.text(tr(b, "Payment method", "ފައިސާ ދައްކާ ގޮތް"), { weight: "Medium" }),
    b.instance("Radio", { variant: "card", checked: "true", withDescription: true }),
    b.instance("Radio", {
      variant: "card",
      label: tr(b, "Bank transfer", "ބޭންކް ޓްރާންސްފަރ"),
      description: tr(b, "BML or MIB.", "ބީއެމްއެލް ނުވަތަ އެމްއައިބީ."),
      withDescription: true,
    }),
  ])
  const formCard = b.col("form", { wPx: 640, p: 8, gap: 6, radius: "xl", fill: "card", stroke: "border" }, [
    b.col("heading", { gap: 1, fillW: true }, [
      b.text(tr(b, "Apply for a permit", "ހުއްދައަށް އެދުން"), { size: "2xl", weight: "Semibold", fillW: true }),
      b.text(tr(b, "It takes about five minutes.", "ފަސް މިނިޓު ވަރު ނަގާނެ."), {
        color: "muted-foreground",
        fillW: true,
      }),
    ]),
    b.instance("Alert", { variant: "info" }),
    ...fields,
    choices,
    b.instance("Checkbox", { checked: "true" }),
    b.row("actions", { gap: 2, align: "end", fillW: true }, [
      b.instance("Button", { variant: "outline", children: tr(b, "Save draft", "ޑްރާފްޓް ސޭވް ކުރޭ") }),
      b.instance("Button", { children: tr(b, "Submit", "ހުށަހަޅާ") }),
    ]),
  ])
  for (const child of formCard.children)
    if (child.type === "INSTANCE" && !["Checkbox"].includes(child.name)) child.layoutSizingHorizontal = "FILL"
  for (const child of choices.children) if (child.type === "INSTANCE") child.layoutSizingHorizontal = "FILL"
  const header = b.instance("AppHeader", { variant: "plain", sidebarTrigger: false, search: false })
  b.add(frame, [header, b.col("body", { py: 12, cross: "center", fillW: true }, [formCard])])
  header.layoutSizingHorizontal = "FILL"
  return frame
}
