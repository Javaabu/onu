# eFaas logo

The 22 official eFaas logos from eFaas's brand kit, unchanged, as one component. Pick a logo by its number in the kit (`Efaas Logos SVG-01` … `-22`). [`EfaasButton`](./efaas-button.md) uses these through its `logoVariant` prop.

```tsx
import { EfaasLogo, EFAAS_LOGO_VARIANTS } from "@javaabu/onu"

<EfaasLogo />                                  // 1: blue horizontal English logo
<EfaasLogo variant={2} className="h-12" />     // blue horizontal Dhivehi logo
<EfaasLogo variant={18} decorative />          // white logo for dark backgrounds, next to text naming eFaas

EFAAS_LOGO_VARIANTS[16] // { layout: "tagline", language: "en", colour: "white", background: "dark" }
```

| # | Layout | Wordmark | Colour | Made for |
| --- | --- | --- | --- | --- |
| 1 | Horizontal | English | Blue | Light backgrounds |
| 2 | Horizontal | Dhivehi | Blue | Light backgrounds |
| 3 | With tagline | English | Blue | Light backgrounds |
| 4 | With tagline | Dhivehi | Blue | Light backgrounds |
| 5 | Stacked, with tagline | English | Blue | Light backgrounds |
| 6 | Stacked, with tagline | Dhivehi | Blue | Light backgrounds |
| 7 | Horizontal | English | Black | Light backgrounds |
| 8 | Horizontal | Dhivehi | Black | Light backgrounds |
| 9 | Icon | | Blue tile | Light backgrounds |
| 10 | Icon | | Black tile | Light backgrounds |
| 11 | Icon | | White tile, blue mark | Dark backgrounds |
| 12 | Horizontal | Dhivehi | White, black mark | Dark backgrounds |
| 13 | Horizontal | Dhivehi | White, blue mark | Dark backgrounds |
| 14 | Icon | | White tile, black mark | Dark backgrounds |
| 15 | Icon | | White tile, blue mark | Dark backgrounds |
| 16 | With tagline | English | White | Dark backgrounds |
| 17 | Horizontal | Dhivehi | White | Dark backgrounds |
| 18 | Horizontal | English | White | Dark backgrounds |
| 19 | With tagline | Dhivehi | White, blue mark | Dark backgrounds |
| 20 | With tagline | Dhivehi | White, black mark | Dark backgrounds |
| 21 | Stacked, with tagline | Dhivehi | White | Dark backgrounds |
| 22 | Stacked, with tagline | English | White | Dark backgrounds |

## Props

Every `<svg>` prop, plus:

| Prop         | Type      | Default   | Description                                                            |
| ------------ | --------- | --------- | ---------------------------------------------------------------------- |
| `variant`    | `1`–`22`  | `1`       | Which official logo (table above)                                      |
| `title`      | `string`  | `"eFaas"` | Accessible name                                                        |
| `decorative` | `boolean` | `false`   | Hide from assistive technology when visible text already names eFaas   |
| `className`  | `string`  | `h-10 w-auto` | Size with a height class; the width follows the logo's proportions |

## Loading

The five icon marks are bundled with the component (about 3 kB compressed). The logos with a wordmark load on first use from a separate chunk (about 40 kB compressed). While it loads, the logo keeps its size, so nothing shifts. On the server, a wordmark logo renders as that empty, correctly sized box and fills in on the client.

## Brand rules

The artwork is eFaas's, unchanged: the generator (`scripts/build-efaas-logos.mjs`) only turns each file's style classes into fill attributes, so several logos can share a page. Don't recolour, stretch or redraw the logos, and use the variant made for the background (blue or black on light, white on dark).

## Accessibility

An image (`role="img"`) named "eFaas", or hidden (`aria-hidden`) when `decorative`. Inside `EfaasButton` the logo is always decorative and the button is named by its wording.
