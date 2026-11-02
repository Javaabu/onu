# LiveRegion

An `aria-live` region: screen readers read its text whenever it changes, without moving focus. Use it for status that changes while the user stays where they are: "3 results", "Saved", "2 of 5 files uploaded". It is visually hidden by default; set `visible` to show the same text on screen.

```tsx
import { LiveRegion } from "@javaabu/onu"

// Hidden: only screen readers hear it
<LiveRegion>{copied ? t("input.copied") : null}</LiveRegion>

// A visible status line whose changes are announced
<LiveRegion role="status" visible as="p" className="text-sm text-muted-foreground">
  {done} of {total} files uploaded
</LiveRegion>

// Interrupts: only for errors that need attention now
<LiveRegion politeness="assertive">{error}</LiveRegion>
```

To announce a message from an event handler (and repeat the same message), use [`useAnnouncer`](./use-announcer.md), which renders a `LiveRegion` for you.

## Props

| Prop         | Type                                                   | Default                                        | Description                                                               |
| ------------ | ------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------- |
| `politeness` | `"polite" \| "assertive"`                              | `"polite"` (`"assertive"` with `role="alert"`) | `polite` waits until the screen reader is idle; `assertive` interrupts it |
| `atomic`     | `boolean`                                              | `true`                                         | Read the whole region on every change, not just the part that changed     |
| `role`       | `"status" \| "alert" \| "log" \| "timer" \| "marquee"` |                                                | Optional ARIA role (see below)                                            |
| `as`         | `"span" \| "div" \| "p"`                               | `"span"`                                       | Element to render; a `span` can sit inside a button or a paragraph        |
| `visible`    | `boolean`                                              | `false`                                        | Show the text on screen instead of hiding it with `sr-only`               |
| `children`   | `ReactNode`                                            |                                                | The current message; render `null` or `""` when there is nothing to say   |

Every other `<div>` prop (`id`, `className`, `lang`, …) is passed through. The element has `data-slot="live-region"`.

## Accessibility

- **Keep it mounted.** Screen readers watch regions that are already on the page. A region that mounts together with its text is often not read, so render the `LiveRegion` empty and change its children. Conditionally rendering the whole region (`{error && <LiveRegion>…`) defeats it.
- **Polite by default.** `assertive` cuts off whatever the user is hearing; keep it for errors that block them. `role="alert"` makes the region assertive unless you set `politeness`.
- **Roles.** A role is optional: `aria-live` alone is enough. `role="status"` lets assistive technology list the region as the page's status; leave it out when the page already has other `status` regions (a spinner, a toast), so tests and tools that look one up by role find the right one.
- **Short and specific.** Announce the result ("Row moved to position 3 of 8"), not the action ("Moving…"). Translate the text and keep it in the page's language.
- **Repeating a message.** Setting the same text again is not a change, so it is not read again. [`useAnnouncer`](./use-announcer.md) clears and re-sets it for you.
