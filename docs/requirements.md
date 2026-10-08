---
title: Requirements
sidebar_position: 1.1
---

This package requires:

- [React](https://react.dev) 18.3+ or 19
- [Tailwind CSS](https://tailwindcss.com) 4

Onu supports every browser Tailwind CSS 4 supports: Chrome and Edge 111+, Safari 16.4+, Firefox 128+, and their mobile versions.

Some entry points need extra packages, installed only when you use them:

| Entry point | Install |
|---|---|
| `@javaabu/onu/charts` | `recharts` |
| `@javaabu/onu/maps` | `@vis.gl/react-google-maps terra-draw terra-draw-google-maps-adapter @googlemaps/markerclusterer @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers @deck.gl/google-maps @turf/turf` |
| `@javaabu/onu/editor` | `@tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/static-renderer` and the Tiptap extensions listed in [Rich content](./rich-content) |
| `@javaabu/onu/calendar` | `@fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/list @fullcalendar/interaction` |
| `@javaabu/onu/media` | `react-easy-crop signature_pad barcode-detector yet-another-react-lightbox media-chrome` |
| `@javaabu/onu/export` | `write-excel-file` (only for Excel export; CSV and PDF need nothing) |
| `@javaabu/onu/icons/iconify` | `@iconify/react` and any `@iconify-json/*` collections |
| `@javaabu/onu/icons/fontawesome` | `@fortawesome/fontawesome-svg-core @fortawesome/react-fontawesome` and your FontAwesome icon packages |
| `@javaabu/onu/fonts.css` | `@fontsource-variable/inter @fontsource-variable/jetbrains-mono @fontsource-variable/noto-sans-thaana` |
