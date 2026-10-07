---
title: CookieConsent
sidebar_position: 10
---

A cookie banner with a preferences dialog. People can **accept all**, **reject non-essential** cookies, or choose per category. The choice is saved in `localStorage`, and the banner stays away until you change `version`. Built on shadcn's `Dialog`, `Switch` and `Button`.

```tsx
import { CookieConsent, useCookieConsent, openCookiePreferences } from "@javaabu/onu"

// Once, near the root:
<CookieConsent policyHref="/privacy" onChange={(consent) => analytics.configure(consent.categories)} />

// Anywhere:
const consent = useCookieConsent()
if (consent?.categories.analytics) loadAnalytics()

// A "Cookie settings" link in the footer:
<button onClick={openCookiePreferences}>Cookie settings</button>
```

## Categories

The defaults are `necessary` (always on), `preferences`, `analytics` and `marketing`, with translated labels. Pass your own:

```tsx
<CookieConsent
  categories={[
    { id: "necessary", label: "Essential", required: true },
    { id: "analytics", label: "Statistics", description: "Anonymous usage data", defaultEnabled: false },
  ]}
  version={2}
/>
```

## Props

| Prop                      | Type                                    | Default                | Description                                               |
| ------------------------- | --------------------------------------- | ---------------------- | --------------------------------------------------------- |
| `categories`              | `CookieCategory[]`                      | 4 defaults             | `{ id, label, description?, required?, defaultEnabled? }` |
| `version`                 | `string \| number`                      | `1`                    | Bump to ask everyone again                                |
| `storageKey`              | `string`                                | `'onu-cookie-consent'` | `localStorage` key                                        |
| `onChange`                | `(consent) => void`                     |                        | Called when a choice is saved                             |
| `title` / `description`   | `ReactNode`                             | translated             | Banner text                                               |
| `policyHref`              | `string`                                |                        | Link to the cookie policy                                 |
| `policyLinkText`          | `ReactNode`                             | "Cookie policy"        | Link text                                                 |
| `preferencesOpen`         | `boolean`                               |                        | Controlled dialog                                         |
| `onPreferencesOpenChange` | `(open) => void`                        |                        | Dialog open change                                        |
| `classNames`              | `{ banner, actions, dialog, category }` |                        | Classes for each part                                     |

Stored value (`CookieConsentValue`): `{ categories: Record<string, boolean>, version, updatedAt }`. Helpers: `useCookieConsent(storageKey?)`, `readCookieConsent(storageKey?)`, `openCookiePreferences()`.

## Accessibility

- The banner is a region labelled by its heading; it does not trap focus or block the page.
- The preferences dialog traps focus, closes with <kbd>Escape</kbd>, and returns focus to what opened it.
- Each category is a labelled switch with its description; required categories are disabled and marked "Always on".

| Key               | Action                          |
| ----------------- | ------------------------------- |
| <kbd>Tab</kbd>    | Move between buttons / switches |
| <kbd>Space</kbd>  | Toggle a category               |
| <kbd>Escape</kbd> | Close the dialog without saving |

## Responsive

The banner is fixed to the bottom (respecting the safe-area inset); buttons stack on narrow screens and line up from 28rem.
