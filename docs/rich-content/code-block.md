---
title: Code block
sidebar_position: 4
---

Read-only code with [Shiki](https://shiki.style) syntax highlighting, a language label, a copy button and optional line numbers. Shiki is loaded lazily on first use, and code is always laid out left-to-right, even on RTL pages.

```tsx
import { CodeBlock } from '@javaabu/onu/editor';

<CodeBlock code={source} language="php" />
<CodeBlock code={source} language="tsx" title="app/page.tsx" lineNumbers highlightLines={[3, 4]} />
<CodeBlock code="MVR 1,250.00" />  {/* plain text */}
```

Light and dark mode use two Shiki themes at once (GitHub light/dark by default) through CSS variables, so switching theme needs no re-highlighting. Token colours from any theme are darkened (light mode) or lightened (dark mode) just enough to reach 4.5:1 contrast on the code background, including highlighted lines, so the block meets WCAG 2.2 AA whichever themes you pick.

## Props

| Prop             | Type                                      | Default           | Description                            |
| ---------------- | ----------------------------------------- | ----------------- | -------------------------------------- |
| `code`           | `string`                                  |                   | The code                               |
| `language`       | `string`                                  |                   | Shiki language id; omit for plain text |
| `title`          | `ReactNode`                               | language name     | Caption, e.g. a file name              |
| `lineNumbers`    | `boolean`                                 | `false`           | Show line numbers                      |
| `startLine`      | `number`                                  | `1`               | First line number                      |
| `highlightLines` | `number[]`                                |                   | Lines to highlight                     |
| `copyable`       | `boolean`                                 | `true`            | Show the copy button                   |
| `wrap`           | `boolean`                                 | `false`           | Wrap long lines instead of scrolling   |
| `hideHeader`     | `boolean`                                 | `false`           | Hide label and copy button             |
| `themes`         | `{ light: string; dark: string }`         | GitHub light/dark | Shiki themes                           |
| `classNames`     | `{ header, pre, line, lineNumber, copy }` |                   | Classes for each part                  |

Other `<figure>` props go to the root. `highlightCode(code, language, themes)` is exported for custom renderers.

## Accessibility

- The code area is a focusable, labelled region, so it can be scrolled with the keyboard.
- Line numbers are hidden from screen readers.
- The copy button is labelled "Copy code" and announces "Code copied".
- Syntax colours meet 4.5:1 contrast on the code background in light and dark mode.
