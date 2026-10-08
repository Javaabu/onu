---
title: Theming
sidebar_position: 2
---

# One variable for the brand colour

Set `--onu-primary` to any CSS colour and the whole library follows: buttons, focus rings, links, checked controls, the active sidebar item, tab underlines, selected table rows, the current page, today and selected dates, and the first chart colour. The neutral greys pick up a little of it too (see [Brand tint](#brand-tint)), so hovers, menus, borders and the sidebar read as the same brand.

```css
:root {
    --onu-primary: oklch(0.55 0.15 240);
}
```

Hover and active shades, a subtle tint, and the text colour on top of primary are worked out from it in CSS. Text on primary switches between black and white automatically for contrast (in browsers with relative colour syntax; elsewhere it stays white). Override it with `--onu-primary-foreground` if your brand needs a specific colour.

In dark mode the primary colour is lifted so it keeps its contrast on dark backgrounds. Set `--onu-primary-dark` to choose the dark-mode shade yourself.

# Brand tint

Onu's neutrals are not plain grey: each one is mixed with a small amount of the primary colour in CSS (`color-mix(in oklab, …)`), the way Radix Themes tints its grey scale. Change `--onu-primary` and these follow:

| Token | Used for | Primary mixed in (light / dark) |
|---|---|---|
| `--onu-accent`, `--onu-accent-foreground` | Hovered and highlighted menu, command, select and calendar items; ghost and outline button hovers; pressed toggles | 10% / 16%, text 30% / 15% |
| `--onu-secondary`, `--onu-secondary-foreground` | Secondary buttons and badges (tab counts) | 7% / 10%, text 20% / 10% |
| `--onu-muted`, `--onu-muted-foreground` | Muted surfaces and secondary text | 2% / 6%, text 10% / 8% |
| `--onu-border`, `--onu-input` | Borders and input outlines | 6% / 4%, inputs 10% / 6% |
| `--onu-sidebar`, `--onu-sidebar-accent`, `--onu-sidebar-accent-foreground`, `--onu-sidebar-border` | The app sidebar background, its hovers and border | 3% / 4%, hover 10% / 16% |

The amounts are kept small so text keeps WCAG AA contrast with any reasonable brand colour; dark surfaces take a little more so the tint still shows.

Turn it down or off with `--onu-tint` (a percentage of the amounts above, default `100%`), or with the `data-onu-tint="none"` attribute, on the root or on any element:

```css
:root {
    --onu-tint: 50%; /* half strength; 0% for plain neutral greys */
}
```

```html
<html data-onu-tint="none">
```

Setting a token yourself replaces the tinted value. The neutral starting points are available as `--onu-neutral-<token>` (for example `--onu-neutral-accent`), which is handy for keeping one token grey:

```css
:root {
    --onu-border: var(--onu-neutral-border);
}
```

A token you set on `:root` applies in dark mode too; set it again inside `.dark` for a different dark value.

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
