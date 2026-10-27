---
title: Theming
sidebar_position: 2
---

# The default look

Onu's default theme pairs a Proton Mail-style app shell with Ant Design 5 content elements:

- **Brand**: Proton purple `#6d4aff` (`oklch(0.562 0.251 283.7)`).
- **Content** (Ant Design): 14px text on a 22px line, 32px controls, 6px control corners and 8px cards and popups, `#f0f0f0` splits and `#d9d9d9` field borders, a `#fafafa` table header, plain (untinted) greys, and text at Ant's `rgba(0,0,0,.88)` / `.65`.
- **Shell** (Proton): a warm-grey `#f5f4f2` sidebar and header (`#16141c` Carbon in dark mode) around the white content panel, exposed as the `--onu-shell*` tokens.
- **Elevation**: borders and tonal surfaces; only popups (menus, selects, popovers, dialogs) cast a subtle shadow.
- **Dark mode**: Ant's dark algorithm for content (`#1f1f1f` surfaces, `#303030` / `#424242` borders, `#141414` layout grey).

Everything below is a token, so a project can move away from any of it.

# One variable for the brand colour

Set `--onu-primary` to any CSS colour and the whole library follows: buttons, focus rings, links, checked controls, the active sidebar item, tab ink bars, selected table rows, the current page, today and selected dates, and the first chart colour.

```css
:root {
    --onu-primary: oklch(0.55 0.15 240);
}
```

Hover and active shades and the text colour on top of primary are worked out from it in CSS. Text on primary switches between black and white automatically for contrast (in browsers with relative colour syntax; elsewhere it stays white). Override it with `--onu-primary-foreground` if your brand needs a specific colour.

In dark mode the primary colour is lifted so it keeps its contrast on dark backgrounds. Set `--onu-primary-dark` to choose the dark-mode shade yourself.

## Colour steps

Like Ant Design's palette, eight steps are derived from the primary colour with `color-mix(in oklab, …)`. Use them as `bg-primary-1`, `border-primary-3`, `text-primary-7` and so on.

| Step | Light | Dark | Used for |
|---|---|---|---|
| `--primary-1` (= `--primary-subtle`) | 10% primary on the background | 16% | Selected rows, selected options, tinted tags, filter chips, the bulk bar, pressed toggles |
| `--primary-2` | 22% | 26% | Hovered selected rows |
| `--primary-3` | 40% | 42% | Borders of tinted surfaces |
| `--primary-4`, `--primary-5` | 60%, 80% | 60%, 80% | Hovered field and default-button borders (5) |
| `--primary-6` | primary | primary | Fills, ink bars, focus |
| `--primary-7` | 14% darker | 20% lighter | Link and hovered-button text; active (pressed) fills in light mode |
| `--primary-8` (= `--primary-subtle-foreground` in light mode) | 30% darker | 38% lighter | Text on tinted surfaces |

# Brand tint

Onu's neutrals can be mixed with a small amount of the primary colour in CSS (`color-mix(in oklab, …)`), the way Radix Themes tints its grey scale. It is **off by default** (`--onu-tint: 0%`), which gives Ant Design's plain greys. Turn it on and these follow `--onu-primary`:

| Token | Used for | Primary mixed in (light / dark) |
|---|---|---|
| `--onu-accent`, `--onu-accent-foreground` | Hovered and highlighted menu, command, select and calendar items; ghost and outline button hovers; pressed toggles | 10% / 16%, text 30% / 15% |
| `--onu-secondary`, `--onu-secondary-foreground` | Secondary buttons and badges (tab counts) | 7% / 10%, text 20% / 10% |
| `--onu-muted`, `--onu-muted-foreground` | Muted surfaces and secondary text | 2% / 6%, text 10% / 8% |
| `--onu-border`, `--onu-input` | Borders and input outlines | 6% / 4%, inputs 10% / 6% |
| `--onu-sidebar`, `--onu-sidebar-accent`, `--onu-sidebar-accent-foreground`, `--onu-sidebar-border` | The app sidebar background, its hovers and border | 3% / 4%, hover 10% / 16% |

The amounts are kept small so text keeps WCAG AA contrast with any reasonable brand colour; dark surfaces take a little more so the tint still shows.

Set the strength with `--onu-tint` (a percentage of the amounts above; the default is `0%`, from `tokens.json`), on the root or on any element. The `data-onu-tint="none"` attribute turns it off again for part of a page:

```css
:root {
    --onu-tint: 100%; /* the full brand tint; 50% for half */
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
| App shell | `--onu-shell`, `--onu-shell-foreground`, `--onu-shell-border`, `--onu-shell-field`, `--onu-shell-hover`, `--onu-shell-active`, `--onu-shell-weak` (see [App shell tokens](#app-shell-tokens)) |
| Layout grey | `--onu-layout` (Ant's `colorBgLayout`: the grey page behind dashboard cards) |
| Preset colours | `--onu-preset-{blue,cyan,green,red,gold}` with `-border` and `-foreground` (see [Preset colours](#preset-colours)) |
| Elevation | `--onu-shadow-popup` (the one shadow: menus, selects, popovers, dialogs) |
| Shape | `--onu-radius` (every radius derives from it; `0` gives square corners) |
| Type | `--onu-font-sans`, `--onu-font-thaana`, `--onu-font-thaana-bold`, `--onu-font-mono`, `--onu-font-serif`, `--onu-font-size` (body, 14px), `--onu-line-height` (1.5714, 22px) |
| Layout | `--onu-label-width`, `--onu-touch-target` |

Charts draw areas and bars with a soft gradient in these colours by default, so they rebrand with the theme too. Use `<ChartStyleProvider gradient={false}>` (from `@javaabu/onu/charts`) or a chart's `gradient={false}` for flat fills; see [CategoryChart](../charts/category-chart#gradient-fills).

In Tailwind, use them as `bg-primary`, `text-muted-foreground`, `border-border`, `bg-success`, `fill-chart-3`, `bg-shell`, `bg-layout`, `bg-preset-green`, `shadow-popup`, `rounded-lg`, `font-thaana`, and so on.

## Shape

`--onu-radius` defaults to `0.375rem` (6px). The radius utilities derive from it: `rounded-sm` ≈ 4px (tags, menu items), `rounded-md` ≈ 5px, `rounded-lg` 6px (buttons, fields), `rounded-xl` 8px (cards, popups, dialogs).

## Type

Body text is 14px on a 22px line (`--onu-font-size`, `--onu-line-height`), Ant Design's base size; `text-sm` uses the same 22px line. Dhivehi text keeps its taller 1.75 line height. The `touch` density raises the body size to 16px.

## App shell tokens

The `--onu-shell*` tokens describe the area around the content panel (Proton's sidebar and header). Layout components use them; use them yourself as `bg-shell`, `text-shell-foreground`, `border-shell-border`, `bg-shell-field`, `hover:bg-shell-hover`, `bg-shell-active` and `bg-shell-weak`.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--onu-shell` | `#f5f4f2` | `#16141c` | Sidebar and header background |
| `--onu-shell-foreground` | `#1f1f1f` | `#ffffff` | Text on the shell |
| `--onu-shell-border` | `#e5e3e0` | `#343140` | Lines on the shell, the content panel's edge |
| `--onu-shell-field` | `#ffffff` | `#292733` | Fields on the shell (the header search) |
| `--onu-shell-hover` | `rgb(194 193 192 / 20%)` | `rgb(91 87 107 / 20%)` | Hovered nav items and header buttons |
| `--onu-shell-active` | `rgb(194 192 190 / 35%)` | `rgb(91 87 107 / 40%)` | The current nav item |
| `--onu-shell-weak` | `#eae7e4` | `#3f3b4c` | Weak fills on the shell: progress tracks, avatar tiles |

## Preset colours

Ant Design's preset colours, for tags and status badges: a tinted fill, a matching border and a text shade with AA contrast on that fill, in light and dark mode. [StatusBadge](../display-and-feedback/status-badge) maps its tones to them (info blue, pending cyan, success green, danger red, warning gold), and [Tag](../display-and-feedback/tag) takes them as `color`.

| Token | Light (fill / border / text) | Dark (fill / border / text) |
|---|---|---|
| `--onu-preset-blue` | `#e6f4ff` / `#91caff` / `#0958d9` | `#111a2c` / `#15325b` / `#65a9f3` |
| `--onu-preset-cyan` | `#e6fffb` / `#87e8de` / `#006d75` | `#112123` / `#144848` / `#33bcb7` |
| `--onu-preset-green` | `#f6ffed` / `#b7eb8f` / `#237804` | `#162312` / `#274916` / `#6abe39` |
| `--onu-preset-red` | `#fff1f0` / `#ffa39e` / `#a8071a` | `#2a1215` / `#58181c` / `#f37370` |
| `--onu-preset-gold` | `#fffbe6` / `#ffe58f` / `#874d00` | `#2b2111` / `#594214` / `#e8b339` |

Each has `-border` and `-foreground` variants, e.g. `--onu-preset-green-border`.

# App shell and page layout

The default app layout is Proton Mail's shell around Ant Design's content: [`AppLayout`](../layout-and-navigation/app-layout) paints the sidebar, the header and the frame on the **shell colour** and the page on a white panel with a rounded top-start corner; [`PageTitle`](../layout-and-navigation/page-title) is Ant's PageHeader band, [`ListingPage`](../listing-pages/listing-page) the ProTable card layout and [`StatTile`](../charts/stat-tile) the ChartCard.

The shell reads these semantic tokens. Onu's theme defines them from the `--onu-shell*` and `--onu-layout` tokens (see [App shell tokens](#app-shell-tokens)); the components also carry Proton's values as fallbacks:

| Token | Used for | Fallback (light / dark) |
|---|---|---|
| `--shell`, `--shell-foreground` | Sidebar, header and frame; text on them | `#f5f4f2` / `#16141c`; `--foreground` |
| `--shell-border` | The panel's top and start line, the quota meter line | `#e5e3e0` / `#343140` |
| `--shell-field` | The header search field | `#ffffff` / `#292733` |
| `--shell-hover`, `--shell-active` | Sidebar items and header buttons | warm greys at 20% / 35% (light), Carbon greys at 20% / 40% (dark) |
| `--shell-weak` | The quota track, the account avatar tile | `#eae7e4` / `#3f3b4c` |
| `--layout` | The panel with `background="layout"` (dashboards of cards) | `#f5f5f5` / `#141414` |

For the previous look, use `<AppLayout variant="flat">`: the content fills the body, the header is bordered and the sidebar keeps the `--onu-sidebar` colours.

# Scoped themes

To theme part of a page, set tokens on an element together with the `data-onu-theme` attribute, so the derived colours are worked out again there:

```html
<section data-onu-theme style="--onu-primary: oklch(0.63 0.19 32)">
    …
</section>
```

# Tokens file

The defaults live in [`tokens.json`](https://github.com/Javaabu/onu/blob/main/tokens.json) (W3C Design Tokens format). It generates Onu's CSS and the Figma Variables in the Onu Figma kit, so design and code stay in step.
