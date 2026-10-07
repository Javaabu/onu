---
title: UserAvatar
sidebar_position: 4
---

A person's picture with an initials fallback that handles English **and Dhivehi** names, sizes, shapes and a presence dot. Extends shadcn's `Avatar` (which stays available unchanged as `Avatar`).

```tsx
import { UserAvatar, getInitials } from "@javaabu/onu"

<UserAvatar name="Aishath Shiuna" src={user.photo_url} />
<UserAvatar name="އަޙްމަދު ޢަލީ" status="online" size="lg" />
getInitials("Ahmed Ali") // "AA"
getInitials("އަޙްމަދު ޢަލީ") // "އަޢަ"
```

## Initials

`getInitials(name, max = 2)` takes the first letters of the first and last words. Thaana initials keep the vowel sign (fili) with the consonant, so "އަޙްމަދު" gives "އަ", not a bare "އ". Punctuation such as "(Ali)" or "Mr." is ignored. Thaana initials render with `lang="dv"` and the Thaana font.

## Props

| Prop         | Type                                        | Default    | Description                                                  |
| ------------ | ------------------------------------------- | ---------- | ------------------------------------------------------------ |
| `name`       | `string`                                    |            | Used for initials and the accessible name                    |
| `src`        | `string`                                    |            | Image URL; initials show while loading or if it fails        |
| `alt`        | `string`                                    | `name`     | Image alt text                                               |
| `size`       | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`      | `'md'`     | 24, 32, 40, 48 or 64px                                       |
| `shape`      | `'circle' \| 'square'`                      | `'circle'` | Shape                                                        |
| `status`     | `'online' \| 'offline' \| 'busy' \| 'away'` |            | Presence dot                                                 |
| `decorative` | `boolean`                                   | `false`    | Hide from screen readers (when the name is shown next to it) |
| `fallback`   | `ReactNode`                                 |            | Replace the initials                                         |
| `classNames` | `{ image, fallback, status }`               |            | Classes for each part                                        |

Variants are exported as `userAvatarVariants`.

## Accessibility

- The avatar is an image named after the person, plus the presence ("Aishath Shiuna, Online"), so the dot's colour is not the only signal.
- Use `decorative` when the name is already visible next to the avatar, so it isn't read twice.

## RTL

The presence dot sits at the bottom inline-end corner, so it moves to the left in RTL.
