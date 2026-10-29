---
"@javaabu/onu": minor
---

`KeyboardKey`, `KeyboardKeyProps`, `KeyPlatform`, `detectPlatform` and `formatShortcut` are removed, with the `display.key*` strings. `ActionMenu` and `CommandPalette` keep formatting their own `shortcut` hints. To show keys in text, use the `Kbd` primitive:

```tsx
import { Kbd, KbdGroup } from "@javaabu/onu/primitives"

;<p>
  Press{" "}
  <KbdGroup>
    <Kbd>Ctrl</Kbd>
    <Kbd>K</Kbd>
  </KbdGroup>{" "}
  to search.
</p>
```
