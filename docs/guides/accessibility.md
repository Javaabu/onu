---
title: Accessibility
sidebar_position: 10
---

Onu targets **WCAG 2.2 Level AA** for every component, in light and dark mode and in both directions.

What you get out of the box:

- Widgets follow the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) (built on Radix and React Aria primitives).
- Everything works with the keyboard, with a visible focus ring that is never hidden behind sticky bars.
- Dialogs, sheets and menus trap focus while open and return it to whatever opened them.
- Form fields link labels, help text and errors (`aria-describedby`, `aria-invalid`, `aria-required`); errors and async results are announced in live regions.
- Targets are at least 24×24px, and at least 44×44px on touch screens.
- Colour is never the only signal: statuses, validation and chart series also use icons, text or patterns.
- Animations are turned off for users who prefer reduced motion.
- Charts and maps have text alternatives (data tables, marker lists, coordinates).
- `lang` is set on Dhivehi and English content so screen readers switch voice.

What you still need to do:

- Give every control a label (a `FormField`, a `<label>`, or `aria-label`).
- Give meaningful icons a `label`, and images real `alt` text.
- Add a [`SkipLink`](../layout-and-navigation/skip-link) at the top of each layout.
- Keep your own colours to the token palette, or check their contrast.

Each component's docs page lists its keyboard interactions. Onu's tests run [axe](https://github.com/dequelabs/axe-core) on every component, and the web app is scanned in CI.
