---
title: Design & density
sidebar_position: 1
---

Onu's look follows shadcn/ui's current style: neutral surfaces, subtle borders, sparing shadows and colour used for emphasis. The same components work for admin panels, public portals, learning platforms and kiosks; density modes adapt them.

# Density modes

| Mode | Use for | Effect |
|---|---|---|
| `compact` | Data-heavy tables and grids | Tighter spacing (about 10% smaller) |
| `default` | Admin forms and pages | Standard shadcn sizing |
| `comfortable` | Public and citizen portals, LMS | More generous spacing |
| `touch` | Kiosks | Large targets (buttons ≥ 44px) and larger text |

Set it for the whole app or for part of a page:

```tsx
<OnuProvider density="comfortable">…</OnuProvider>

<Density value="compact">
    <DataTable … />
</Density>
```

Density scales Tailwind's spacing unit, so every size in a subtree follows: paddings, gaps, heights and icon sizes.

# Responsive

Every component works from 320px phones to large screens. Many adapt to the space they are in (container queries) rather than the screen size, so a form in a narrow sidebar stacks even on a wide monitor. Built-in patterns include tables that become labelled cards on phones, filter panels that become bottom sheets, sidebars that become drawers, and save bars that become bottom bars.

# Touch

On touch screens (`pointer: coarse`) buttons, inputs and menu items are at least 44px tall whatever the density. Nothing relies on hover alone, gestures (swipe, drag to dismiss, pinch) always have a button alternative, and fixed bars respect the notch and home indicator (safe-area insets).

Use the `touch:` variant for your own touch-specific styles: `touch:min-h-11`.
