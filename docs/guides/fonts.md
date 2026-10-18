---
title: Fonts
sidebar_position: 9
---

Onu's optional font pack. Install the three Latin and fallback fonts it loads from npm, then import it after `tailwind.css`:

```bash
npm install @fontsource-variable/inter @fontsource-variable/jetbrains-mono @fontsource-variable/noto-sans-thaana
```

```css
@import "@javaabu/onu/fonts.css";
```

`fonts.css` imports these packages, so without them the CSS build fails with "Can't resolve '@fontsource-variable/inter'". Faruma and MV Faseyha need nothing extra: they ship inside `@javaabu/onu`.

| Role | Font | Source |
|---|---|---|
| Interface | Inter | `@fontsource-variable/inter` |
| Thaana text | **Faruma** | bundled with Onu |
| Thaana headings and bold | **MV Faseyha** | bundled with Onu |
| Thaana fallback | Noto Sans Thaana | `@fontsource-variable/noto-sans-thaana` |
| Code, IDs, keys | JetBrains Mono | `@fontsource-variable/jetbrains-mono` |

Optional presets in `@javaabu/onu/fonts-optional.css`: Geist (set `data-font="geist"` on an element) and Source Serif 4 for long-form reading (`font-serif`). It needs `npm install @fontsource-variable/geist @fontsource-variable/source-serif-4`.

All of these are self-hosted from npm, so no requests go to a font CDN.

# Thaana fonts

Onu ships Faruma and MV Faseyha with `fonts.css`, as `woff2` files subset to Thaana and its punctuation (about 12 kB each). Their `unicode-range` means a browser only downloads them when a page shows Thaana text, and Latin text in a mixed sentence stays in Inter.

- **Faruma** is used for Dhivehi body text (`--onu-font-thaana`).
- **MV Faseyha** is used for Dhivehi headings and `<b>`/`<strong>` (`--onu-font-thaana-bold`). Both fonts have a single weight and Onu turns off faux bold for Dhivehi, so emphasis uses the second face instead.
- Characters neither font covers fall back to Noto Sans Thaana.

If you don't import `fonts.css`, the same names still apply to copies installed on the device.

# Mixed Dhivehi and English

Font stacks list a Latin font and then a Thaana font. Because each font only covers its own script, a sentence that mixes Dhivehi and English uses the right font for each part automatically.

# Your own fonts

```css
:root {
    --onu-font-sans: "My Sans", Faruma, sans-serif;
    --onu-font-thaana: "My Thaana", Faruma, sans-serif;
    --onu-font-thaana-bold: "My Thaana Bold", "MV Faseyha", sans-serif;
}
```

Numbers in tables, stat tiles, pagination and timers use tabular figures so they line up.
