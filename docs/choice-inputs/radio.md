---
title: Radio
sidebar_position: 9
---

One radio button with a label, description and, in the card variant, media and an aside. Use it inside a [Radio group](./radio-group); it inherits the group's `variant` and `size`.

```tsx
import { Radio, RadioGroup } from '@javaabu/onu';

<RadioGroup aria-label="Collection" defaultValue="post">
  <Radio value="post" label="Post office" description="Within 3 working days" />
  <Radio value="courier" label="Courier" description="Next working day" />
</RadioGroup>

<RadioGroup aria-label="Plan" variant="card">
  <Radio value="team" label="Team" description="50 users" media={<Icon name="users" />} aside="MVR 450" />
</RadioGroup>
```

## Props

All Radix radio item props (`value`, `disabled`, `id`), plus:

| Prop          | Type                                      | Default | Description               |
| ------------- | ----------------------------------------- | ------- | ------------------------- |
| `label`       | `ReactNode`                               |         | Visible label             |
| `description` | `ReactNode`                               |         | Secondary text            |
| `media`       | `ReactNode`                               |         | Card: icon, logo or image |
| `aside`       | `ReactNode`                               |         | Card: content at the end  |
| `variant`     | `"default" \| "card"`                     | group's |                           |
| `size`        | `"default" \| "lg"`                       | group's |                           |
| `classNames`  | `{ root, label, description, indicator }` |         |                           |

`radioCardVariants` is exported for custom cards.

## Accessibility

Each item is a `radio`, named by its label and described by its description. In the card variant the whole card is the control (no nested interactive content).
