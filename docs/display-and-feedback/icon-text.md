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
| `tone`         | `'default' \| 'muted' \| 'primary' \| 'success' \| 'warning' \| 'destructive' \| 'info'` | `'default'` | Colour                                   |
| `asChild`      | `boolean`                                                                                | `false`     | Render your element (e.g. a link)        |
| `classNames`   | `{ icon, text }`                                                                         |             | Classes for each part                    |

Variants are exported as `iconTextVariants`.

## Accessibility

The icon is decorative unless `iconLabel` is set. Give it a label only when it adds meaning the text doesn't.

## RTL

`start`/`end` are logical; directional icons (arrows, external link) mirror in RTL.
