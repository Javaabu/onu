---
title: Editable select
sidebar_position: 5
---

A text field with a list of suggestions that also accepts anything the user types (a WAI-ARIA combobox with list autocomplete). Typing filters the suggestions with `Intl.Collator`; text that matches none is offered as "Use “…”".

```tsx
import { EditableSelect } from '@javaabu/onu';

<EditableSelect options={['Director', 'Deputy Director']} placeholder="Job title" />
<EditableSelect options={dhivehiTitles} thaana thaanaToggle />
```

## Props

| Prop                                    | Type                                   | Default | Description                                              |
| --------------------------------------- | -------------------------------------- | ------- | -------------------------------------------------------- |
| `options`                               | `(ChoiceOption \| string)[]`           |         | Suggestions                                              |
| `value` / `defaultValue`                | `string`                               | `""`    | The text in the field                                    |
| `onValueChange`                         | `(value, option \| null) => void`      |         | `option` is the picked suggestion, `null` for typed text |
| `thaana` / `thaanaToggle`               | `ThaanaProp` / `boolean`               |         | Thaana keyboard and toggle                               |
| `showCustomOption`                      | `boolean`                              | `true`  | Offer "Use “…”"                                          |
| `open` / `defaultOpen` / `onOpenChange` |                                        |         |                                                          |
| `classNames`                            | `{ root, input, content, list, item }` |         |                                                          |

Other `<input>` props and `ref` go to the input. Picking a suggestion sets the text to its label.

## Accessibility

| Key    | Action                                             |
| ------ | -------------------------------------------------- |
| ↓ / ↑  | Open, then move the highlighted suggestion         |
| Enter  | Use the highlighted suggestion (or the typed text) |
| Escape | Close the list, keeping the text                   |
| Tab    | Close and move on                                  |

Focus stays in the input; the highlighted option is exposed with `aria-activedescendant`.
