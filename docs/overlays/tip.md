# Tip

A **tooltip** that also works on touch screens. With a mouse it shows on hover, with a keyboard on focus, and on touch screens on a tap or a long press, because nothing may depend on hover alone (R3.26). Built on shadcn's `Tooltip`; the primitive parts are also exported.

```tsx
import { Button, Icon, Tip } from "@javaabu/onu"

// An ⓘ button labelled "More information" (tap to show on touch).
<Tip content="A 10% service charge applies to bookings made in resorts." />

// Describe a control. It has its own action, so on touch the tip opens with a long press.
<Tip content="Print receipt">
  <Button size="icon" aria-label="Print receipt" onClick={print}>
    <Icon name="print" />
  </Button>
</Tip>
```

:::caution
A tip must never be the only place for information. Repeat anything important in visible text, and give icon buttons an `aria-label` (the tip adds a description, not a name).
:::

## Touch behaviour

| `touch`      | On touch screens                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------- |
| `tap`        | A tap toggles the tip (default for the ⓘ button and plain triggers)                                |
| `long-press` | A tap runs the trigger's action; a 0.5s press shows the tip (default when the child has `onClick`) |

Tapping elsewhere or pressing <kbd>Escape</kbd> closes it.

## Props

| Prop                                  | Type                    | Default  | Description                          |
| ------------------------------------- | ----------------------- | -------- | ------------------------------------ |
| `content`                             | `ReactNode`             |          | Tip text (required)                  |
| `children`                            | `ReactElement`          | ⓘ button | Trigger; must accept a ref and props |
| `touch`                               | `'tap' \| 'long-press'` | auto     | How the tip opens on touch           |
| `delayDuration`                       | `number`                | `300`    | Hover delay in ms                    |
| `disabled`                            | `boolean`               | `false`  | Render only the trigger              |
| `open`, `defaultOpen`, `onOpenChange` |                         |          | Open state                           |
| `side`, `align`, `sideOffset`, …      |                         |          | Radix `Tooltip.Content` props        |
| `className`                           | `string`                |          | Classes for the tip                  |

## Accessibility

- The tip has `role="tooltip"` and describes the trigger (`aria-describedby`) while open.
- The default ⓘ trigger is a real button with a translated label and a 44px touch target on coarse pointers.

| Key               | Action                    |
| ----------------- | ------------------------- |
| <kbd>Tab</kbd>    | Focus the trigger to show |
| <kbd>Escape</kbd> | Hide                      |

## RTL and Dhivehi

The "More information" label is translated, and `side="left"` / `"right"` follow Radix's physical sides; prefer `top` / `bottom`.
