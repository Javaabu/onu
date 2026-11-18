# Section

A page section with a heading, description and actions. It is a `<section>` labelled by its heading, so it shows up as a region landmark. Actions sit beside the heading and move underneath it when the section is narrow (container query).

```tsx
import { Button, Section } from "@javaabu/onu"

;<Section
  title="Contact details"
  description="How we reach this member."
  actions={<Button variant="outline">Edit</Button>}
  variant="card"
>
  <DescriptionList items={details} />
</Section>
```

## Props

| Prop           | Type                                               | Default   | Description                                 |
| -------------- | -------------------------------------------------- | --------- | ------------------------------------------- |
| `title`        | `ReactNode`                                        |           | Heading                                     |
| `description`  | `ReactNode`                                        |           | Text under the heading (`aria-describedby`) |
| `actions`      | `ReactNode`                                        |           | Buttons or links at the end of the header   |
| `headingLevel` | `1–6`                                              | `2`       | Heading element                             |
| `variant`      | `'plain' \| 'card' \| 'muted'`                     | `'plain'` | Surface                                     |
| `classNames`   | `{ header, title, description, actions, content }` |           | Classes for each part                       |

`sectionVariants` is exported. Other `<section>` props (including `ref` and `id`) go to the root.

## Accessibility

- With a `title`, the section is a `region` named by its heading. Without one, give it an `aria-label` or it is a plain section.
- Pick `headingLevel` to keep the page outline in order.

## RTL

Actions sit at the inline end, so on the left in RTL.
