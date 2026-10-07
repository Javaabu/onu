---
title: Account switcher
sidebar_position: 16
---

Switch between your own account and accounts you act for: organisations and delegated individuals (e.g. the citizen portal's "Profile and delegation"). Shows the active account with its avatar; the list is grouped, searchable for long lists, and marks the current account.

```tsx
import { AccountSwitcher } from "@javaabu/onu"

;<AccountSwitcher
  accounts={[
    { id: "me", name: "Aishath Shifa", description: "A123456" },
    { id: "javaabu", name: "Javaabu Pvt Ltd", type: "organisation" },
    { id: "father", name: "Ahmed Rasheed", type: "delegated", description: "Delegated to you" },
  ]}
  value={accountId}
  onValueChange={(id) => switchTo(id)}
  footer={<a href="/delegations">Manage delegations</a>}
/>
```

## Props

| Prop                     | Type                                 | Default     | Description                                             |
| ------------------------ | ------------------------------------ | ----------- | ------------------------------------------------------- |
| `accounts`               | `Account[]`                          |             | `{ id, name, description?, avatar?, type?, disabled? }` |
| `value` / `defaultValue` | `string`                             | first       | Active account id                                       |
| `onValueChange`          | `(id, account) => void`              |             |                                                         |
| `searchable`             | `boolean \| "auto"`                  | `"auto"`    | Search field; `auto` = more than 5 accounts             |
| `thaana`                 | `ThaanaProp`                         |             | Thaana in the search field                              |
| `footer`                 | `ReactNode`                          |             | Below the list                                          |
| `size`                   | `"default" \| "lg"`                  | `"default"` |                                                         |
| `sheet`                  | `boolean`                            | `true`      | Bottom sheet on phones (searchable mode)                |
| `classNames`             | `{ trigger, content, item, avatar }` |             |                                                         |

`type` is `"personal"` (default), `"organisation"` or `"delegated"`; the list is grouped in that order. Avatars fall back to initials (or a building icon for organisations).

## Accessibility

The trigger is a button named "Switch account: {name}". Short lists open a Radix dropdown menu with `menuitemradio` items (arrow keys, typeahead, Escape). Searchable lists open a search `combobox` with a `listbox`; the current account is marked "Current account". Focus returns to the trigger on close.
