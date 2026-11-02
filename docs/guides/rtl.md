# RTL

Every Onu component works right-to-left with no extra props.

# Setting the direction

`OnuProvider` takes the direction from the locale (`dv` is RTL) and sets `dir` on `<html>`, so overlays in portals follow it too. Override it with `dir`:

```tsx
<OnuProvider locale="dv">…</OnuProvider>          // RTL
<OnuProvider locale="en" dir="rtl">…</OnuProvider> // RTL with English strings
```

# What changes in RTL

- Layout uses logical properties: start/end instead of left/right.
- Directional icons (arrows, chevrons, back/next, undo/redo, send) mirror; others (play, check, logos) do not.
- Arrow keys follow the visual order in tabs, menus, sliders, carousels and calendars.
- Sliders, progress bars, carousels, steppers, timelines, pagination and time axes run right to left.
- Sidebars and sheets use `side="start" | "end"`, which flips with the direction.

Inputs for Latin-only data (email, URL, phone, numbers, codes, OTP) stay left-to-right inside an RTL page. Free text uses `dir="auto"`, and Thaana fields are RTL.

# Writing your own components

Use Tailwind's logical utilities: `ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end`, `rounded-s-*`/`rounded-e-*`, `border-s`/`border-e`. Onu's ESLint config rejects physical `left`/`right` utilities. For the rare transform that must flip, use the `rtl:` variant: `rtl:-scale-x-100`.

Read the direction with `useDirection()`.
