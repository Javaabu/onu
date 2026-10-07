---
title: GridView
sidebar_position: 19
---

Records as a responsive grid of cards. Columns follow the space available (`repeat(auto-fill, minmax(…))`), not the viewport, so the grid also works in a sidebar or a narrow column.

```tsx
import { GridView } from "@javaabu/onu"

;<GridView
  aria-label="Council offices"
  items={offices}
  title={(o) => o.name}
  description={(o) => o.address}
  media={(o) => <img src={o.photo} alt="" />}
  getHref={(o) => `/offices/${o.id}`}
  minItemWidth="14rem"
/>
```

Props are the same as [`ListView`](list-view), plus `minItemWidth` (default `16rem`) and without `variant`. Selection checkboxes sit on the card's start corner.

## Accessibility

A list of cards; each title is a link. Clicking elsewhere on a card follows that link.
