---
title: Card
sidebar_position: 13
---

shadcn's `Card`, extended. Without the new props it renders exactly like the shadcn card, so `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent` and `CardFooter` still compose as before. The Onu `Card` is the one exported from `@javaabu/onu`; the original stays available from `@javaabu/onu/primitives`.

```tsx
import { Button, Card } from "@javaabu/onu"

;<Card
  title="Payments received"
  description="Last 30 days"
  actions={
    <Button variant="ghost" size="icon-sm" aria-label="More">
      …
    </Button>
  }
  footer={
    <Button variant="outline" size="sm">
      View all
    </Button>
  }
>
  MVR 48,250.00
</Card>
```

## Link cards

With `href`, the title becomes a link stretched over the whole card (the "block link" pattern), so the card is one tab stop and its text stays selectable. Header actions and the footer sit above the link and stay clickable.

```tsx
<Card href="/cities/addu" title="Addu City" description="6 islands" />
```

Put other interactive elements in the content inside a `relative z-10` wrapper.

## asChild

Render the card as another element. Header and footer props still work; the child's own children sit between them.

```tsx
<Card asChild title="News">
  <article>
    <CardContent>…</CardContent>
  </article>
</Card>
```

## Props

| Prop           | Type                                                       | Default     | Description                   |
| -------------- | ---------------------------------------------------------- | ----------- | ----------------------------- |
| `title`        | `ReactNode`                                                |             | Title (renders the header)    |
| `description`  | `ReactNode`                                                |             | Text under the title          |
| `actions`      | `ReactNode`                                                |             | End of the header             |
| `footer`       | `ReactNode`                                                |             | Footer content                |
| `href`         | `string`                                                   |             | Makes it a link card          |
| `external`     | `boolean`                                                  | `false`     | Open the link in a new tab    |
| `headingLevel` | `2–6`                                                      | `3`         | Heading element for the title |
| `size`         | `'default' \| 'sm'`                                        | `'default'` | Spacing                       |
| `variant`      | `'default' \| 'outline' \| 'muted'`                        | `'default'` | Surface                       |
| `asChild`      | `boolean`                                                  | `false`     | Render as the child element   |
| `classNames`   | `{ header, title, description, actions, content, footer }` |             | Classes for each part         |

`cardVariants` is exported. Other `<div>` props (including `ref`) go to the root.

## Accessibility

- The title is a real heading; link cards have one link whose name is the title.
- Link cards show a focus ring on the whole card (`focus-within`).

| Key              | Action              |
| ---------------- | ------------------- |
| <kbd>Tab</kbd>   | Focus the card link |
| <kbd>Enter</kbd> | Follow the link     |

## RTL

Header actions sit at the inline end.
