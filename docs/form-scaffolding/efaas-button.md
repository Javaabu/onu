---
title: eFaas button
sidebar_position: 20.5
---

The **Sign in with eFaas** button, styled after the [eFaas brand guide](https://efaas.egov.mv/Home/Branding) (R16.7). Pass it to [`SignInForm`](./auth-forms)'s `efaas` slot or use it on its own. With `href` it is a plain link, so the browser does a full-page redirect to your eFaas login route (never a client-side Inertia or Next visit); without `href` it is a button.

```tsx
import { EfaasButton, SignInForm } from "@javaabu/onu"
import efaasIcon from "./efaas-icon.svg" // from eFaas's brand kit

<SignInForm
  onSubmit={login}
  efaas={<EfaasButton href="/login/efaas" logo={<img src={efaasIcon} alt="" />} fullWidth />}
/>

<EfaasButton intent="register" href="/register/efaas" logo={<img src={efaasIcon} alt="" />} />
<EfaasButton variant="white" iconOnly href="/login/efaas" logo={<img src={efaasIcon} alt="" />} />
```

## Props

Every `<a>` prop (with `href`) or `<button>` prop (without), plus:

| Prop        | Type                             | Default     | Description                                                                 |
| ----------- | -------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `href`      | `string`                         |             | Render a plain link to your eFaas redirect route                            |
| `intent`    | `"sign-in" \| "register"`        | `"sign-in"` | "Sign in with eFaas" or "Register with eFaas" (translated)                  |
| `variant`   | `"blue" \| "black" \| "white"`   | `"blue"`    | eFaas colour variation                                                      |
| `size`      | `"default" \| "lg"`              | `"default"` | 40px (44px on touch screens) or 48px tall                                   |
| `shape`     | `"rounded" \| "square"`          | `"rounded"` | Corner style                                                                |
| `logo`      | `ReactNode`                      |             | The eFaas icon from eFaas's brand kit; sized to the button and decorative   |
| `iconOnly`  | `boolean`                        | `false`     | Only the icon (needs `logo`); the wording stays as the accessible name      |
| `fullWidth` | `boolean`                        | `false`     | Stretch to the container                                                    |
| `loading`   | `boolean`                        | `false`     | Spinner and "Redirecting to eFaas…"; clicks are ignored                     |
| `children`  | `ReactNode`                      |             | Replace the label (keep eFaas's wording)                                    |

## Branding

What the button follows from the eFaas brand guide:

- **Colours**: only the eFaas palette. Blue `#164998` with white text (default), black `#333333` with white text, and white with blue text and a grey `#d0d2d3` border. No custom button colours. Do not put the black button on dark backgrounds; use `white` there.
- **Typeface**: Poppins Medium for the label, Mv Waheed for Dhivehi. Onu does not load either font: load them in your app to match the guide; otherwise the app's sans-serif (or Thaana font) is used.
- **Wording**: "Sign in with eFaas" / "Register with eFaas", and `eFaas އިން ސައިން އިން ކުރައްވާ` / `eFaas އިން ރަޖިސްޓަރ ކުރައްވާ` in Dhivehi.
- **Layout**: the icon and label keep their order and position. Only the corners (`shape`) and the side padding (via `className`) may change.
- **Clear space**: keep the protected zone the guide defines around the button (X/2 on its grid) free of other graphics and text. Under `SignInForm` the "or" divider provides it.

:::warning Logo
Onu does not draw the eFaas logomark (R16.7: assets come from eFaas, not invented). Download the icon from eFaas's brand kit and pass it as `logo`; without it the button shows the wording only.
:::

:::caution Not verified against the guide
The guide could not be opened while this component was built. The palette, typeface, wording and layout rules above come from the guide's published text; the exact button heights, icon size, white-variant text colour, the fourth colour variation and the clear-space measurement still need to be checked against [efaas.egov.mv/Home/Branding](https://efaas.egov.mv/Home/Branding).
:::

## Accessibility

A link or button named by its wording (also when `iconOnly`). The logo is decorative. The focus ring shows on every variant, the button is at least 44px tall on touch screens, and `loading` sets `aria-busy` and announces "Redirecting to eFaas…" as the name.
