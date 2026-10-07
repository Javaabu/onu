---
title: PhoneInput
sidebar_position: 9
---

An international phone number input built on [`react-phone-number-input`](https://gitlab.com/catamphetamine/react-phone-number-input) (libphonenumber). It formats the number as you type, defaults to the Maldives (+960), has a searchable country picker built from Onu's `Popover` and `Command`, and returns an [E.164](https://en.wikipedia.org/wiki/E.164) value such as `+9607771234`.

```tsx
import { PhoneInput } from "@javaabu/onu"

const [phone, setPhone] = useState<string | undefined>()

<FormField label="Mobile number" name="phone">
  <PhoneInput value={phone} onValueChange={setPhone} />
</FormField>
```

Validate on the server; `isValidPhoneNumber` from `react-phone-number-input` is handy for client-side checks.

## Props

| Prop                 | Type                                              | Default | Description                                            |
| -------------------- | ------------------------------------------------- | ------- | ------------------------------------------------------ |
| `value`              | `string`                                          |         | Controlled E.164 value                                 |
| `defaultValue`       | `string`                                          |         | Initial E.164 value                                    |
| `onValueChange`      | `(value?: string) => void`                        |         | Called with the E.164 value, or `undefined` when empty |
| `defaultCountry`     | `Country`                                         | `"MV"`  | Country for numbers typed without `+`                  |
| `countries`          | `Country[]`                                       | all     | Limit the country list                                 |
| `countrySelect`      | `boolean`                                         | `true`  | Show the country picker                                |
| `allowInternational` | `boolean`                                         | `false` | Add an "International" choice                          |
| `international`      | `boolean`                                         |         | Always use the international format (`+960 777 1234`)  |
| `onCountryChange`    | `(country?: Country) => void`                     |         | Called when the country changes                        |
| `classNames`         | `{ root, input, countryTrigger, countryContent }` |         | Classes for each part                                  |

Other `<input>` props (`placeholder`, `disabled`, `autoComplete`, …) go to the number input, and `ref` points at it.

## RTL and Thaana

The whole field, country picker included, is forced `dir="ltr"` (R11.7). No `thaana` prop. Country names come from `Intl.DisplayNames` in the active locale, falling back to English.

## Accessibility

- The number input has `type="tel"`, `inputMode="tel"` and `autocomplete="tel"`.
- The country button is named "Country: Maldives" and opens a searchable list (cmdk listbox). Search by country name, code (`MV`) or calling code (`+960`).
- Focus returns to the country button when the list closes.

| Key                                                       | Action                 |
| --------------------------------------------------------- | ---------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the country button | Open the country list  |
| Type                                                      | Filter countries       |
| <kbd>↑</kbd> / <kbd>↓</kbd>                               | Move through countries |
| <kbd>Enter</kbd>                                          | Choose a country       |
| <kbd>Esc</kbd>                                            | Close the list         |
