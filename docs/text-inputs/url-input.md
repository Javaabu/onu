# UrlInput

A URL input. It sets `type="url"`, `inputMode="url"` and `autocomplete="url"`, is always left-to-right, and adds `https://` when the user leaves the field without a scheme (`javaabu.com` → `https://javaabu.com`). Built on [`TextInput`](./text-input.md).

```tsx
import { UrlInput } from "@javaabu/onu"

<UrlInput placeholder="example.mv" />
<UrlInput showIcon />
<UrlInput defaultProtocol={false} placeholder="/news/ferry-schedule" />
```

The protocol is added the way a user would type it (a native input event), so `onChange`, controlled state and `react-hook-form` all see the new value.

## Props

| Prop              | Type                                    | Default      | Description                                      |
| ----------------- | --------------------------------------- | ------------ | ------------------------------------------------ |
| `defaultProtocol` | `string \| false`                       | `"https://"` | Added on blur when missing; `false` turns it off |
| `showIcon`        | `boolean`                               | `false`      | Show a link icon at the inline start             |
| `classNames`      | `{ root, input, startAddon, endAddon }` |              | Classes for each part                            |

All other `<input>` props are passed through. Also exported: `normalizeUrl(value, protocol?)`.

## RTL and Thaana

Always `dir="ltr"` (R11.7). No `thaana` prop.

## Accessibility

Label it with a `FormField`, `<label>` or `aria-label`. Errors from the `FormField` are linked with `aria-describedby`.
