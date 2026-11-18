# OtpInput

A one-time code input built on shadcn's `input-otp`. It shows one slot per character, uses the numeric keyboard on phones, sets `autocomplete="one-time-code"` so iOS and Android offer the code from SMS, accepts pasted codes (spaces and dashes are removed), and can submit its form when the code is complete.

```tsx
import { OtpInput } from "@javaabu/onu"

<form onSubmit={verify}>
  <FormField label="Verification code" help="Sent by SMS to +960 777-1234">
    <OtpInput value={code} onValueChange={setCode} autoSubmit />
  </FormField>
</form>

<OtpInput length={4} size="lg" onComplete={(code) => verify(code)} />
<OtpInput groupSize={3} />                    // 123–456
<OtpInput length={8} groupSize={4} alphanumeric />
```

## Sizes

`size="sm" | "default" | "lg"` sets the slot size (variants exported as `otpSlotVariants`). Slots are at least 44px on touch screens.

## Props

| Prop            | Type                               | Default     | Description                               |
| --------------- | ---------------------------------- | ----------- | ----------------------------------------- |
| `length`        | `number`                           | `6`         | Number of characters                      |
| `groupSize`     | `number`                           |             | Split slots into groups with a separator  |
| `value`         | `string`                           |             | Controlled value                          |
| `defaultValue`  | `string`                           | `""`        | Initial value                             |
| `onValueChange` | `(value: string) => void`          |             | Called on every change                    |
| `onComplete`    | `(code: string) => void`           |             | Called when every slot is filled          |
| `autoSubmit`    | `boolean`                          | `false`     | Submit the surrounding form when complete |
| `alphanumeric`  | `boolean`                          | `false`     | Allow letters (uses the text keyboard)    |
| `size`          | `"sm" \| "default" \| "lg"`        | `"default"` | Slot size                                 |
| `classNames`    | `{ root, group, slot, separator }` |             | Classes for each part                     |

Other `<input>` props (`name`, `disabled`, `aria-*`) go to the underlying input, and `ref` points at it. Also exported: `cleanOtpPaste(text)`.

## RTL and Thaana

The slots are always left-to-right, so codes read the same as in the SMS. No `thaana` prop.

## Accessibility

- A single real `<input>` holds the code, so screen readers read it as one field. It is labelled by its `FormField`, or "One-time code" from the locale when there is no label.
- Errors from the `FormField` set `aria-invalid` on the input and outline every slot.

| Key                                       | Action                        |
| ----------------------------------------- | ----------------------------- |
| Digits                                    | Fill the next slot            |
| <kbd>Backspace</kbd>                      | Delete the previous character |
| <kbd>←</kbd> / <kbd>→</kbd>               | Move between slots            |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>V</kbd> | Paste a whole code            |
