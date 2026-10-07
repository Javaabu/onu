---
title: ThaanaToggle
sidebar_position: 14
---

The button that switches a field between Thaana and Latin typing. Text inputs render it for you with `thaanaToggle`; use it directly with [`useThaanaInput`](../guides/thaana-input) on custom fields.

```tsx
import { ThaanaToggle } from "@javaabu/onu"
import { useThaanaInput } from "@javaabu/onu/thaana"

function MyField() {
  const ref = useRef<HTMLInputElement>(null)
  const { enabled, toggle } = useThaanaInput(ref)
  return (
    <div className="gap-2 flex">
      <input ref={ref} dir={enabled ? "rtl" : "auto"} />
      <ThaanaToggle enabled={enabled} onToggle={toggle} />
    </div>
  )
}
```

| Prop       | Type         | Description                       |
| ---------- | ------------ | --------------------------------- |
| `enabled`  | `boolean`    | Whether Thaana typing is on       |
| `onToggle` | `() => void` | Called when the button is pressed |

The button shows "ދ" when Thaana is on and "A" when Latin is on, exposes its state with `aria-pressed`, and announces each change. It is at least 44px on touch screens.
