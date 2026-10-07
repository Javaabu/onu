---
title: TagsInput
sidebar_position: 21
---

A chips input for keywords, topics and similar lists. <kbd>Enter</kbd> or a comma adds the typed tag, <kbd>Backspace</kbd> in an empty field removes the last one, and pasting a comma- or newline-separated list adds every item. Suggestions (static or async), a maximum and Thaana typing are supported. Built on shadcn's `Badge` and Onu's suggestion list.

```tsx
import { TagsInput } from "@javaabu/onu"

const [tags, setTags] = useState<string[]>([])

<FormField label="Topics" name="topics">
  <TagsInput value={tags} onValueChange={setTags} suggestions={["Transport", "Tourism", "Health"]} />
</FormField>

<TagsInput thaana thaanaToggle />
<TagsInput max={3} />
<TagsInput transform={(t) => (t.trim().length >= 2 ? t.trim().toUpperCase() : null)} />
```

With a `name`, each tag is submitted as `name[]`.

## Props

| Prop              | Type                                                   | Default          | Description                                |
| ----------------- | ------------------------------------------------------ | ---------------- | ------------------------------------------ |
| `value`           | `string[]`                                             |                  | Controlled tags                            |
| `defaultValue`    | `string[]`                                             | `[]`             | Initial tags                               |
| `onValueChange`   | `(tags: string[]) => void`                             |                  | Called when tags change                    |
| `suggestions`     | `SuggestionOption[] \| async (query, { signal }) => …` |                  | Suggestions; tags already added are hidden |
| `max`             | `number`                                               |                  | Maximum number of tags                     |
| `allowDuplicates` | `boolean`                                              | `false`          | Allow the same tag twice                   |
| `delimiters`      | `string[]`                                             | `[",", "Enter"]` | Keys / characters that add a tag           |
| `transform`       | `(tag) => string \| null`                              | trim             | Normalise or reject (`null`) a tag         |
| `thaana`          | `boolean \| ThaanaOptions`                             | `false`          | Type Thaana from a Latin keyboard          |
| `thaanaToggle`    | `boolean`                                              | `false`          | Show the Thaana/Latin toggle               |
| `debounce`        | `number`                                               | `300`            | Async suggestion debounce                  |
| `classNames`      | `{ root, tag, input, list, option }`                   |                  | Classes for each part                      |

Other `<input>` props go to the text field, and `ref` points at it.

## RTL and Thaana

With `thaana`, the field types Thaana (`dir="rtl"`, `lang="dv"`), and the Thaana comma `،` also adds a tag. Each chip uses `dir="auto"`, so mixed Dhivehi and English tags display correctly.

## Accessibility

- The text field is a combobox when suggestions are available (same keys as [`Autocomplete`](./autocomplete)).
- Each chip has a remove button named "Remove {tag}". Adding and removing tags is announced.
- When the maximum is reached, "You can add up to N tags" is linked to the field with `aria-describedby`.

| Key                                | Action                                                       |
| ---------------------------------- | ------------------------------------------------------------ |
| <kbd>Enter</kbd> / <kbd>,</kbd>    | Add the typed tag (Enter on an empty field submits the form) |
| <kbd>Backspace</kbd> (empty field) | Remove the last tag                                          |
| <kbd>↓</kbd> / <kbd>↑</kbd>        | Move through suggestions                                     |
| <kbd>Esc</kbd>                     | Close suggestions                                            |
