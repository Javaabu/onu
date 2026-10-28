# LanguageSwitcher

Switches between languages using their **native names** (English, ދިވެހި). Each option carries its own `lang` and `dir`, so screen readers use the right voice (R14.12). Renders as a native select (default), a segmented toggle, or a globe button with a menu.

```tsx
import { LanguageSwitcher, OnuProvider } from "@javaabu/onu"

function App() {
  const [locale, setLocale] = React.useState<"en" | "dv">("en")
  return (
    <OnuProvider locale={locale}>
      <LanguageSwitcher onChange={(code) => setLocale(code as "en" | "dv")} />
    </OnuProvider>
  )
}
```

With Laravel, call your locale route in `onChange` (e.g. `router.post('/locale', { locale: code })`).

## Props

| Prop        | Type                             | Default            | Description                               |
| ----------- | -------------------------------- | ------------------ | ----------------------------------------- |
| `value`     | `string`                         | active locale code | Selected language                         |
| `onChange`  | `(code: string) => void`         |                    | Called with the chosen code               |
| `languages` | `{ code, name, dir? }[]`         | built-in locales   | Languages to offer                        |
| `variant`   | `'select' \| 'toggle' \| 'menu'` | `'select'`         | Presentation                              |
| `size`      | `'sm' \| 'default'`              | `'default'`        | Size                                      |
| `showIcon`  | `boolean`                        | `true`             | Show the languages icon (select and menu) |
| `disabled`  | `boolean`                        | `false`            | Disable                                   |
| `id`        | `string`                         | generated          | Id of the select                          |

## Accessibility

- `select`: a native select with a visually hidden "Language" label; works with every assistive technology and on phones.
- `toggle`: a radio group named "Language".
- `menu`: the button is named "Language: English"; the menu is a radio group and returns focus to the button.

| Key                         | Action                                         |
| --------------------------- | ---------------------------------------------- |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Change language (select, menu)                 |
| <kbd>←</kbd> / <kbd>→</kbd> | Move between options (toggle; mirrored in RTL) |
| <kbd>Escape</kbd>           | Close the menu                                 |
