---
title: Theming
sidebar_position: 2
---

# One variable for the brand colour

Set `--onu-primary` to any CSS colour and the whole library follows: buttons, focus rings, selected states, the sidebar accent and the first chart colour.

```css
:root {
    --onu-primary: oklch(0.55 0.15 240);
}
```

Hover and active shades, a subtle tint, and the text colour on top of primary are worked out from it in CSS. Text on primary switches between black and white automatically for contrast (in browsers with relative colour syntax; elsewhere it stays white). Override it with `--onu-primary-foreground` if your brand needs a specific colour.

In dark mode the primary colour is lifted so it keeps its contrast on dark backgrounds. Set `--onu-primary-dark` to choose the dark-mode shade yourself.

# Granular tokens

Every token is a CSS variable you can set. The names follow shadcn/ui, prefixed with `--onu-`.

| Group | Tokens |
|---|---|
| Surfaces | `--onu-background`, `--onu-foreground`, `--onu-card`, `--onu-card-foreground`, `--onu-popover`, `--onu-popover-foreground` |
| Neutral | `--onu-secondary`, `--onu-muted`, `--onu-muted-foreground`, `--onu-accent`, `--onu-accent-foreground`, `--onu-border`, `--onu-input`, `--onu-ring` |
| Status | `--onu-destructive`, `--onu-success`, `--onu-warning`, `--onu-info` (each with `-foreground`) |
| Charts | `--onu-chart-1` … `--onu-chart-8` (`--onu-chart-1` defaults to primary) |
| Sidebar | `--onu-sidebar`, `--onu-sidebar-foreground`, `--onu-sidebar-primary`, `--onu-sidebar-accent`, `--onu-sidebar-border` |
| Shape | `--onu-radius` (every radius derives from it; `0` gives square corners) |
| Type | `--onu-font-sans`, `--onu-font-thaana`, `--onu-font-thaana-bold`, `--onu-font-mono`, `--onu-font-serif` |
| Layout | `--onu-label-width`, `--onu-touch-target` |

In Tailwind, use them as `bg-primary`, `text-muted-foreground`, `border-border`, `bg-success`, `fill-chart-3`, `rounded-lg`, `font-thaana`, and so on.

# Scoped themes

To theme part of a page, set tokens on an element together with the `data-onu-theme` attribute, so the derived colours are worked out again there:

```html
<section data-onu-theme style="--onu-primary: oklch(0.63 0.19 32)">
    …
</section>
```

# Tokens file

The defaults live in [`tokens.json`](https://github.com/Javaabu/onu/blob/main/tokens.json) (W3C Design Tokens format). It generates Onu's CSS and the Figma Variables in the Onu Figma kit, so design and code stay in step.
