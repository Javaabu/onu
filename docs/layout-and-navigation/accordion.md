---
title: Accordion
sidebar_position: 17
---

shadcn's `Accordion` (Radix, WAI-ARIA accordion), extended with an `items` API and visual variants. `type` defaults to `"single"`, and a single accordion is collapsible by default. Without `items` it composes like the shadcn component (`AccordionItem`, `AccordionTrigger`, `AccordionContent`). The original stays available from `@javaabu/onu/primitives`.

```tsx
import { Accordion } from "@javaabu/onu"

;<Accordion
  items={[
    { value: "fees", title: "What are the fees?", icon: "credit-card", content: "MVR 50 per application." },
    { value: "time", title: "How long does it take?", content: "Up to 5 working days." },
  ]}
/>

<Accordion type="multiple" variant="bordered" items={items} defaultValue={["fees"]} />
```

## Props

| Prop                                       | Type                                            | Default     | Description                           |
| ------------------------------------------ | ----------------------------------------------- | ----------- | ------------------------------------- |
| `items`                                    | `{ value, title, content, icon?, disabled? }[]` |             | Data-driven items                     |
| `type`                                     | `'single' \| 'multiple'`                        | `'single'`  | One or several panels open            |
| `collapsible`                              | `boolean`                                       | `true`      | (single) allow closing the open panel |
| `value` / `defaultValue` / `onValueChange` | `string` or `string[]`                          |             | Controlled / uncontrolled state       |
| `variant`                                  | `'default' \| 'bordered' \| 'separated'`        | `'default'` | Visual style                          |
| `classNames`                               | `{ item, trigger, content }`                    |             | Classes for each part                 |

`accordionVariants` is exported.

## Accessibility

| Key                                 | Action                   |
| ----------------------------------- | ------------------------ |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Toggle the focused panel |
| <kbd>↓</kbd> / <kbd>↑</kbd>         | Next / previous header   |
| <kbd>Home</kbd> / <kbd>End</kbd>    | First / last header      |

Headers expose `aria-expanded` and control their panel.

## RTL

The chevron sits at the inline end.
