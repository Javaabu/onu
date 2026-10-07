---
title: Fonts
sidebar_position: 9
---

Onu's optional font pack:

```css
@import "@javaabu/onu/fonts.css";
```

| Role | Font | Source |
|---|---|---|
| Interface | Inter | `@fontsource-variable/inter` |
| Thaana | **MV Waheed** | your project (see below) |
| Thaana fallback | Noto Sans Thaana | `@fontsource-variable/noto-sans-thaana` |
| Code, IDs, keys | JetBrains Mono | `@fontsource-variable/jetbrains-mono` |

Optional presets in `@javaabu/onu/fonts-optional.css`: Geist (set `data-font="geist"` on an element) and Source Serif 4 for long-form reading (`font-serif`).

All of these are self-hosted from npm, so no requests go to a font CDN.

# MV Waheed

MV Waheed is the default Thaana font. Its files are not bundled with Onu until redistribution rights are confirmed, so add it to your project:

```css
@font-face {
    font-family: "MV Waheed";
    src: url("/fonts/mv-waheed.woff2") format("woff2");
    font-display: swap;
    unicode-range: U+0780-07BF, U+FDF2, U+060C, U+061B, U+061F;
}
```

The `unicode-range` means the font only downloads when a page shows Thaana text. Without it, Thaana falls back to Faruma (if installed on the device) and then Noto Sans Thaana.

MV Waheed has a single weight, so Onu turns off faux bold for Dhivehi text. To use a heavier face for bold Thaana, set `--onu-font-thaana-bold`.

# Mixed Dhivehi and English

Font stacks list a Latin font and then a Thaana font. Because each font only covers its own script, a sentence that mixes Dhivehi and English uses the right font for each part automatically.

# Your own fonts

```css
:root {
    --onu-font-sans: "My Sans", "MV Waheed", sans-serif;
    --onu-font-thaana: "Faruma", sans-serif;
}
```

Numbers in tables, stat tiles, pagination and timers use tabular figures so they line up.
