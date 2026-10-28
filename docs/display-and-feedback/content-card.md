# ContentCard

A card for news articles, services and events: image, title, excerpt, date, category, extra meta and a link. Vertical (image on top) or horizontal (image beside the text, stacking when the card is narrow).

```tsx
import { ContentCard } from "@javaabu/onu"
;<ContentCard
  title="New ferry routes connect Hulhumalé and Villimalé"
  excerpt="The new routes run every 30 minutes…"
  image={{ src: "/img/ferry.jpg", alt: "Ferry at the Hulhumalé jetty" }}
  href="/news/ferry-routes"
  date="2026-03-12"
  category="News"
/>
```

## Props

| Prop           | Type                                            | Default      | Description                                        |
| -------------- | ----------------------------------------------- | ------------ | -------------------------------------------------- |
| `title`        | `ReactNode`                                     |              | Title (the link text)                              |
| `excerpt`      | `ReactNode`                                     |              | Summary, clamped to three lines                    |
| `image`        | `{ src, alt }`                                  |              | `alt` is required; use `""` for decorative images  |
| `href`         | `string`                                        |              | Makes the card clickable                           |
| `date`         | `Date \| string \| number`                      |              | Shown in the locale's format                       |
| `dateFormat`   | `string`                                        | `'PP'`       | date-fns format                                    |
| `category`     | `ReactNode`                                     |              | Category label                                     |
| `meta`         | `ReactNode`                                     |              | Extra meta (venue, read time)                      |
| `footer`       | `ReactNode`                                     |              | Tags, buttons (stay clickable above the card link) |
| `orientation`  | `'vertical' \| 'horizontal'`                    | `'vertical'` | Layout; horizontal stacks under 32rem              |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6`                         | `3`          | Title heading level                                |
| `classNames`   | `{ image, body, title, excerpt, meta, footer }` |              | Classes for each part                              |

## Accessibility

- An `<article>` with a real heading. Only the title is a link, stretched over the card, so screen readers hear a short link name while the whole card stays clickable.
- The focus ring wraps the whole card.

## RTL and Dhivehi

Dates use the active locale (Dhivehi month names). The horizontal image sits at the inline start.
