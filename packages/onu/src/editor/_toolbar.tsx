"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"
import { useEditorState } from "@tiptap/react"

import { ThaanaToggle } from "../components/inputs/thaana-toggle"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useOnu, useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

/** Toolbar controls, in order. `"|"` draws a separator. */
export type ToolbarItem =
  | "blockType"
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "codeBlock"
  | "link"
  | "image"
  | "table"
  | "alignStart"
  | "alignCenter"
  | "alignEnd"
  | "horizontalRule"
  | "undo"
  | "redo"
  | "thaana"
  | "|"

export const DEFAULT_TOOLBAR: ToolbarItem[] = [
  "blockType",
  "|",
  "bold",
  "italic",
  "underline",
  "strike",
  "code",
  "|",
  "bulletList",
  "orderedList",
  "blockquote",
  "|",
  "link",
  "image",
  "table",
  "|",
  "alignStart",
  "alignCenter",
  "alignEnd",
  "horizontalRule",
  "|",
  "undo",
  "redo",
  "thaana",
]

/** Items that move into the "More" menu in narrow containers (phones). */
const OVERFLOW = new Set<ToolbarItem>([
  "underline",
  "strike",
  "code",
  "blockquote",
  "codeBlock",
  "table",
  "alignStart",
  "alignCenter",
  "alignEnd",
  "horizontalRule",
])

type Mark = "bold" | "italic" | "underline" | "strike" | "code"
type SimpleItem = Exclude<ToolbarItem, "blockType" | "link" | "image" | "table" | "thaana" | "|">

interface SimpleDef {
  label: string
  icon: string
  shortcut?: string
  active?: (state: ToolbarState) => boolean
  disabled?: (state: ToolbarState) => boolean
  run: (editor: Editor) => void
}

const MARKS: Mark[] = ["bold", "italic", "underline", "strike", "code"]

const SIMPLE: Record<SimpleItem, SimpleDef> = {
  bold: {
    label: "editor.bold",
    icon: "bold",
    shortcut: "Mod+B",
    active: (s) => s.marks.bold,
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  italic: {
    label: "editor.italic",
    icon: "italic",
    shortcut: "Mod+I",
    active: (s) => s.marks.italic,
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  underline: {
    label: "editor.underline",
    icon: "underline",
    shortcut: "Mod+U",
    active: (s) => s.marks.underline,
    run: (e) => e.chain().focus().toggleUnderline().run(),
  },
  strike: {
    label: "editor.strike",
    icon: "strikethrough",
    shortcut: "Mod+Shift+S",
    active: (s) => s.marks.strike,
    run: (e) => e.chain().focus().toggleStrike().run(),
  },
  code: {
    label: "editor.code",
    icon: "code",
    shortcut: "Mod+E",
    active: (s) => s.marks.code,
    run: (e) => e.chain().focus().toggleCode().run(),
  },
  bulletList: {
    label: "editor.bulletList",
    icon: "list",
    shortcut: "Mod+Shift+8",
    active: (s) => s.bulletList,
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  orderedList: {
    label: "editor.orderedList",
    icon: "list-ordered",
    shortcut: "Mod+Shift+7",
    active: (s) => s.orderedList,
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  blockquote: {
    label: "editor.blockquote",
    icon: "quote",
    shortcut: "Mod+Shift+B",
    active: (s) => s.blockquote,
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  codeBlock: {
    label: "editor.codeBlock",
    icon: "code",
    shortcut: "Mod+Alt+C",
    active: (s) => s.codeBlock,
    run: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
  alignStart: {
    label: "editor.alignStart",
    icon: "align-start",
    shortcut: "Mod+Shift+L",
    active: (s) => s.align === "start",
    run: (e) => e.chain().focus().setTextAlign("start").run(),
  },
  alignCenter: {
    label: "editor.alignCenter",
    icon: "align-center",
    shortcut: "Mod+Shift+E",
    active: (s) => s.align === "center",
    run: (e) => e.chain().focus().setTextAlign("center").run(),
  },
  alignEnd: {
    label: "editor.alignEnd",
    icon: "align-end",
    shortcut: "Mod+Shift+R",
    active: (s) => s.align === "end",
    run: (e) => e.chain().focus().setTextAlign("end").run(),
  },
  horizontalRule: {
    label: "editor.horizontalRule",
    icon: "minus",
    run: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  undo: {
    label: "editor.undo",
    icon: "undo",
    shortcut: "Mod+Z",
    disabled: (s) => !s.canUndo,
    run: (e) => e.chain().focus().undo().run(),
  },
  redo: {
    label: "editor.redo",
    icon: "redo",
    shortcut: "Mod+Shift+Z",
    disabled: (s) => !s.canRedo,
    run: (e) => e.chain().focus().redo().run(),
  },
}

export interface ToolbarState {
  marks: Record<Mark, boolean>
  block: string
  align: string | null
  bulletList: boolean
  orderedList: boolean
  blockquote: boolean
  codeBlock: boolean
  link: boolean
  table: boolean
  canUndo: boolean
  canRedo: boolean
  thaana: boolean
}

function readState(editor: Editor): ToolbarState {
  const marks = Object.fromEntries(MARKS.map((m) => [m, editor.isActive(m)])) as Record<Mark, boolean>
  const heading = [1, 2, 3, 4, 5, 6].find((level) => editor.isActive("heading", { level }))
  const align = (["start", "center", "end"] as const).find((a) => editor.isActive({ textAlign: a })) ?? null
  const can = editor.can()
  return {
    marks,
    block: heading ? `h${heading}` : "p",
    align,
    bulletList: editor.isActive("bulletList"),
    orderedList: editor.isActive("orderedList"),
    blockquote: editor.isActive("blockquote"),
    codeBlock: editor.isActive("codeBlock"),
    link: editor.isActive("link"),
    table: editor.isActive("table"),
    canUndo: typeof can.undo === "function" ? can.undo() : false,
    canRedo: typeof can.redo === "function" ? can.redo() : false,
    thaana: !!editor.storage.thaanaKeyboard?.enabled,
  }
}

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)

/** "Mod+B" → "Ctrl+B" or "⌘B". */
export function formatShortcut(shortcut: string, mac = isMac()) {
  if (!mac) return shortcut.replace("Mod", "Ctrl")
  return shortcut.replace("Mod+", "⌘").replace("Shift+", "⇧").replace("Alt+", "⌥")
}

interface RovingContextValue {
  active: string
  setActive: (key: string) => void
}
const RovingContext = React.createContext<RovingContextValue>({ active: "", setActive: () => {} })

/** Props for one roving-tabindex toolbar control (WAI-ARIA toolbar pattern). */
function useRoving(key: string) {
  const { active, setActive } = React.useContext(RovingContext)
  return {
    tabIndex: active === key ? 0 : -1,
    "data-toolbar-item": key,
    onFocus: () => setActive(key),
  } as const
}

const buttonClass =
  "text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground aria-expanded:bg-muted touch:size-11"

function ToolbarButton({
  item,
  label,
  icon,
  shortcut,
  pressed,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
  item: string
  label: string
  icon: string
  shortcut?: string
  pressed?: boolean
}) {
  const roving = useRoving(item)
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      aria-pressed={pressed}
      aria-keyshortcuts={shortcut?.replace("Mod", isMac() ? "Meta" : "Control")}
      title={shortcut ? `${label} (${formatShortcut(shortcut)})` : label}
      data-active={pressed || undefined}
      // Keep the editor's selection while clicking.
      onMouseDown={(event) => event.preventDefault()}
      className={cn(buttonClass, className)}
      {...roving}
      {...props}
    >
      <Icon name={icon} />
    </Button>
  )
}

export interface EditorToolbarProps extends Omit<React.ComponentProps<"div">, "children"> {
  editor: Editor
  /** Controls to show. Default {@link DEFAULT_TOOLBAR}. */
  items?: ToolbarItem[]
  headingLevels?: number[]
  disabled?: boolean
  onLink?: (trigger: HTMLElement | null) => void
  onImage?: (trigger: HTMLElement | null) => void
}

/**
 * The formatting toolbar: an ARIA toolbar with one tab stop and arrow-key
 * navigation (mirrored in RTL). In narrow containers the less common controls
 * move into a "More" menu, and the rest wrap.
 */
export function EditorToolbar({
  editor,
  items = DEFAULT_TOOLBAR,
  headingLevels = [1, 2, 3],
  disabled = false,
  onLink,
  onImage,
  className,
  onKeyDown,
  ...props
}: EditorToolbarProps) {
  const { t } = useTranslation()
  const { dir } = useOnu()
  const state = useEditorState({ editor, selector: ({ editor: e }) => readState(e) })
  const keys = items.filter((i) => i !== "|")
  const [active, setActive] = React.useState<string>(keys[0] ?? "")
  const roving = React.useMemo(() => ({ active, setActive }), [active])
  const overflow = keys.filter((i) => OVERFLOW.has(i))
  const hasThaana = !!editor.extensionManager.extensions.find((e) => e.name === "thaanaKeyboard")

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    const target = event.target as HTMLElement
    if (!target.hasAttribute("data-toolbar-item")) return
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-toolbar-item]")).filter(
      (el) => !(el as HTMLButtonElement).disabled && (el.checkVisibility?.() ?? true),
    )
    const index = controls.indexOf(target)
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight"
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft"
    let next: HTMLElement | undefined
    if (event.key === forward) next = controls[(index + 1) % controls.length]
    else if (event.key === back) next = controls[(index - 1 + controls.length) % controls.length]
    else if (event.key === "Home") next = controls[0]
    else if (event.key === "End") next = controls[controls.length - 1]
    else if (event.key === "Escape") {
      event.preventDefault()
      editor.commands.focus()
      return
    }
    if (!next) return
    event.preventDefault()
    next.focus()
  }

  const renderItem = (item: ToolbarItem, index: number) => {
    const hide = OVERFLOW.has(item) ? "hidden @xl/editor:inline-flex" : undefined
    if (item === "|") {
      return (
        <div
          key={`sep-${index}`}
          aria-hidden="true"
          className={cn("mx-0.5 h-5 w-px bg-border", "@xl/editor:block hidden")}
        />
      )
    }
    if (item === "blockType") {
      return (
        <BlockTypeMenu
          key={item}
          editor={editor}
          value={state.block}
          levels={headingLevels}
          disabled={disabled || state.codeBlock}
        />
      )
    }
    if (item === "link") {
      return (
        <ToolbarButton
          key={item}
          item={item}
          label={t("editor.link")}
          icon="link"
          shortcut="Mod+K"
          pressed={state.link}
          disabled={disabled}
          onClick={(event) => onLink?.(event.currentTarget)}
        />
      )
    }
    if (item === "image") {
      return (
        <ToolbarButton
          key={item}
          item={item}
          label={t("editor.image")}
          icon="image"
          disabled={disabled}
          onClick={(event) => onImage?.(event.currentTarget)}
        />
      )
    }
    if (item === "table") {
      return <TableMenu key={item} editor={editor} inTable={state.table} disabled={disabled} className={hide} />
    }
    if (item === "thaana") {
      if (!hasThaana) return null
      return (
        <ThaanaToolbarToggle
          key={item}
          enabled={state.thaana}
          disabled={disabled}
          onToggle={() => editor.chain().focus().toggleThaana().run()}
        />
      )
    }
    const def = SIMPLE[item]
    return (
      <ToolbarButton
        key={item}
        item={item}
        label={t(def.label)}
        icon={def.icon}
        shortcut={def.shortcut}
        pressed={def.active ? def.active(state) : undefined}
        disabled={disabled || (def.disabled?.(state) ?? false)}
        onClick={() => def.run(editor)}
        className={hide}
      />
    )
  }

  return (
    <RovingContext.Provider value={roving}>
      <div
        role="toolbar"
        aria-label={t("editor.toolbar")}
        aria-orientation="horizontal"
        aria-disabled={disabled || undefined}
        data-slot="editor-toolbar"
        className={cn("gap-0.5 p-1 flex flex-wrap items-center border-b border-border", className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {items.map(renderItem)}
        {overflow.length ? <MoreMenu editor={editor} items={overflow} state={state} disabled={disabled} /> : null}
      </div>
    </RovingContext.Provider>
  )
}

function ThaanaToolbarToggle({
  enabled,
  disabled,
  onToggle,
}: {
  enabled: boolean
  disabled: boolean
  onToggle: () => void
}) {
  const roving = useRoving("thaana")
  return (
    <ThaanaToggle
      enabled={enabled}
      onToggle={onToggle}
      disabled={disabled}
      className="h-7 min-w-7 touch:min-h-11 touch:min-w-11"
      {...roving}
    />
  )
}

function BlockTypeMenu({
  editor,
  value,
  levels,
  disabled,
}: {
  editor: Editor
  value: string
  levels: number[]
  disabled: boolean
}) {
  const { t } = useTranslation()
  const roving = useRoving("blockType")
  const options = [
    { value: "p", label: t("editor.paragraph") },
    ...levels.map((level) => ({ value: `h${level}`, label: t("editor.heading", { level }) })),
  ]
  const current = options.find((o) => o.value === value) ?? options[0]!
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`${t("editor.textStyle")}: ${current.label}`}
          onMouseDown={(event) => event.preventDefault()}
          className={cn("min-w-28 touch:h-11 justify-between text-muted-foreground", "aria-expanded:bg-muted")}
          {...roving}
        >
          <span className="truncate">{current.label}</span>
          <Icon name="chevron-down" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40 w-auto" onCloseAutoFocus={(event) => event.preventDefault()}>
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => {
            const chain = editor.chain().focus()
            if (next === "p") chain.setParagraph().run()
            else chain.setHeading({ level: Number(next.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6 }).run()
          }}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function tableActions(editor: Editor) {
  const chain = () => editor.chain().focus()
  return [
    { key: "addRowBefore", run: () => chain().addRowBefore().run() },
    { key: "addRowAfter", run: () => chain().addRowAfter().run() },
    { key: "addColumnBefore", run: () => chain().addColumnBefore().run() },
    { key: "addColumnAfter", run: () => chain().addColumnAfter().run() },
    { key: "toggleHeaderRow", run: () => chain().toggleHeaderRow().run() },
    { key: "deleteRow", run: () => chain().deleteRow().run(), destructive: true },
    { key: "deleteColumn", run: () => chain().deleteColumn().run(), destructive: true },
    { key: "deleteTable", run: () => chain().deleteTable().run(), destructive: true },
  ]
}

function insertTable(editor: Editor) {
  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

function TableItems({ editor, inTable }: { editor: Editor; inTable: boolean }) {
  const { t } = useTranslation()
  return (
    <>
      <DropdownMenuItem disabled={inTable} onSelect={() => insertTable(editor)}>
        <Icon name="table" />
        {t("editor.insertTable")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {tableActions(editor).map((action) => (
        <DropdownMenuItem
          key={action.key}
          disabled={!inTable}
          variant={action.destructive ? "destructive" : "default"}
          onSelect={action.run}
        >
          {t(`editor.${action.key}`)}
        </DropdownMenuItem>
      ))}
    </>
  )
}

function TableMenu({
  editor,
  inTable,
  disabled,
  className,
}: {
  editor: Editor
  inTable: boolean
  disabled: boolean
  className?: string
}) {
  const { t } = useTranslation()
  const roving = useRoving("table")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={inTable ? t("editor.tableOptions") : t("editor.table")}
          title={t("editor.table")}
          onMouseDown={(event) => event.preventDefault()}
          className={cn(buttonClass, inTable && "bg-muted text-foreground", className)}
          {...roving}
        >
          <Icon name="table" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48 w-auto">
        <TableItems editor={editor} inTable={inTable} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MoreMenu({
  editor,
  items,
  state,
  disabled,
}: {
  editor: Editor
  items: ToolbarItem[]
  state: ToolbarState
  disabled: boolean
}) {
  const { t } = useTranslation()
  const roving = useRoving("more")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("editor.moreFormatting")}
          title={t("editor.moreFormatting")}
          onMouseDown={(event) => event.preventDefault()}
          className={cn(buttonClass, "@xl/editor:hidden")}
          {...roving}
        >
          <Icon name="more" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-52 w-auto" align="end">
        {items.map((item) => {
          if (item === "table") {
            return (
              <DropdownMenuSub key={item}>
                <DropdownMenuSubTrigger>
                  <Icon name="table" />
                  {t("editor.table")}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="min-w-48">
                  <TableItems editor={editor} inTable={state.table} />
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )
          }
          const def = SIMPLE[item as SimpleItem]
          const label = (
            <>
              <Icon name={def.icon} />
              {t(def.label)}
            </>
          )
          if (def.active) {
            return (
              <DropdownMenuCheckboxItem key={item} checked={def.active(state)} onSelect={() => def.run(editor)}>
                {label}
              </DropdownMenuCheckboxItem>
            )
          }
          return (
            <DropdownMenuItem key={item} onSelect={() => def.run(editor)}>
              {label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
