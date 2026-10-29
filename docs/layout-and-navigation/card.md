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

## Look

Cards follow Ant Design: 24px padding, an 8px corner (it follows `--radius`), a 1px line in the border colour and no shadow. A card with a `title` has a 56px **header row with its own bottom line**, a 16px semibold title and the `actions` centred at the end. `size="sm"` tightens the spacing.

## Content padding

Content placed straight in a card, without `title`, `description`, `actions` or `footer`, gets the same inline padding as `CardContent`, so a quick card needs no wrapper:

```tsx
<Card>
  <p>Your application was received.</p>
</Card>
```

Each direct child is padded (images stay edge to edge); loose text is wrapped in a `CardContent`. Cards composed from `CardHeader`/`CardContent`/`CardFooter` look exactly as before. Set `padded={false}` for edge-to-edge content such as a table or a map: the card then adds no padding at all (the content brings its own).

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

## Form card

A form on a page, in a dialog or in a narrow column: give the card a `width` and put the buttons in `footer`. The card is then full width up to that maximum and centred, and it responds to its own width: when it is narrow, the footer buttons stack full width with the primary (last) one on top. Wrap the card in a `Form` so the footer buttons submit it, or make the form the card with `asChild` (Card never imports the form module itself):

```tsx
<Form onSubmit={save}>
  <Card
    title="New staff member"
    description="They’ll get an email invitation."
    headingLevel={2}
    width="lg"
    footer={
      <>
        <LinkButton href="/staff" variant="outline">
          Cancel
        </LinkButton>
        <SubmitButton>Invite</SubmitButton>
      </>
    }
  >
    <FormField label="Email" name="email">
      <TextInput type="email" />
    </FormField>
  </Card>
</Form>
```

`media` puts a logo or icon above the title, and `centered` centres the header without its bottom line (sign-in and verification pages; the [auth forms](../form-scaffolding/auth-forms) use it). `variant="plain"` drops the surface, the padding and the lines, for a form that sits straight on a page section.

```tsx
<Card width="sm" centered headingLevel={1} media={<Logo />} title="Two-factor verification" description="Enter the code we sent.">
  <Form>…</Form>
</Card>
<Card variant="plain" width="md" title="ދިވެހި ފޯމު">
  …
</Card>
```

## Props

| Prop           | Type                                                       | Default     | Description                   |
| -------------- | ---------------------------------------------------------- | ----------- | ----------------------------- |
| `title`        | `ReactNode`                                                |             | Title (renders the header)    |
| `description`  | `ReactNode`                                                |             | Text under the title          |
| `actions`      | `ReactNode`                                                |             | End of the header             |
| `footer`       | `ReactNode`                                                |             | Footer content                |
| `media`        | `ReactNode`                                                |             | Above the title (logo, icon)  |
| `width`        | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'`                   |             | [Form card](#form-card): maximum width, centred; the footer stacks when narrow |
| `centered`     | `boolean`                                                  | `false`     | Centre the header, without its bottom line |
| `href`         | `string`                                                   |             | Makes it a link card          |
| `external`     | `boolean`                                                  | `false`     | Open the link in a new tab    |
| `headingLevel` | `1–6`                                                      | `3`         | Heading element for the title |
| `size`         | `'default' \| 'sm'`                                        | `'default'` | Spacing                       |
| `variant`      | `'default' \| 'outline' \| 'muted' \| 'plain'`             | `'default'` | Surface; `plain` has none and no padding |
| `asChild`      | `boolean`                                                  | `false`     | Render as the child element   |
| `padded`       | `boolean`                                                  | `true`      | Pad content placed straight in the card (`false`: no padding) |
| `classNames`   | `{ header, media, title, description, actions, content, footer }` |      | Classes for each part         |

`cardVariants` is exported. Other `<div>` props (including `ref`) go to the root.

## Accessibility

- The title is a real heading; link cards have one link whose name is the title.
- Link cards show a focus ring on the whole card (`focus-within`).
- In a form card the footer keeps the primary button last in the DOM (first visually when stacked), matching reading order on wide screens. To make the card a landmark, render it as a `<section aria-labelledby>` with `asChild`.

| Key              | Action              |
| ---------------- | ------------------- |
| <kbd>Tab</kbd>   | Focus the card link |
| <kbd>Enter</kbd> | Follow the link     |

## RTL

Header actions sit at the inline end.
