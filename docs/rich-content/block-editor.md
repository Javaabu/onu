---
title: Block editor
sidebar_position: 2
---

A block-based editor (page builder) on Tiptap. Type <kbd>/</kbd> for a menu of blocks, add a block below with **+**, and reorder blocks with the grip. Content is Tiptap JSON, rendered anywhere with [`BlockRenderer`](./block-renderer).

Blocks: text, headings 1–3, bulleted and numbered lists, quote, image, table, divider, callout, code and embed (YouTube or Vimeo).

```tsx
import { BlockEditor, BlockRenderer } from '@javaabu/onu/editor';

const [doc, setDoc] = useState<JSONContent>();

<FormField label="Content" name="content">
  <BlockEditor value={doc} onChange={setDoc} />
</FormField>

<BlockRenderer content={doc} />
```

The slash menu uses `@tiptap/suggestion` (MIT). Drag handles are built in-house on pointer events: `@tiptap/extension-drag-handle-react` is MIT but requires Yjs and the collaboration extension, which Onu does not want to force on every project.

## Limiting blocks

```tsx
<BlockEditor blockTypes={["paragraph", "heading2", "bulletList", "callout"]} />
```

Ids: `paragraph`, `heading1`, `heading2`, `heading3`, `bulletList`, `orderedList`, `blockquote`, `image`, `table`, `divider`, `callout`, `codeBlock`, `embed`.

## Moving blocks

- **Pointer, touch or pen**: drag the grip beside a block; a line shows where it will land.
- **Keyboard**: press the grip (or <kbd>Enter</kbd> on it) for **Move up**, **Move down**, **Duplicate** and **Delete**, or press <kbd>Ctrl/⌘</kbd>+<kbd>Shift</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd> in a block.
- Moves are announced, e.g. "Block moved to position 3".

## Props

| Prop            | Type                              | Default               | Description                                  |
| --------------- | --------------------------------- | --------------------- | -------------------------------------------- |
| `value`         | `JSONContent`                     |                       | Controlled document                          |
| `defaultValue`  | `JSONContent \| string`           |                       | Initial document (JSON or HTML to import)    |
| `onChange`      | `(json, editor) => void`          |                       | Called on every change                       |
| `name`          | `string`                          |                       | Hidden input with the JSON (empty doc: `""`) |
| `placeholder`   | `string`                          | "Type “/” for blocks" | Placeholder on empty paragraphs              |
| `blockTypes`    | `BlockTypeId[]`                   | all                   | Blocks in the "/" and "+" menus              |
| `toolbar`       | `ToolbarItem[] \| false`          | `BLOCK_TOOLBAR`       | Formatting toolbar                           |
| `thaana`        | `boolean \| ThaanaOptions`        | `false`               | Type Thaana from a Latin keyboard            |
| `onImageUpload` | `(file: File) => Promise<string>` |                       | Enables image upload                         |
| `readOnly`      | `boolean`                         | `false`               | No editing, handles or toolbar               |
| `disabled`      | `boolean`                         | `false`               | Disable editing                              |
| `extensions`    | `Extensions`                      |                       | Extra Tiptap extensions                      |
| `size`          | `'sm' \| 'default' \| 'lg'`       | `'default'`           | Prose size                                   |
| `classNames`    | `{ toolbar, content }`            |                       | Classes for each part                        |

Also `autofocus`, `immediatelyRender` and `onReady`, as on [`WysiwygEditor`](./wysiwyg-editor). `ref` points at the root.

## RTL and Thaana

The gutter with the handles sits at the inline start, so it is on the right in RTL. Every text block, list and table cell gets `dir="auto"`. With `thaana`, typing Latin keys writes Thaana and <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd> switches back.

## Accessibility

- The slash menu is a listbox; focus stays in the editor, which points at the highlighted option with `aria-activedescendant` and `aria-controls`. The number of results is announced.
- The **+** and grip buttons are labelled, keyboard operable and 44px on touch screens. Dragging always has the menu as an alternative.

| Key                                                                        | Action                       |
| -------------------------------------------------------------------------- | ---------------------------- |
| <kbd>/</kbd>                                                               | Open the block menu          |
| <kbd>↑</kbd> <kbd>↓</kbd>, <kbd>Enter</kbd>/<kbd>Tab</kbd>, <kbd>Esc</kbd> | Move, insert, close the menu |
| <kbd>Ctrl/⌘</kbd>+<kbd>Shift</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd>               | Move the current block       |
| <kbd>Enter</kbd> at the end of a callout                                   | Continue with a paragraph    |
| <kbd>Backspace</kbd> at the start of a callout                             | Turn it into a paragraph     |
| <kbd>Alt</kbd>+<kbd>F10</kbd>, <kbd>Ctrl/⌘</kbd>+<kbd>K</kbd>              | Toolbar, link dialog         |
