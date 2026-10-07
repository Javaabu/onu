---
title: TreeView
sidebar_position: 21
---

A tree of records (folders, categories, atolls and islands, org units) on React Aria's `Tree`, which implements the WAI-ARIA tree grid pattern. Supports expand/collapse, actions and optional selection with checkboxes.

```tsx
import { TreeView, type TreeNode } from "@javaabu/onu"

const nodes: TreeNode[] = [
  { id: "kaafu", label: "Kaafu Atoll", icon: "folder", children: [{ id: "male", label: "Malé City" }] },
]

<TreeView aria-label="Islands" items={nodes} defaultExpandedKeys={["kaafu"]} onAction={(id) => open(id)} />
<TreeView aria-label="Islands to include" items={nodes} selectionMode="multiple" selectedKeys={ids} onSelectionChange={setIds} />
```

## Partial selection and propagation

In multiple selection, a parent that isn't selected but has selected rows under it shows a dash (`aria-checked="mixed"`). React Aria's `Tree` has no selection propagation of its own, so Onu adds it: with `selectionPropagation`, ticking a parent ticks every enabled row under it, unticking clears them, and a parent becomes ticked when all of its enabled children are (and unticked when one is cleared). `onSelectionChange` receives the full, propagated list. `propagateTreeSelection(items, previous, next, disabled?)` is exported for server-side or custom use.

```tsx
<TreeView items={nodes} selectionMode="multiple" selectionPropagation selectedKeys={ids} onSelectionChange={setIds} />
```

## Props

| Prop                                                         | Type                                                                             | Default      |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------ |
| `items`                                                      | `TreeNode[]` (`id`, `label`, `icon?`, `end?`, `children?`, `disabled?`, `href?`) |              |
| `selectionMode`                                              | `"none" \| "single" \| "multiple"`                                               | `"none"`     |
| `selectedKeys` / `defaultSelectedKeys` / `onSelectionChange` | `string[]`                                                                       |              |
| `selectionPropagation`                                       | `boolean`                                                                        | `false`      |
| `expandedKeys` / `defaultExpandedKeys` / `onExpandedChange`  | `string[]`                                                                       |              |
| `onAction`                                                   | `(id) => void`                                                                   |              |
| `empty`                                                      | `ReactNode`                                                                      | "No results" |
| `classNames`                                                 | `{ item, content, chevron, checkbox }`                                           |              |

## Accessibility

| Key                         | Action                             |
| --------------------------- | ---------------------------------- |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Previous / next row                |
| <kbd>→</kbd> / <kbd>←</kbd> | Expand / collapse (swapped in RTL) |
| <kbd>Enter</kbd>            | Action                             |
| <kbd>Space</kbd>            | Select (when selection is on)      |

The chevrons are named "Expand"/"Collapse" in the active locale and grow to 44px on touch screens.
