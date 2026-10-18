# ThaanaToggle

The button that switches a field between Thaana and Latin typing. Text inputs render it for you with `thaanaToggle`; use it directly with [`useThaanaInput`](../guides/thaana-input.md) on custom fields.

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

## Props

| Prop        | Type         | Default | Description                       |
| ----------- | ------------ | ------- | --------------------------------- |
| `enabled`   | `boolean`    |         | Whether Thaana typing is on       |
| `onToggle`  | `() => void` |         | Called when the button is pressed |
| `className` | `string`     |         | Merged with the button's classes  |

Every other `<button>` prop (such as `disabled`) is passed through. The button is always `type="button"`, so it never submits a form.

## Accessibility

- A toggle button: its state is `aria-pressed` (`true` while Thaana is on) and its name is "Switch between Thaana and Latin typing" (translated, `thaana.toggle`). The visible "ދ" / "A" is `aria-hidden`; the tooltip adds the shortcut, <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>.
- Each change is announced through a polite [`LiveRegion`](../accessibility/live-region.md): "Thaana typing on" / "Latin typing on" (`thaana.on` / `thaana.off`), so the shortcut is heard too.
- Pressing it with the mouse does not take focus away from the field, so users keep typing where they were. It works with <kbd>Enter</kbd> and <kbd>Space</kbd> like any button.
- At least 44×44px on touch screens.
