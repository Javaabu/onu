# AppSwitcher

The app switcher next to the logo, like Proton's grid button: a menu of the products in a suite, each on a brand-tinted tile. Put it in the [`AppSidebar`](./app-sidebar.md) header beside the `Logo`.

```tsx
import { AppSidebar, AppSwitcher, Logo } from "@javaabu/onu"

;<AppSidebar
  groups={groups}
  header={
    <div className="flex items-center justify-between gap-2">
      <Logo src="/logo.svg" alt="" text="Atoll Records" href="/" />
      <AppSwitcher
        label="Atoll apps"
        apps={[
          { label: "Records", href: "/records", icon: "file-text", current: true },
          { label: "Payments", href: "/payments", icon: "credit-card" },
          { label: "Help centre", href: "https://help.example.mv", icon: "help", external: true },
        ]}
      />
    </div>
  }
/>
```

The button hides when the sidebar is collapsed to icons.

## Props

| Prop           | Type                                               | Default        | Description                    |
| -------------- | -------------------------------------------------- | -------------- | ------------------------------ |
| `apps`         | `{ label, href, icon?, current?, external? }[]`    |                | The apps                       |
| `label`        | `ReactNode`                                        | "Apps"         | Heading at the top of the menu |
| `triggerLabel` | `string`                                           | "Switch app"   | Accessible name of the button  |
| `align`        | `'start' \| 'center' \| 'end'`                     | `'start'`      | Menu alignment                 |
| `className`    | `string`                                           |                | Classes for the button         |
| `classNames`   | `{ trigger, content, item, tile }`                 |                | Classes for each part          |

## Accessibility

- A 36px icon button (44px on touch screens) with a translated name, opening a Radix dropdown menu.
- The current app has `aria-current="page"`; tiles are decorative. External apps open in a new tab with a screen-reader note.

| Key                                       | Action                  |
| ----------------------------------------- | ----------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd>       | Open the menu           |
| <kbd>↑</kbd> / <kbd>↓</kbd>                | Move between apps       |
| <kbd>Escape</kbd>                         | Close the menu          |

## RTL

The menu opens towards the content and the labels are right-aligned in RTL.
