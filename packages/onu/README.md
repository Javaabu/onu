# @javaabu/onu

> **Onu** (އޮނު) means _bamboo_ in Dhivehi.

Javaabu's React UI component library, built on [shadcn/ui](https://ui.shadcn.com) and Tailwind CSS v4.

- **RTL and Dhivehi first**: every component works in `dir="rtl"`, with Dhivehi strings, dates and fonts built in.
- **Thaana keyboard input** on every free-text field, phonetic (JTK-compatible) or typewriter layout.
- **One variable re-themes everything**: `--onu-primary`. Granular tokens for everything else.
- **Dark mode**, **density modes** (compact → touch) and **responsive, touch-friendly** components.
- **Accessible**: WCAG 2.2 AA, tested with axe.
- **Lucide icons** by default, with **FontAwesome Pro** and Iconify adapters.

Every component and the sample pages: [onu.on-forge.com](https://onu.on-forge.com).

## Install

```bash
npm install @javaabu/onu
# optional font pack (Inter, JetBrains Mono, Noto Sans Thaana; Faruma and MV Faseyha are bundled)
npm install @fontsource-variable/inter @fontsource-variable/jetbrains-mono @fontsource-variable/noto-sans-thaana
```

```css
/* app.css */
@import "tailwindcss";
@import "@javaabu/onu/tailwind.css";
@import "@javaabu/onu/fonts.css"; /* optional font pack: needs the packages above */
```

```tsx
import { Button, OnuProvider, ThemeProvider } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"

export function App() {
  return (
    <ThemeProvider>
      <OnuProvider locale={dv}>
        <Button>ސޭވްކުރޭ</Button>
      </OnuProvider>
    </ThemeProvider>
  )
}
```

Re-theme with one variable:

```css
:root {
  --onu-primary: oklch(0.55 0.15 240);
}
```

## Docs

The docs ship with the package, as Markdown that matches the installed version:

- `node_modules/@javaabu/onu/llms.txt`: setup and the rules for writing Onu code, then every component, hook and guide with one line on what it is for
- `node_modules/@javaabu/onu/docs/<group>/<name>.md`: one page per component, with its props and accessibility notes

Point your AI coding assistant at `llms.txt`, or use the MCP server [`@javaabu/onu-mcp`](https://www.npmjs.com/package/@javaabu/onu-mcp).

## License

MIT © Javaabu Pvt. Ltd.
