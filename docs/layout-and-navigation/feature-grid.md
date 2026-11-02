# FeatureGrid

A responsive grid of features or services (R3.7): each item has an icon, a title, a description and an optional link. Columns come from **container** queries (R3.19), so the grid fits a full-width page, a two-column layout or a sidebar.

```tsx
import { FeatureGrid, Section } from "@javaabu/onu"

;<Section title="Popular services">
  <FeatureGrid
    items={[
      { icon: "file-text", title: "Passports", description: "Apply or renew online.", href: "/passports" },
      { icon: "banknote", title: "Pay tax", description: "GST and income tax to MIRA.", href: "https://mira.gov.mv", external: true },
      { icon: "help", title: "Help centre", description: "Answers to common questions." },
    ]}
  />
</Section>
```

## Items

| Field         | Type                     | Description                                                              |
| ------------- | ------------------------ | ------------------------------------------------------------------------ |
| `title`       | `ReactNode`              | Required. The item heading (and its link text)                           |
| `description` | `ReactNode`              | Supporting text                                                          |
| `icon`        | `string \| ReactNode`    | A semantic icon name (follows the configured icon set) or any node       |
| `href`        | `string`                 | Makes the item a link, rendered with the app's link component            |
| `external`    | `boolean`                | Opens in a new tab, with "(opens in a new tab)" for screen readers       |
| `linkLabel`   | `ReactNode \| false`     | Visible cue on linked items. Default "Learn more" (translated); `false` hides it |
| `id`          | `string`                 | Stable key                                                               |

## Props

| Prop           | Type                                | Default   | Description                                                   |
| -------------- | ----------------------------------- | --------- | ------------------------------------------------------------- |
| `items`        | `FeatureItem[]`                     | required  | The features                                                  |
| `columns`      | `2 \| 3 \| 4`                       | `3`       | Most columns: 1 → 2 (≥ 36rem) → 3 (≥ 56rem) → 4 (≥ 72rem)      |
| `variant`      | `"card" \| "plain" \| "muted"`      | `"card"`  | Item surface                                                  |
| `align`        | `"start" \| "center"`               | `"start"` | Item alignment                                                |
| `headingLevel` | `2–6`                               | `3`       | Heading level of each title                                   |
| `classNames`   | `{ root, item, icon, title, description, link }` |  | Classes for each part (`root` is the list)                    |

Other `<ul>` props (e.g. `aria-label`) go to the list. `featureGridItemVariants` is exported.

## Accessibility

- The grid is a list (`<ul>`), and each title is a heading, so screen-reader users can jump between items.
- A linked item is **one** link: its title. The link's hit area is stretched over the whole card, and the focus ring shows on the card. The "Learn more" cue is hidden from screen readers so the link isn't announced twice.
- Icons are decorative.

## RTL

Items fill from the inline start, text aligns to the start and the arrow on the link cue points left in RTL.
