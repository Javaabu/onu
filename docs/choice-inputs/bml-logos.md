# BML logos

Bank of Maldives' official logos, supplied by BML, as React components (R16.8). [`PaymentMethodSelector`](./payment-method-selector.md) shows them by default; use them anywhere else a payment method is shown, such as a checkout summary or a receipt.

- **`BmlTransferLogo`**: the BML logo (the red square). Use it for **BML Transfer**, bank transfers to a Bank of Maldives account.
- **`BmlConnectLogo`**: the BML Connect ("BML Payment Gateway") logo with the Visa, Mastercard and American Express marks. Use it for **BML Connect** card payments.

```tsx
import { BmlConnectLogo, BmlTransferLogo } from "@javaabu/onu"

<BmlTransferLogo className="size-8" />
<BmlConnectLogo className="h-8 rounded-md bg-white p-1" />

// Next to text that already names the method
<span className="flex items-center gap-2">
  <BmlConnectLogo decorative className="h-5 rounded-sm bg-white p-0.5" />
  BML Connect (Visa •••• 4242)
</span>
```

## Props

Both take every `<svg>` prop, plus:

| Prop         | Type      | Default                                    | Description                                                   |
| ------------ | --------- | ------------------------------------------ | ------------------------------------------------------------- |
| `title`      | `string`  | `"Bank of Maldives"` / `"BML Connect"`     | Accessible name (`role="img"`)                                |
| `decorative` | `boolean` | `false`                                    | Hide from assistive technology when visible text names it too |
| `className`  | `string`  | `size-10` / `h-10 w-auto`                  | Size with `size-*` or `h-*`; the artwork keeps its proportions |

## Accessibility

- Each logo is an image (`role="img"`) named by `title`: "Bank of Maldives" or "BML Connect".
- When visible text next to the logo already names the method, pass `decorative` so screen readers don't hear the name twice (`aria-hidden="true"`, no role).
- The logos are not interactive; put them inside the control (radio card, button, link) that names the choice.

## Light and dark

The BML Connect logo's card marks (the Mastercard wordmark and the Visa blue) need a light surface. On dark backgrounds put the logo on a white tile, for example `className="rounded-md bg-white p-1"`. `PaymentMethodSelector` uses a white tile for both logos in light and dark mode. The BML logo carries its own white margin and reads on any background.

## Notes

- The artwork is BML's, unchanged: only editor metadata was removed when inlining it. Gradient and clip ids are generated per instance, so several logos can share a page.
- The "BML Payment Gateway" wordmark is live text in Gilroy Bold, as in BML's file. Onu does not load Gilroy, so it falls back to the system's bold sans-serif (close metrics, a slightly different letterform). Load Gilroy in your app to match the original exactly. The wordmark always runs left to right, also on RTL pages.
- Do not recolour, crop or redraw the logos; follow BML's branding guidelines.
