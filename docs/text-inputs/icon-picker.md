# IconPicker

An icon picker with search and a virtualised grid ([TanStack Virtual](https://tanstack.com/virtual)), so thousands of icons stay fast. It lists every Lucide icon plus any icon sources registered on `OnuProvider` (Iconify collections, FontAwesome), remembers recently used icons, and returns a portable id such as `lucide:house`, `tabler:home` or `fa:regular:house` that [`DynamicIcon`](../guides/icons.md) renders (R6.7).

```tsx
import { DynamicIcon, IconPicker } from "@javaabu/onu"

const [icon, setIcon] = useState<string | null>("lucide:ship")

<FormField label="Menu icon" name="icon">
  <IconPicker value={icon} onValueChange={setIcon} />
</FormField>

{icon && <DynamicIcon id={icon} />}
```

## More icon sets

Register sources once on the provider; the picker shows a set filter when there is more than one.

```tsx
import tabler from "@iconify-json/tabler/icons.json"
import { iconifySource } from "@javaabu/onu/icons/iconify"

<OnuProvider iconSources={[iconifySource({ collections: [tabler] })]}>
```

Restrict a picker to some sets with `sets={["lucide"]}`.

## Props

| Prop                                    | Type                                     | Default   | Description                                                  |
| --------------------------------------- | ---------------------------------------- | --------- | ------------------------------------------------------------ |
| `value`                                 | `string \| null`                         |           | Controlled icon id                                           |
| `defaultValue`                          | `string \| null`                         | `null`    | Initial id                                                   |
| `onValueChange`                         | `(id: string \| null) => void`           |           | Called on pick (or `null` when removed)                      |
| `sets`                                  | `string[]`                               | all       | Source prefixes to include                                   |
| `clearable`                             | `boolean`                                | `true`    | Show "Remove icon"                                           |
| `recentLimit`                           | `number`                                 | `12`      | Recently used icons kept in `localStorage`; `0` turns it off |
| `placeholder`                           | `string`                                 | "No icon" | Trigger text when empty                                      |
| `name`                                  | `string`                                 |           | Submit the id via a hidden input                             |
| `open` / `defaultOpen` / `onOpenChange` |                                          |           | Control the panel                                            |
| `classNames`                            | `{ trigger, panel, search, grid, cell }` |           | Classes for each part                                        |

Also exported: `lucideIconIds()` and `filterIconIds(ids, query)`.

## RTL

The grid flows in the reading direction, and ←/→ follow the visual order in RTL (R11.5). Icon names and the search field are left-to-right.

## Accessibility

- The trigger is a button with `aria-haspopup="dialog"`; focus moves to the search field when the panel opens and back to the trigger when it closes. On phones the panel is a bottom sheet.
- The search field is a combobox controlling a listbox of icons; the highlighted icon is set with `aria-activedescendant`, and each icon is named after its id. The number of matches is announced.

| Key                                       | Action                                 |
| ----------------------------------------- | -------------------------------------- |
| Type                                      | Filter icons                           |
| <kbd>←</kbd> / <kbd>→</kbd>               | Previous / next icon (mirrored in RTL) |
| <kbd>↑</kbd> / <kbd>↓</kbd>               | Row up / down                          |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd> | Five rows up / down                    |
| <kbd>Enter</kbd>                          | Pick the highlighted icon              |
| <kbd>Esc</kbd>                            | Close                                  |
