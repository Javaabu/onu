---
title: WYSIWYG editor
sidebar_position: 1
---

A rich text editor built on [Tiptap](https://tiptap.dev) (ProseMirror). It has a toolbar for headings, bold, italic, underline, strikethrough, inline code, lists, quotes, links, images, tables, alignment, dividers and undo/redo. Every block gets `dir="auto"`, so mixed Dhivehi and English paragraphs each read in their own direction. Lists and quotes get an explicit `dir` from their first strong character (a container with `dir="auto"` would ignore its paragraphs and fall back to LTR), and `getHTML()` includes it.

Only MIT-licensed Tiptap packages are used. No Tiptap Pro or Cloud extension is needed.

```bash
pnpm add @tiptap/core @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-table @tiptap/extension-text-align @tiptap/extension-placeholder @tiptap/static-renderer @tiptap/suggestion shiki
```

```tsx
import { WysiwygEditor } from "@javaabu/onu/editor"

export const Example = (
  <FormField label="Body" name="body">
    <WysiwygEditor />
  </FormField>
)
```

## Value

The value is an HTML string or Tiptap JSON. The output format follows the shape of `value`/`defaultValue`, or set `format`.

```tsx
const [html, setHtml] = useState('<p>Hello</p>');
<WysiwygEditor value={html} onChange={setHtml} />

<WysiwygEditor format="json" onChange={(json) => save(json)} />
```

An empty document is `""` in HTML. With `name` (or inside a `FormField` with a `name`), a hidden input carries the value for plain form posts; JSON is posted as a string, and an empty document posts `""`, so Laravel's `required` rule works.

## Thaana

```tsx
<WysiwygEditor thaana />
<WysiwygEditor thaana={{ keymap: 'typewriter', defaultEnabled: false }} />
```

With `thaana`, typing goes through the [`ThaanaKeyboard`](./thaana-keyboard) extension: the toolbar gets a ދ/A toggle, <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd> switches mode, and the content area gets `lang="dv"` and `dir="rtl"` while Thaana is on.

## Toolbar

The default toolbar is `DEFAULT_TOOLBAR`. Pass your own list, with `"|"` for separators, or `false` for none.

```tsx
<WysiwygEditor toolbar={["bold", "italic", "|", "bulletList", "orderedList", "|", "link"]} />
```

Items: `blockType`, `bold`, `italic`, `underline`, `strike`, `code`, `bulletList`, `orderedList`, `blockquote`, `codeBlock`, `link`, `image`, `table`, `alignStart`, `alignCenter`, `alignEnd`, `horizontalRule`, `undo`, `redo`, `thaana`.

In narrow containers (phones, sidebars) the less common items move into a **More** menu and the rest wrap. Alignment uses logical `start`/`center`/`end`, so it follows the text direction.

`EditorToolbar` is exported too, for building your own layout around a Tiptap editor.

## Images

The image dialog takes a URL and alt text. Pass `onImageUpload` to add an **Upload** tab; it receives the `File` and resolves to the uploaded URL.

```tsx
<WysiwygEditor
  onImageUpload={async (file) => {
    const body = new FormData()
    body.append("image", file)
    const res = await fetch("/media", { method: "POST", body })
    return (await res.json()).url
  }}
/>
```

## Props

| Prop                | Type                              | Default           | Description                                                                |
| ------------------- | --------------------------------- | ----------------- | -------------------------------------------------------------------------- |
| `value`             | `string \| JSONContent`           |                   | Controlled content                                                         |
| `defaultValue`      | `string \| JSONContent`           |                   | Initial content                                                            |
| `onChange`          | `(value, editor) => void`         |                   | Called on every change                                                     |
| `format`            | `'html' \| 'json'`                | from the value    | Output format                                                              |
| `name`              | `string`                          |                   | Hidden input name for form posts                                           |
| `placeholder`       | `string`                          | "Start writing…"  | Shown when empty                                                           |
| `readOnly`          | `boolean`                         | `false`           | Show the content without editing or toolbar                                |
| `disabled`          | `boolean`                         | `false`           | Disable editing                                                            |
| `thaana`            | `boolean \| ThaanaOptions`        | `false`           | Type Thaana from a Latin keyboard                                          |
| `toolbar`           | `ToolbarItem[] \| false`          | `DEFAULT_TOOLBAR` | Toolbar controls                                                           |
| `headingLevels`     | `(1–6)[]`                         | `[1, 2, 3]`       | Levels in the text style menu                                              |
| `onImageUpload`     | `(file: File) => Promise<string>` |                   | Enables image upload                                                       |
| `extensions`        | `Extensions`                      |                   | Extra (MIT) Tiptap extensions                                              |
| `variant`           | `'default' \| 'ghost'`            | `'default'`       | Bordered or borderless                                                     |
| `size`              | `'sm' \| 'default' \| 'lg'`       | `'default'`       | Prose size                                                                 |
| `immediatelyRender` | `boolean`                         | `false`           | Create the editor during the first render (SPA only; keep `false` for SSR) |
| `onReady`           | `(editor) => void`                |                   | Receives the Tiptap `Editor`                                               |
| `classNames`        | `{ toolbar, content }`            |                   | Classes for each part                                                      |

Other `<div>` props go to the root, and `ref` points at the root. `editorVariants` is exported.

## Accessibility

- The content area is a `role="textbox"` with `aria-multiline`. Inside a `FormField` it is labelled by the field label and described by help and error text; `aria-invalid`, `aria-required`, `aria-readonly` and `aria-disabled` are set.
- The toolbar follows the WAI-ARIA toolbar pattern: one tab stop, arrow keys move between controls (mirrored in RTL), toggles expose `aria-pressed`.
- Link and image dialogs return focus to the button that opened them.
- Toolbar buttons are 44px on touch screens.

| Key                                                                             | Action                       |
| ------------------------------------------------------------------------------- | ---------------------------- |
| <kbd>Ctrl/⌘</kbd>+<kbd>B</kbd> / <kbd>I</kbd> / <kbd>U</kbd>                    | Bold / italic / underline    |
| <kbd>Ctrl/⌘</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd>                                 | Strikethrough                |
| <kbd>Ctrl/⌘</kbd>+<kbd>E</kbd>                                                  | Inline code                  |
| <kbd>Ctrl/⌘</kbd>+<kbd>K</kbd>                                                  | Insert or edit a link        |
| <kbd>Ctrl/⌘</kbd>+<kbd>Shift</kbd>+<kbd>7</kbd> / <kbd>8</kbd>                  | Numbered / bulleted list     |
| <kbd>Ctrl/⌘</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd> / <kbd>E</kbd> / <kbd>R</kbd>   | Align start / centre / end   |
| <kbd>Ctrl/⌘</kbd>+<kbd>Z</kbd>, <kbd>Ctrl/⌘</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> | Undo, redo                   |
| <kbd>Alt</kbd>+<kbd>F10</kbd>                                                   | Move focus to the toolbar    |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>Home</kbd> <kbd>End</kbd>                        | Move within the toolbar      |
| <kbd>Esc</kbd> (in the toolbar)                                                 | Back to the content          |
| <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>                                    | Thaana/Latin (with `thaana`) |

:::info

To show saved content without loading the editor, use [`BlockRenderer`](./block-renderer). It renders HTML-free, sanitised React from the JSON.

:::
