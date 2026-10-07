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

# Fluid type

App screens use Tailwind's fixed type scale. Portal and marketing pages (heroes, landing pages, feature sections) can use the fluid scale instead (R3.4): each step grows smoothly from a 320px to a 1280px wide viewport with `clamp()`. The sizes are mostly `rem`, so they still follow browser zoom.

| Utility           | 320px    | 1280px   | Line height | Use for                       |
| ----------------- | -------- | -------- | ----------- | ----------------------------- |
| `text-fluid-sm`   | 0.875rem | 1rem     | normal      | Small print                   |
| `text-fluid-base` | 1rem     | 1.125rem | normal      | Body text on portal pages     |
| `text-fluid-lg`   | 1.125rem | 1.375rem | normal      | Lead paragraphs               |
| `text-fluid-xl`   | 1.25rem  | 1.75rem  | snug        | Card and sub-section headings |
| `text-fluid-2xl`  | 1.5rem   | 2.25rem  | snug        | Section headings              |
| `text-fluid-3xl`  | 1.875rem | 3rem     | tight       | Page headings                 |
| `text-fluid-4xl`  | 2.25rem  | 3.75rem  | tight       | Hero headings                 |
| `text-fluid-5xl`  | 2.5rem   | 4.5rem   | tight       | Large hero headings           |

```tsx
<h2 className="text-fluid-2xl font-semibold">Popular services</h2>
<p className="text-fluid-lg text-muted-foreground">Apply, pay and track requests online.</p>
```

Each utility sets a matching line height. Under `lang="dv"` the line heights are taller (tight 1.5, snug 1.6, normal 1.8) so Thaana fili are never clipped. The utilities merge with `cn()` as font sizes, so `cn("text-sm", "text-fluid-xl")` keeps only the fluid size.

The values are CSS variables, so a project can retune any step without Tailwind config:

```css
:root {
  --onu-text-fluid-5xl: clamp(3rem, 2rem + 4vw, 6rem);
}
```

Without Tailwind (`@javaabu/onu/styles.css`), use the variables directly: `font-size: var(--fluid-text-3xl); line-height: var(--fluid-leading-tight)`. [Hero](../layout-and-navigation/hero) uses this scale.

# Touch

On touch screens (`pointer: coarse`) buttons, inputs and menu items are at least 44px tall whatever the density. Nothing relies on hover alone, gestures (swipe, drag to dismiss, pinch) always have a button alternative, and fixed bars respect the notch and home indicator (safe-area insets).

Use the `touch:` variant for your own touch-specific styles: `touch:min-h-11`.
