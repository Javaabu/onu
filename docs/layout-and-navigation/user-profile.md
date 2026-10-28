# UserProfile

The signed-in user's avatar, name and role (or email), opening a menu with Profile, Settings, your own items and Sign out. Use the full version in a sidebar footer and `compact` (avatar only) in a header.

```tsx
import { UserProfile } from "@javaabu/onu"

;<UserProfile
  name="Aishath Shifa"
  subtitle="Administrator"
  avatarSrc={user.avatar}
  profileHref="/profile"
  settingsHref="/settings"
  items={[{ label: "Billing", icon: "credit-card", href: "/billing" }]}
  onSignOut={() => router.post("/logout")}
/>
```

Initials are derived from the name when there is no image (`getInitials`, works for Thaana names too).

## Props

| Prop           | Type                                             | Default    | Description                          |
| -------------- | ------------------------------------------------ | ---------- | ------------------------------------ |
| `name`         | `string`                                         |            | Full name                            |
| `subtitle`     | `ReactNode`                                      |            | Role, email, …                       |
| `avatarSrc`    | `string`                                         |            | Avatar image                         |
| `initials`     | `string`                                         | from name  | Fallback initials                    |
| `profileHref`  | `string`                                         |            | Adds a Profile item                  |
| `settingsHref` | `string`                                         |            | Adds a Settings item                 |
| `items`        | `{ label, icon?, href?, onSelect?, variant? }[]` |            | Extra items                          |
| `onSignOut`    | `() => void`                                     |            | Adds a Sign out item                 |
| `compact`      | `boolean`                                        | `false`    | Avatar only                          |
| `side`         | `'top' \| 'bottom'`                              | `'bottom'` | Menu side (`top` in sidebar footers) |
| `align`        | `'start' \| 'end'`                               | `'end'`    | Menu alignment                       |
| `classNames`   | `{ trigger, avatar, name, subtitle, content }`   |            | Classes for each part                |

## Accessibility

- The trigger is named "Account menu for Aishath Shifa"; the avatar image is decorative.
- The menu follows the WAI-ARIA menu pattern and returns focus to the trigger.

| Key                                 | Action             |
| ----------------------------------- | ------------------ |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Open the menu      |
| <kbd>↑</kbd> / <kbd>↓</kbd>         | Move between items |
| <kbd>Escape</kbd>                   | Close              |

## RTL

Text aligns to the start and the menu aligns to the inline end.
