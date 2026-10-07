"use client"

import * as React from "react"
import { Extension, type Editor, type Extensions } from "@tiptap/core"
import Placeholder from "@tiptap/extension-placeholder"
import { useEditor, useEditorState } from "@tiptap/react"

import { useFormField, useFormFieldControl } from "../components/form/form-field"
import type { ThaanaProp } from "../thaana/use-thaana-field"
import { createSchemaExtensions, type SchemaOptions } from "./_schema"
import { readValue, resolveFormat, sameValue, stringifyValue, type EditorFormat, type EditorValue } from "./_value"
import { ThaanaKeyboard } from "./thaana-keyboard"

export interface UseOnuEditorOptions extends SchemaOptions {
  value?: EditorValue
  defaultValue?: EditorValue
  onChange?: (value: EditorValue, editor: Editor) => void
  format?: EditorFormat
  placeholder?: string | ((node: { type: string; level?: number }) => string)
  /** Placeholder on every empty block (block editor) or only when the document is empty. */
  placeholderOnEveryBlock?: boolean
  readOnly?: boolean
  disabled?: boolean
  thaana?: ThaanaProp
  autofocus?: boolean | "start" | "end"
  immediatelyRender?: boolean
  extensions?: Extensions
  /** Called with the editor instance once it exists. */
  onReady?: (editor: Editor) => void
  /** Keyboard shortcuts handled by the React component (e.g. Mod-k opens the link dialog). */
  shortcuts?: Record<string, (editor: Editor) => boolean>
  /** ARIA/ids from props, merged with the surrounding FormField. */
  controlProps: Record<string, unknown>
  /** Accessible name used when there is no label. */
  label: string
}

/**
 * Shared engine for the WYSIWYG and block editors: value in/out (HTML or JSON),
 * controlled sync, FormField wiring, read-only/disabled and the Thaana keyboard.
 */
export function useOnuEditor({
  value,
  defaultValue,
  onChange,
  format: formatProp,
  placeholder,
  placeholderOnEveryBlock = false,
  readOnly = false,
  disabled: disabledProp,
  thaana,
  autofocus,
  immediatelyRender = false,
  extensions = [],
  headingLevels,
  blocks,
  onReady,
  shortcuts,
  controlProps,
  label,
}: UseOnuEditorOptions) {
  const field = useFormField()
  const control = useFormFieldControl({ disabled: disabledProp, ...controlProps }) as Record<string, unknown>
  const disabled = !!control.disabled
  const editable = !readOnly && !disabled
  const format = resolveFormat(formatProp, value ?? defaultValue)
  const initial = value ?? defaultValue ?? ""
  const thaanaOptions = typeof thaana === "object" ? thaana : {}

  const [serialized, setSerialized] = React.useState(() => stringifyValue(initial))
  const latest = React.useRef({ onChange, format, shortcuts, onReady })
  React.useEffect(() => {
    latest.current = { onChange, format, shortcuts, onReady }
  })
  // ARIA attributes for the contenteditable; ProseMirror reads them on every update.
  const attributes = React.useRef<Record<string, string>>({})

  /* eslint-disable react-hooks/refs -- the refs are only read inside editor callbacks, never during render */
  const editor = useEditor(
    {
      immediatelyRender,
      shouldRerenderOnTransaction: false,
      editable,
      autofocus: autofocus ?? false,
      content: initial,
      extensions: [
        ...createSchemaExtensions({ headingLevels, blocks }),
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (typeof placeholder === "function") {
              return placeholder({ type: node.type.name, level: node.attrs.level as number | undefined })
            }
            return placeholder ?? ""
          },
          emptyEditorClass: "is-empty",
          emptyNodeClass: placeholderOnEveryBlock ? "is-empty" : "onu-empty-node",
          showOnlyCurrent: true,
        }),
        ...(thaana
          ? [
              ThaanaKeyboard.configure({
                enabled: thaanaOptions.defaultEnabled ?? true,
                keymap: thaanaOptions.keymap ?? "phonetic",
                paste: thaanaOptions.paste ?? "keep",
                toggleShortcut: thaanaOptions.toggleShortcut === false ? false : "Alt-Shift-t",
              }),
            ]
          : []),
        Extension.create({
          name: "onuShortcuts",
          addKeyboardShortcuts() {
            const entries = Object.keys(latest.current.shortcuts ?? {}).map((key) => [
              key,
              () => latest.current.shortcuts?.[key]?.(this.editor) ?? false,
            ])
            return {
              ...Object.fromEntries(entries),
              // Logical alignment shortcuts (TextAlign's own ones are left/right).
              "Mod-Shift-l": () => this.editor.commands.setTextAlign("start"),
              "Mod-Shift-r": () => this.editor.commands.setTextAlign("end"),
            }
          },
        }),
        ...extensions,
      ],
      editorProps: {
        attributes: () => attributes.current,
      },
      onCreate: ({ editor: e }) => latest.current.onReady?.(e),
      onUpdate: ({ editor: e }) => {
        const next = readValue(e, latest.current.format)
        setSerialized(stringifyValue(next))
        latest.current.onChange?.(next, e)
      },
    },
    // Recreate only when the schema or keyboard setup changes.
    [headingLevels?.join(","), blocks, !!thaana, JSON.stringify(thaanaOptions)],
  )
  /* eslint-enable react-hooks/refs */

  // Subscribes to mode changes; the storage is read directly because the
  // subscription only starts reporting after the first transaction.
  useEditorState({ editor, selector: ({ editor: e }) => !!e?.storage.thaanaKeyboard?.enabled })
  const thaanaEnabled = !!editor?.storage.thaanaKeyboard?.enabled

  const nextAttributes: Record<string, string> = { role: "textbox", "aria-multiline": "true" }
  const ariaLabel = control["aria-label"] as string | undefined
  const labelledBy =
    (control["aria-labelledby"] as string | undefined) ?? (field && !ariaLabel ? field.labelId : undefined)
  if (control.id) nextAttributes.id = String(control.id)
  if (labelledBy) nextAttributes["aria-labelledby"] = labelledBy
  else nextAttributes["aria-label"] = ariaLabel ?? label
  for (const key of ["aria-describedby", "aria-invalid", "aria-required"] as const) {
    if (control[key] !== undefined && control[key] !== false) nextAttributes[key] = String(control[key])
  }
  if (readOnly) nextAttributes["aria-readonly"] = "true"
  if (disabled) nextAttributes["aria-disabled"] = "true"
  // Thaana typing sets the field's language and direction (R13.4); blocks keep dir="auto".
  if (thaana && thaanaEnabled) {
    nextAttributes.lang = "dv"
    nextAttributes.dir = "rtl"
  }

  const attributesKey = JSON.stringify(nextAttributes)
  React.useEffect(() => {
    attributes.current = JSON.parse(attributesKey) as Record<string, string>
    if (editor && !editor.isDestroyed) editor.view.setProps({})
  }, [editor, attributesKey])

  React.useEffect(() => {
    if (editor && !editor.isDestroyed && editor.isEditable !== editable) editor.setEditable(editable, false)
  }, [editor, editable])

  // Controlled value: replace the content when it differs from what the editor holds.
  React.useEffect(() => {
    if (!editor || editor.isDestroyed || value === undefined) return
    if (sameValue(readValue(editor, format), value)) return
    editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value, format])

  return {
    editor,
    editable,
    disabled,
    /** The value as a string, for the hidden form input. */
    serialized: value !== undefined ? stringifyValue(value) : serialized,
    name: control.name as string | undefined,
    thaanaEnabled: !!thaana && thaanaEnabled,
    invalid: control["aria-invalid"] === true || control["aria-invalid"] === "true",
  }
}
