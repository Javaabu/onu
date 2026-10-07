---
title: RepeatingGroup
sidebar_position: 10
---

A list of repeated rows of fields (line items, family members, contact numbers) with **Add**, **Remove** and **Move up / Move down**. It works with react-hook-form's `useFieldArray` or with a plain array in state, enforces `min` / `max`, and builds field names like `items[0][name]`.

## With a plain array

```tsx
import { RepeatingGroup, FormField, TextInput } from "@javaabu/onu"

const [members, setMembers] = useState([{ name: "" }])

<RepeatingGroup
  label="Family members"
  name="members"
  value={members}
  onChange={setMembers}
  createItem={() => ({ name: "" })}
  max={5}
>
  {({ item, index, name }) => (
    <FormField label="Name" name={name("name")}>
      <TextInput
        value={item.name}
        onChange={(e) => setMembers((m) => m.map((x, i) => (i === index ? { ...x, name: e.target.value } : x)))}
      />
    </FormField>
  )}
</RepeatingGroup>
```

## With react-hook-form

```tsx
const { fields, append, remove, move } = useFieldArray({ control: form.control, name: "items" })

<RepeatingGroup
  items={fields}
  onAdd={() => append({ name: "", qty: 1 })}
  onRemove={remove}
  onMove={move}
  name="items"
  nameFormat="dot"
  min={1}
>
  {({ name }) => (
    <FormField label="Item" name={name("name")}>
      <TextInput {...form.register(name("name") as `items.${number}.name`)} />
    </FormField>
  )}
</RepeatingGroup>
```

`name("qty")` gives `items[0][qty]` (`nameFormat="bracket"`, the Laravel form style) or `items.0.qty` (`"dot"`, react-hook-form). Server errors for `items.0.qty` reach the field either way.

## Props

| Prop          | Type                                                      | Default        | Description                                |
| ------------- | --------------------------------------------------------- | -------------- | ------------------------------------------ |
| `children`    | `({ item, index, name, remove, canRemove }) => ReactNode` |                | Renders one row's fields                   |
| `items`       | `T[]`                                                     |                | Rows from `useFieldArray` (`fields`)       |
| `value`       | `T[]`                                                     |                | Rows of a plain controlled array           |
| `onChange`    | `(value: T[]) => void`                                    |                | Plain array updates (add, remove, reorder) |
| `createItem`  | `() => T`                                                 |                | New row for plain arrays                   |
| `onAdd`       | `() => void`                                              |                | Add handler (react-hook-form `append`)     |
| `onRemove`    | `(index) => void`                                         |                | Remove handler (react-hook-form `remove`)  |
| `onMove`      | `(from, to) => void`                                      |                | Reorder handler (react-hook-form `move`)   |
| `reorderable` | `boolean`                                                 | auto           | Show Move up / Move down                   |
| `min` / `max` | `number`                                                  | `0` / `∞`      | Limits; Remove / Add disable at the limit  |
| `name`        | `string`                                                  | `items`        | Base field name                            |
| `nameFormat`  | `'bracket' \| 'dot'`                                      | `bracket`      | Name style                                 |
| `getKey`      | `(item, index) => Key`                                    | `item.id`      | Row key                                    |
| `label`       | `ReactNode`                                               |                | Group title (names the group)              |
| `itemLabel`   | `(index, item) => ReactNode`                              | "Item {n}"     | Row title; `null` hides it                 |
| `addLabel`    | `ReactNode`                                               | "Add item"     | Add button text                            |
| `emptyText`   | `ReactNode`                                               | "No items yet" | Shown when there are no rows               |
| `disabled`    | `boolean`                                                 | `false`        | Disable the buttons                        |
| `classNames`  | `{ header, list, row, rowHeader, actions, add }`          |                | Classes for each part                      |

## Accessibility

- The group is `role="group"` named by `label`; rows are list items named "Item 1", "Item 2"…
- Every button has a specific name: "Remove item 2", "Move item 3 up".
- Focus: after **Add** it moves to the new row's first field; after **Remove** to the next row (or **Add** when the list is empty); after a move it stays on the moved row's button.
- Each change is announced in a polite live region ("Item 3 added", "Item moved to position 1").
- Row buttons are 44px on touch screens. Reordering uses buttons, so no drag gesture is needed.

| Key                                 | Action                              |
| ----------------------------------- | ----------------------------------- |
| <kbd>Tab</kbd>                      | Move through fields and row buttons |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activate Add / Remove / Move        |

## RTL and Dhivehi

Row actions sit at the inline end and stack under the fields on narrow containers. All labels and announcements are translated.
