---
title: ButtonGroup
sidebar_position: 19
---

Groups related buttons. By default the buttons are joined into one segmented control (shadcn's button group); `attached={false}` keeps them separate with a gap and lets them wrap.

```tsx
import { Button, ButtonGroup } from "@javaabu/onu"

<ButtonGroup label="View">
  <Button variant="outline" size="icon" aria-label="List view" startIcon="list" />
  <Button variant="outline" size="icon" aria-label="Grid view" startIcon="grid" />
</ButtonGroup>

<ButtonGroup attached={false}>
  <Button variant="outline">Cancel</Button>
  <Button>Save</Button>
</ButtonGroup>
```

`ButtonGroupText` and `ButtonGroupSeparator` come from shadcn and work inside an attached group. The shadcn primitive is still available from `@javaabu/onu/primitives`.

## Props

| Prop          | Type                         | Default      | Description                   |
| ------------- | ---------------------------- | ------------ | ----------------------------- |
| `attached`    | `boolean`                    | `true`       | Join the buttons              |
| `orientation` | `'horizontal' \| 'vertical'` | `horizontal` | Direction                     |
| `label`       | `string`                     |              | Accessible name for the group |

All `<div>` props are passed through.

## Accessibility

Renders `role="group"`; give it a `label` when the purpose isn't clear from the buttons. Each button is its own tab stop.

## RTL

Joined edges use logical radii, so the rounded ends swap sides in RTL.
