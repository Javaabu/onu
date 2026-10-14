---
title: Payment method selector
sidebar_position: 15
---

Choose how to pay: **BML Transfer** (bank transfer to a Bank of Maldives account, usually followed by a slip upload) and/or **BML Connect** (BML's online card gateway), as a radio group of large cards with BML's official [logos](./bml-logos) (R16.8). It is **selection only**: redirects, callbacks and slip uploads belong to your app.

```tsx
import { PaymentMethodSelector } from '@javaabu/onu';

<PaymentMethodSelector value={method} onValueChange={setMethod} />

<PaymentMethodSelector
  methods={[
    { id: 'bml-connect', label: { en: 'Pay by card', dv: 'ކާޑުން ފައިސާ ދައްކާ' } },
    'bml-transfer',
    { id: 'cash', label: 'Cash', icon: 'banknote' },
  ]}
  defaultValue="bml-connect"
/>
```

:::info Logos

BML Transfer shows the BML logo and BML Connect the BML Connect logo with the Visa, Mastercard and American Express marks: the official assets supplied by BML, as [`BmlTransferLogo` and `BmlConnectLogo`](./bml-logos). They sit on a white tile in light and dark mode, and are decorative because each card's label names the method. On phones the BML Connect logo is narrower so the label keeps its room. Project-defined methods (such as cash) show a neutral icon (`icon`) unless you pass a `logo`.

:::

## Props

All [Radio group](./radio-group) props except `options`/`variant`, plus:

| Prop                     | Type                                                         | Default | Description                    |
| ------------------------ | ------------------------------------------------------------ | ------- | ------------------------------ |
| `methods`                | `("bml-transfer" \| "bml-connect" \| PaymentMethodConfig)[]` | both    | Which gateways, in this order  |
| `value` / `defaultValue` | `PaymentMethodId`                                            |         |                                |
| `onValueChange`          | `(id) => void`                                               |         |                                |
| `size`                   | `"default" \| "lg"`                                          | `"lg"`  | Large touch targets by default |

```ts
interface PaymentMethodConfig {
  id: "bml-transfer" | "bml-connect" | string // a project-defined method needs a label
  label?: string | { en?: string; dv?: string } // per locale
  description?: string | { en?: string; dv?: string }
  logo?: ReactNode // replaces the default logo or placeholder
  icon?: string // placeholder icon for a project-defined method
  aside?: ReactNode // e.g. a fee
  disabled?: boolean
}
```

Default labels and descriptions come from the `choice` locale namespace in English and Dhivehi.

## Accessibility

A `radiogroup` named "Payment method" (or your FormField label). Arrow keys move between cards (RTL aware); Space selects. Cards are at least 80px tall on touch screens.
