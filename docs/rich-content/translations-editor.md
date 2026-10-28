# Translations editor

Edit translation keys side by side in English and Dhivehi (or any languages). The Dhivehi column types Thaana from a Latin keyboard. Search keys and text, show only keys with missing translations, and save each cell inline.

```tsx
import { TranslationsEditor } from "@javaabu/onu/editor"

export const Example = (
  <TranslationsEditor
    defaultValue={[
      { key: "auth.login", values: { en: "Log in", dv: "ލޮގިން" }, description: "Sign-in button" },
      { key: "auth.logout", values: { en: "Log out", dv: "" } },
    ]}
    onSave={async ({ key, locale, value }) => {
      await fetch(`/translations/${locale}/${key}`, { method: "PUT", body: JSON.stringify({ value }) })
    }}
  />
)
```

A cell saves when it loses focus (`saveOnBlur`), on <kbd>Ctrl/⌘</kbd>+<kbd>Enter</kbd>, or from its **Save** button. While saving it shows "Saving…", then "Saved"; a rejected promise shows "Couldn’t save" with **Retry**.

Rows that match "Missing only" stay visible while you type their translation, until the filter changes or the cell is saved.

## Props

| Prop                 | Type                                                       | Default          | Description                          |
| -------------------- | ---------------------------------------------------------- | ---------------- | ------------------------------------ |
| `value`              | `TranslationEntry[]`                                       |                  | Controlled entries                   |
| `defaultValue`       | `TranslationEntry[]`                                       |                  | Initial entries                      |
| `onChange`           | `(entries) => void`                                        |                  | Called when any cell changes         |
| `locales`            | `{ code, label?, thaana? }[]`                              | English, Dhivehi | Language columns                     |
| `onSave`             | `({ key, locale, value, entry }) => void \| Promise<void>` |                  | Saves one cell                       |
| `saveOnBlur`         | `boolean`                                                  | `true`           | Save when a changed cell loses focus |
| `defaultMissingOnly` | `boolean`                                                  | `false`          | Start with the missing filter on     |
| `defaultSearch`      | `string`                                                   | `""`             | Initial search                       |
| `thaana`             | `boolean \| ThaanaOptions`                                 | `true`           | Thaana options for Thaana columns    |
| `readOnly`           | `boolean`                                                  | `false`          | View only                            |
| `classNames`         | `{ toolbar, list, row, key, cell }`                        |                  | Classes for each part                |

`TranslationEntry`: `{ key: string; values: Record<locale, string | null>; description?: string }`.

## Layout

In wide containers each key is a row with one column per language. Below about 672px (container query) rows become cards with a labelled field per language, so it works in a sidebar or on a phone.

## Accessibility

- Each field is named "<key> in <language>" and described by its key.
- Missing translations are marked with an icon and the word "Missing", not colour alone.
- Counts, save results and errors are announced in polite live regions.
