# ColorPicker

A colour picker built on React Aria's colour components. The trigger shows the swatch and hex value; the panel has a saturation/brightness area, a hue slider, a hex field and preset swatches. It opens in a popover on larger screens and as a bottom sheet on phones (R3.28). The value is a lowercase hex string.

```tsx
import { ColorPicker } from "@javaabu/onu"

const [colour, setColour] = useState<string | null>("#1f7a4d")

<FormField label="Brand colour" name="colour">
  <ColorPicker value={colour} onValueChange={setColour} />
</FormField>

<ColorPicker presets={["#0f766e", "#0369a1", "#7c3aed"]} />
<ColorPicker presets={[]} />  // no swatches
```

## Props

| Prop                                    | Type                                                | Default                  | Description                             |
| --------------------------------------- | --------------------------------------------------- | ------------------------ | --------------------------------------- |
| `value`                                 | `string \| null`                                    |                          | Controlled hex value                    |
| `defaultValue`                          | `string \| null`                                    | `null`                   | Initial value                           |
| `onValueChange`                         | `(hex: string) => void`                             |                          | Called with `#rrggbb`                   |
| `presets`                               | `string[]`                                          | `DEFAULT_COLOUR_PRESETS` | Swatches; `[]` hides them               |
| `placeholder`                           | `string`                                            | "No colour"              | Trigger text when empty                 |
| `name`                                  | `string`                                            |                          | Submit the hex value via a hidden input |
| `open` / `defaultOpen` / `onOpenChange` |                                                     |                          | Control the panel                       |
| `classNames`                            | `{ trigger, panel, area, slider, field, swatches }` |                          | Classes for each part                   |

Other `<button>` props (`disabled`, `aria-*`) go to the trigger. Also exported: `toHex(value)`, which normalises any CSS colour string to `#rrggbb`.

## RTL and Thaana

The hex value is always left-to-right; React Aria follows the active locale for slider direction. No `thaana` prop.

## Accessibility

- The trigger is a button with `aria-haspopup="dialog"`, labelled by its `FormField`. Focus returns to it when the panel closes.
- The area is a 2D slider ("Saturation and brightness"), the hue is a slider, and the presets are a listbox of named swatches ("vibrant red"), all from React Aria.

| Key                                                             | Action                         |
| --------------------------------------------------------------- | ------------------------------ |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the trigger              | Open the panel                 |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> in the area | Change saturation / brightness |
| <kbd>←</kbd> / <kbd>→</kbd> on the hue slider                   | Change hue                     |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd>                       | Larger steps                   |
| Arrow keys in the swatches                                      | Move between presets           |
| <kbd>Esc</kbd>                                                  | Close the panel                |
