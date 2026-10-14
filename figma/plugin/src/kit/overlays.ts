import type { Color } from "../core"
import type { KitComponent } from "../components"
import { DIRS, tr } from "./shared"

export const tooltip: KitComponent = {
  name: "Tooltip",
  page: "Overlays",
  key: "overlays/tip",
  description: '<Tip content side>{trigger}</Tip> from "@javaabu/onu" (Radix tooltip; tap or long-press on touch).',
  variants: { side: ["top", "bottom"], dir: DIRS },
  props: { content: { type: "TEXT", default: "Copy link" } },
  width: 700,
  build(root, v, b) {
    b.style(root, { dir: "V", cross: "center" })
    const bubble = b.row("content", { px: 3, py: 1.5, radius: "md", fill: "foreground" }, [
      b.text(tr(b, "Copy link", "ލިންކް ކޮޕީ ކުރޭ"), { prop: "content", size: "xs", color: "background" }),
    ])
    const arrow = b.rect("arrow", { w: 8, h: 8, fill: "foreground" })
    arrow.rotation = 45
    const pointer = b.frame("pointer", {
      hPx: 6,
      wPx: 12,
      align: "center",
      clip: true,
      cross: v.side === "top" ? "end" : "start",
    })
    pointer.layoutMode = "NONE"
    pointer.appendChild(arrow)
    arrow.x = 6
    arrow.y = v.side === "top" ? -5.5 : 0.5
    b.add(root, v.side === "top" ? [bubble, pointer] : [pointer, bubble])
  },
}

const MODAL_WIDTH: Record<string, number> = { sm: 384, md: 512, lg: 672 }

export const dialog: KitComponent = {
  name: "Dialog",
  page: "Overlays",
  key: "overlays/modal",
  description:
    '<Modal trigger title description footer size closeButton>{body}</Modal> from "@javaabu/onu" (ConfirmDialog for confirmations).',
  variants: { size: ["md", "sm", "lg"], dir: DIRS },
  filter: (v) => v.size === "md" || v.dir === "ltr",
  props: {
    title: { type: "TEXT", default: "Edit profile" },
    description: { type: "TEXT", default: "Changes are saved when you press Save." },
    footer: { type: "BOOLEAN", default: true },
    closeButton: { type: "BOOLEAN", default: true },
  },
  width: 1800,
  build(root, v, b) {
    b.style(root, {
      dir: "V",
      wPx: MODAL_WIDTH[v.size!]!,
      p: 6,
      gap: 4,
      radius: "xl",
      fill: "popover",
      shadow: "popup",
    })
    const header = b.row("header", { gap: 2, fillW: true }, [
      b.col("heading", { gap: 1.5, grow: true }, [
        b.text(tr(b, "Edit profile", "ޕްރޮފައިލް ބަދަލުކުރޭ"), {
          prop: "title",
          size: "base",
          weight: "Semibold",
          fillW: true,
        }),
        b.text(tr(b, "Changes are saved when you press Save.", "ސޭވް ފިތުމުން ބަދަލުތައް ރައްކާވާނެ."), {
          prop: "description",
          color: "muted-foreground",
          fillW: true,
        }),
      ]),
      b.toggled(b.icon("x", { color: "muted-foreground", layer: "close" }), "closeButton", true),
    ])
    const body = b.col("body", { gap: 4, fillW: true }, [
      b.instance("TextInput", { label: tr(b, "Name", "ނަން"), withHelp: false }),
      b.instance("TextInput", { label: tr(b, "Email", "އީމެއިލް"), withHelp: false, placeholder: "ahmed@example.mv" }),
    ])
    for (const field of body.children) (field as InstanceNode).layoutSizingHorizontal = "FILL"
    const footer = b.toggled(
      b.row("footer", { gap: 2, align: "end", fillW: true }, [
        b.instance("Button", { variant: "outline", children: tr(b, "Cancel", "ބާތިލް ކުރޭ") }),
        b.instance("Button", { children: tr(b, "Save", "ސޭވް ކުރޭ") }),
      ]),
      "footer",
      true,
    )
    b.add(root, [header, body, footer])
  },
}

const TOAST: Record<string, { icon: string; color: Color } | null> = {
  default: null,
  success: { icon: "circle-check", color: "success" },
  info: { icon: "info", color: "info" },
  warning: { icon: "triangle-alert", color: "warning" },
  error: { icon: "circle-x", color: "destructive" },
}

export const toast: KitComponent = {
  name: "Toast",
  page: "Overlays",
  key: "display-and-feedback/toast",
  description:
    'toast(title, { description, action }) / toast.success / toast.error / toast.warning / toast.info, shown by <Toaster position /> from "@javaabu/onu".',
  variants: { type: Object.keys(TOAST), dir: DIRS },
  filter: (v) => v.dir === "ltr" || v.type === "success",
  props: {
    title: { type: "TEXT", default: "Changes saved" },
    description: { type: "TEXT", default: "Your profile has been updated." },
    withDescription: { type: "BOOLEAN", default: true },
    action: { type: "BOOLEAN", default: false },
  },
  width: 1100,
  build(root, v, b) {
    const t = TOAST[v.type!]
    b.style(root, {
      wPx: 356,
      p: 4,
      gap: 2,
      cross: "start",
      radius: "lg",
      fill: "popover",
      stroke: "border",
      shadow: "popup",
    })
    const body = b.col("body", { gap: 0.5, grow: true }, [
      b.text(tr(b, "Changes saved", "ބަދަލުތައް ރައްކާކުރެވިއްޖެ"), { prop: "title", weight: "Medium", fillW: true }),
      b.toggled(
        b.text(tr(b, "Your profile has been updated.", "ޕްރޮފައިލް އަޕްޑޭޓް ކުރެވިއްޖެ."), {
          prop: "description",
          color: "muted-foreground",
          fillW: true,
        }),
        "withDescription",
        true,
      ),
    ])
    const children: SceneNode[] = []
    if (t) children.push(b.icon(t.icon, { color: t.color }))
    children.push(
      body,
      b.toggled(b.instance("Button", { size: "xs", children: tr(b, "Undo", "އަނބުރާ") }), "action", false),
    )
    b.add(root, children)
  },
}

export const OVERLAYS = [tooltip, dialog, toast]
