# UsageMeter

A quota meter for the bottom of the sidebar, like Proton's storage meter: a labelled bar with "used / total", an optional link (e.g. to upgrade) and a small note such as the app version. It is built on [`ProgressBar`](../loading/progress-bar.md), so the value is announced and the bar fills from the inline start.

```tsx
import { AppSidebar, UsageMeter } from "@javaabu/onu"

;<AppSidebar
  groups={groups}
  footer={
    <UsageMeter
      label="Records quota"
      icon="file-archive"
      value={1284}
      max={2000}
      link={{ label: "Get more space", href: "/billing" }}
      meta="v5.0.42"
    />
  }
/>
```

## Behaviour

- The value reads "1,284 / 2,000" in the active locale's digits; pass `formatValue` for other text (e.g. `(v, m) => \`${v} GB of ${m} GB\``).
- The bar is the brand colour, turns `warning` from 80% and `destructive` from 95% so a nearly full quota stands out. Set `color` to fix it.
- A line above separates it from the navigation; the track uses the shell's weak grey so it reads on the sidebar and on cards.

## Props

| Prop          | Type                                                    | Default             | Description                              |
| ------------- | ------------------------------------------------------- | ------------------- | ---------------------------------------- |
| `label`       | `ReactNode`                                             |                     | What is being used                       |
| `icon`        | `string \| ReactNode`                                   |                     | Semantic icon name or node before it     |
| `value`       | `number`                                                |                     | Amount used                              |
| `max`         | `number`                                                |                     | The quota                                |
| `formatValue` | `(value, max) => string`                                | "used / total"      | Value text (also read by screen readers) |
| `color`       | `ProgressBar` colour                                    | by how full it is   | Bar colour                               |
| `link`        | `{ label, href, external? }`                            |                     | A link under the bar                     |
| `meta`        | `ReactNode`                                             |                     | Small text at the end of the bottom row  |
| `classNames`  | `{ bar, label, value, footer, link, meta }`             |                     | Classes for each part                    |

Other `<div>` props go to the root.

## Accessibility

- The bar is a `progressbar` named by the label, with `aria-valuenow`, `aria-valuemax` and the value text.
- The link goes through the configured link component and has a 44px target on touch screens.

## RTL

The bar fills from the right in RTL; the link and note swap sides.
