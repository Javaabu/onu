"use client"

import * as React from "react"
import type { Editor, Extensions, JSONContent } from "@tiptap/core"
import { EditorContent } from "@tiptap/react"

import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import type { ThaanaProp } from "../thaana/use-thaana-field"
import { BlockHandle } from "./_block-handle"
import { BLOCK_TYPES, filterBlocks, moveCurrentBlock, runBlock, type BlockContext, type BlockType } from "./_blocks"
import {
  applyLink,
  currentLink,
  EmbedDialog,
  ImageDialog,
  LinkDialog,
  removeLink,
  type ImageUploadHandler,
} from "./_dialogs"
import { editingClasses, proseVariants } from "./_prose"
import { blockTitle, SlashMenu, SlashMenuPopup, SlashMenuStore } from "./_slash-menu"
import { EditorToolbar, type ToolbarItem } from "./_toolbar"
import { useOnuEditor } from "./_use-editor"
import type { EditorValue } from "./_value"
import { editorVariants } from "./wysiwyg-editor"

/** Block type ids the slash and "+" menus offer. */
export type BlockTypeId =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "image"
  | "table"
  | "divider"
  | "callout"
  | "codeBlock"
  | "embed"

export const BLOCK_TOOLBAR: ToolbarItem[] = [
  "bold",
  "italic",
  "underline",
  "strike",
  "code",
  "|",
  "link",
  "|",
  "undo",
  "redo",
  "thaana",
]

export interface BlockEditorProps extends Omit<React.ComponentProps<"div">, "onChange" | "defaultValue" | "children"> {
  /** Controlled content as Tiptap JSON. */
  value?: JSONContent
  /** Initial content when uncontrolled (JSON, or HTML to import). */
  defaultValue?: EditorValue
  /** Called with the document JSON on every change. */
  onChange?: (value: JSONContent, editor: Editor) => void
  /** Name of a hidden input carrying the JSON, for plain form posts. */
  name?: string
  placeholder?: string
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  /** Type Thaana from a Latin keyboard. Adds a toolbar toggle and Alt+Shift+T. */
  thaana?: ThaanaProp
  /** Block types offered in the "/" and "+" menus. Default: all. */
  blockTypes?: BlockTypeId[]
  /** Formatting toolbar above the blocks, or `false` for none. */
  toolbar?: ToolbarItem[] | false
  /** Upload handler for image blocks; resolves to the image URL. */
  onImageUpload?: ImageUploadHandler
  extensions?: Extensions
  autofocus?: boolean | "start" | "end"
  immediatelyRender?: boolean
  onReady?: (editor: Editor) => void
  size?: "sm" | "default" | "lg"
  classNames?: { toolbar?: string; content?: string }
}

/**
 * A block-based editor (Tiptap): type "/" for a menu of blocks, add blocks
 * with "+", and reorder them by dragging the grip, from the grip's menu or
 * with Ctrl/⌘+Shift+↑/↓. Content is Tiptap JSON, rendered anywhere with
 * `BlockRenderer`.
 */
export function BlockEditor({
  value,
  defaultValue,
  onChange,
  name,
  placeholder,
  readOnly = false,
  disabled,
  required,
  thaana,
  blockTypes,
  toolbar = BLOCK_TOOLBAR,
  onImageUpload,
  extensions,
  autofocus,
  immediatelyRender,
  onReady,
  size,
  className,
  classNames,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: BlockEditorProps) {
  const { t } = useTranslation()
  const [dialog, setDialog] = React.useState<"link" | "image" | "embed" | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null)
  const returnFocus = React.useRef<HTMLElement | null>(null)
  const [store] = React.useState(() => new SlashMenuStore())

  const blocks = React.useMemo(
    () => (blockTypes ? BLOCK_TYPES.filter((b) => (blockTypes as string[]).includes(b.id)) : BLOCK_TYPES),
    [blockTypes],
  )
  const context = React.useMemo<BlockContext>(
    () => ({
      openImage: () => {
        returnFocus.current = null
        setDialog("image")
      },
      openEmbed: () => {
        returnFocus.current = null
        setDialog("embed")
      },
    }),
    [],
  )
  // The slash menu extension is created once; it reads the latest values from here.
  const live = React.useRef({ t, blocks, context })
  React.useEffect(() => {
    live.current = { t, blocks, context }
  })

  /* eslint-disable react-hooks/refs -- the ref is only read when the menu opens, never during render */
  const [slash] = React.useState(() =>
    SlashMenu.configure({
      store,
      items: (query) =>
        filterBlocks(live.current.blocks, query, (block: BlockType) => blockTitle(block, live.current.t)),
      onSelect: (editor, block, range) => runBlock(editor, block, live.current.context, range),
    }),
  )
  /* eslint-enable react-hooks/refs */

  const announceMove = (position: number) => setAnnouncement(t("editor.blockMoved", { position }))

  const {
    editor,
    editable,
    disabled: isDisabled,
    serialized,
    name: fieldName,
    thaanaEnabled,
    invalid,
  } = useOnuEditor({
    value,
    defaultValue,
    onChange: onChange as ((value: EditorValue, editor: Editor) => void) | undefined,
    format: "json",
    placeholder: ({ type, level }) => {
      if (type === "heading") return t("editor.heading", { level: level ?? 1 })
      if (type === "paragraph") return placeholder ?? t("editor.blockPlaceholder")
      return ""
    },
    placeholderOnEveryBlock: true,
    readOnly,
    disabled,
    thaana,
    autofocus,
    immediatelyRender,
    extensions: [slash, ...(extensions ?? [])],
    headingLevels: [1, 2, 3],
    blocks: true,
    onReady,
    label: t("editor.blockEditorLabel"),
    controlProps: {
      id,
      name,
      required,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
    },
    shortcuts: {
      "Mod-k": () => {
        returnFocus.current = null
        setDialog("link")
        return true
      },
      "Mod-Shift-ArrowUp": (e) => {
        const next = moveCurrentBlock(e, -1)
        if (next !== null) announceMove(next + 1)
        return true
      },
      "Mod-Shift-ArrowDown": (e) => {
        const next = moveCurrentBlock(e, 1)
        if (next !== null) announceMove(next + 1)
        return true
      },
      "Alt-F10": (e) => {
        const first = e.view.dom
          .closest("[data-slot=block-editor]")
          ?.querySelector<HTMLElement>("[data-toolbar-item][tabindex='0']")
        first?.focus()
        return !!first
      },
    },
  })

  const afterDialog = (event: Event) => {
    event.preventDefault()
    const target = returnFocus.current
    if (target?.isConnected) target.focus()
    else editor?.commands.focus()
  }

  return (
    <div
      data-slot="block-editor"
      data-invalid={invalid || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={readOnly || undefined}
      className={cn(editorVariants({ variant: "default" }), readOnly && "border-transparent bg-transparent", className)}
      {...props}
    >
      {editor && editable && toolbar !== false ? (
        <EditorToolbar
          editor={editor}
          items={toolbar}
          disabled={isDisabled}
          onLink={(trigger) => {
            returnFocus.current = trigger
            setDialog("link")
          }}
          onImage={(trigger) => {
            returnFocus.current = trigger
            setDialog("image")
          }}
          className={classNames?.toolbar}
        />
      ) : null}
      <div ref={setContainer} className="relative">
        {editor && editable ? (
          <BlockHandle editor={editor} container={container} blocks={blocks} context={context} onMoved={announceMove} />
        ) : null}
        <EditorContent
          editor={editor}
          data-slot="block-editor-content"
          data-thaana={thaanaEnabled ? "" : undefined}
          className={cn(
            proseVariants({ size }),
            editingClasses,
            "min-h-48 py-3 ps-16 pe-4 touch:ps-24 [&_.ProseMirror]:min-h-[inherit]",
            readOnly && "min-h-0 px-0 touch:ps-0",
            classNames?.content,
          )}
        />
      </div>
      {fieldName ? <input type="hidden" name={fieldName} value={serialized} /> : null}
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
      {editor ? (
        <>
          <SlashMenuPopup store={store} editor={editor} />
          <LinkDialog
            open={dialog === "link"}
            onOpenChange={(next) => setDialog(next ? "link" : null)}
            onCloseAutoFocus={afterDialog}
            {...currentLink(editor)}
            onSubmit={(link) => applyLink(editor, link)}
            onRemove={() => removeLink(editor)}
          />
          <ImageDialog
            open={dialog === "image"}
            onOpenChange={(next) => setDialog(next ? "image" : null)}
            onCloseAutoFocus={afterDialog}
            onUpload={onImageUpload}
            onSubmit={({ src, alt }) => editor.chain().setImage({ src, alt }).run()}
          />
          <EmbedDialog
            open={dialog === "embed"}
            onOpenChange={(next) => setDialog(next ? "embed" : null)}
            onCloseAutoFocus={afterDialog}
            onSubmit={({ src }) => editor.chain().setEmbed({ src }).run()}
          />
        </>
      ) : null}
    </div>
  )
}
