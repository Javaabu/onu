"use client"

import * as React from "react"
import type { Editor, Extensions } from "@tiptap/core"
import { EditorContent } from "@tiptap/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import type { ThaanaProp } from "../thaana/use-thaana-field"
import { ImageDialog, LinkDialog, type ImageUploadHandler } from "./_dialogs"
import { editingClasses, proseVariants } from "./_prose"
import { DEFAULT_TOOLBAR, EditorToolbar, type ToolbarItem } from "./_toolbar"
import { useOnuEditor } from "./_use-editor"
import type { EditorFormat, EditorValue } from "./_value"

export const editorVariants = cva(
  [
    "min-w-0 @container/editor relative w-full overflow-hidden rounded-lg border border-input bg-background transition-[color,box-shadow] dark:bg-input/30",
    "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
    "data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40",
    "data-disabled:cursor-not-allowed data-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "",
        ghost: "border-transparent bg-transparent focus-within:ring-0 dark:bg-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

export interface WysiwygEditorProps
  extends
    Omit<React.ComponentProps<"div">, "onChange" | "defaultValue" | "children">,
    VariantProps<typeof editorVariants> {
  /** Controlled content: an HTML string or Tiptap JSON. */
  value?: EditorValue
  /** Initial content when uncontrolled. */
  defaultValue?: EditorValue
  /** Called with the new content (in `format`) on every change. */
  onChange?: (value: EditorValue, editor: Editor) => void
  /** Output format. Defaults to the shape of `value`/`defaultValue`, else `"html"`. */
  format?: EditorFormat
  /** Name of a hidden input carrying the content, for plain form posts. */
  name?: string
  placeholder?: string
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  /** Type Thaana from a Latin keyboard (R13.2/R13.3). Adds a toolbar toggle and Alt+Shift+T. */
  thaana?: ThaanaProp
  /** Toolbar controls, or `false` to hide the toolbar. */
  toolbar?: ToolbarItem[] | false
  /** Heading levels offered in the text style menu. Default `[1, 2, 3]`. */
  headingLevels?: (1 | 2 | 3 | 4 | 5 | 6)[]
  /** Upload handler for the image dialog; resolves to the image URL. Without it, images are added by URL. */
  onImageUpload?: ImageUploadHandler
  /** Extra Tiptap extensions (MIT ones only). */
  extensions?: Extensions
  autofocus?: boolean | "start" | "end"
  /** Render the editor on the first render (SPA). Leave `false` for SSR. */
  immediatelyRender?: boolean
  /** Receives the Tiptap editor instance. */
  onReady?: (editor: Editor) => void
  /** Prose size. */
  size?: "sm" | "default" | "lg"
  classNames?: { toolbar?: string; content?: string; prose?: string }
}

/**
 * A WYSIWYG rich text editor on Tiptap: headings, marks, lists, quotes, links,
 * images, tables, logical alignment and undo/redo. Every block gets
 * `dir="auto"`, so mixed Dhivehi and English paragraphs read correctly.
 */
export function WysiwygEditor({
  value,
  defaultValue,
  onChange,
  format,
  name,
  placeholder,
  readOnly = false,
  disabled,
  required,
  thaana,
  toolbar = DEFAULT_TOOLBAR,
  headingLevels = [1, 2, 3],
  onImageUpload,
  extensions,
  autofocus,
  immediatelyRender,
  onReady,
  variant,
  size,
  className,
  classNames,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: WysiwygEditorProps) {
  const { t } = useTranslation()
  const [dialog, setDialog] = React.useState<"link" | "image" | null>(null)
  const returnFocus = React.useRef<HTMLElement | null>(null)

  const open = (kind: "link" | "image", trigger: HTMLElement | null) => {
    returnFocus.current = trigger
    setDialog(kind)
  }

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
    onChange,
    format,
    placeholder: placeholder ?? t("editor.placeholder"),
    readOnly,
    disabled,
    thaana,
    autofocus,
    immediatelyRender,
    extensions,
    headingLevels,
    blocks: false,
    onReady,
    label: t("editor.editorLabel"),
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
        open("link", null)
        return true
      },
      "Alt-F10": (e) => {
        const first = e.view.dom
          .closest("[data-slot=wysiwyg-editor]")
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

  const linkAttrs = editor?.isActive("link") ? (editor.getAttributes("link") as { href?: string; target?: string }) : {}

  return (
    <div
      data-slot="wysiwyg-editor"
      data-invalid={invalid || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={readOnly || undefined}
      className={cn(editorVariants({ variant }), readOnly && "border-transparent bg-transparent", className)}
      {...props}
    >
      {editor && editable && toolbar !== false ? (
        <EditorToolbar
          editor={editor}
          items={toolbar}
          headingLevels={headingLevels}
          disabled={isDisabled}
          onLink={(trigger) => open("link", trigger)}
          onImage={(trigger) => open("image", trigger)}
          className={classNames?.toolbar}
        />
      ) : null}
      <EditorContent
        editor={editor}
        data-slot="wysiwyg-editor-content"
        data-thaana={thaanaEnabled ? "" : undefined}
        className={cn(
          proseVariants({ size }),
          editingClasses,
          "min-h-40 px-3 py-2 [&_.ProseMirror]:min-h-[inherit]",
          readOnly && "min-h-0 px-0",
          classNames?.prose,
          classNames?.content,
        )}
      />
      {fieldName ? <input type="hidden" name={fieldName} value={serialized} /> : null}
      {editor ? (
        <>
          <LinkDialog
            open={dialog === "link"}
            onOpenChange={(next) => setDialog(next ? "link" : null)}
            onCloseAutoFocus={afterDialog}
            href={linkAttrs.href}
            newTab={linkAttrs.target === "_blank"}
            onSubmit={({ href, newTab }) => {
              const target = newTab ? "_blank" : null
              if (editor.state.selection.empty && !editor.isActive("link")) {
                editor
                  .chain()
                  .insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href, target } }] })
                  .run()
              } else {
                editor.chain().extendMarkRange("link").setLink({ href, target }).run()
              }
            }}
            onRemove={() => editor.chain().extendMarkRange("link").unsetLink().run()}
          />
          <ImageDialog
            open={dialog === "image"}
            onOpenChange={(next) => setDialog(next ? "image" : null)}
            onCloseAutoFocus={afterDialog}
            onUpload={onImageUpload}
            onSubmit={({ src, alt }) => editor.chain().setImage({ src, alt }).run()}
          />
        </>
      ) : null}
    </div>
  )
}

export { DEFAULT_TOOLBAR, EditorToolbar, type EditorToolbarProps, type ToolbarItem } from "./_toolbar"
