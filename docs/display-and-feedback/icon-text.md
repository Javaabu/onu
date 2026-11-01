---
title: IconText
sidebar_position: 21
---

An icon next to a short piece of text, aligned and sized together: meta rows such as location, date or phone number.

```tsx
import { IconText } from "@javaabu/onu"

<IconText icon="map-pin" tone="muted">Malé</IconText>
<IconText icon="external-link" iconPosition="end" iconLabel="opens in a new tab" asChild>
  <a href="https://gazette.gov.mv" target="_blank">Gazette</a>
</IconText>
```

## Props

| Prop           | Type                                                                                     | Default     | Description                              |
| -------------- | ---------------------------------------------------------------------------------------- | ----------- | ---------------------------------------- |
| `icon`         | `string \| ReactNode`                                                                    |             | Semantic icon name or a node             |
| `iconPosition` | `'start' \| 'end'`                                                                       | `'start'`   | Icon side                                |
| `iconLabel`    | `string`                                                                                 |             | Makes the icon meaningful (`role="img"`) |
| `size`         | `'sm' \| 'md' \| 'lg'`                                                                   | `'md'`      | Text and icon size                       |
| `tone`         | `'neutral' \| 'muted' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'neutral'` | Colour                                   |
| `asChild`      | `boolean`                                                                                | `false`     | Render your element (e.g. a link)        |
| `classNames`   | `{ icon, text }`                                                                         |             | Classes for each part                    |

Variants are exported as `iconTextVariants`.

## Accessibility

This renders a `<span>` with no role of its own (or your element with `asChild`), so screen readers read its text. An icon named by a string is decorative and hidden from them unless `iconLabel` is set, which gives it that accessible name. Give it a label only when it adds meaning the text doesn't. `iconLabel` has no effect on an icon passed as a node, so name that node yourself.

## RTL

`start`/`end` are logical; directional icons (arrows, external link) mirror in RTL.
