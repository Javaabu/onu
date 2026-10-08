---
title: AddressInput
sidebar_position: 10
---

Structured Maldivian address fields: **atoll**, **island**, **road** and **house/building name**, with an optional map pin.

```tsx
import { AddressInput } from "@javaabu/onu/maps"

;<AddressInput name="address" islands={islands} pin required />
```

Submits `address[atoll]`, `address[island]`, `address[road]`, `address[house]` and, with `pin`, `address[location][lat]` / `address[location][lng]`. Laravel errors for `address.atoll` etc. are picked up from `FormErrorsProvider`.

- The atoll list is built in (`MALDIVES_ATOLLS`: the 20 administrative atolls plus Malé City, with codes, Dhivehi names and approximate centres).
- Pass `islands` (`{ value, label, dvLabel?, atoll, position? }[]`, usually from your API) to choose the island from a list filtered by atoll; picking an island sets its atoll. Without it the island is a text field.
- With `pin`, the map follows the chosen island or atoll until a pin is placed.

Verified on the real Google Maps JavaScript API (see [MapProvider](./map-provider#verified-against-google-maps-js-api)): clicking the pin map sets `location` and places the pin.

## Props

| Prop                                  | Type                                                                                          | Default   | Description                                       |
| ------------------------------------- | --------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------- |
| `value` / `defaultValue` / `onChange` | `MaldivesAddress`                                                                             | `{}`      | `{ atoll?, island?, road?, house?, location? }`   |
| `name`                                | `string`                                                                                      |           | Field name prefix                                 |
| `islands`                             | `AddressIsland[]`                                                                             |           | Island options                                    |
| `pin`                                 | `boolean`                                                                                     | `false`   | Map pin picker                                    |
| `search`                              | `boolean \| PlaceSearch`                                                                      | `false`   | Place search for the pin                          |
| `thaana`                              | `boolean \| ThaanaOptions`                                                                    |           | Thaana typing in road, house and free-text island |
| `required`, `disabled`                | `boolean`                                                                                     |           | Atoll and island required; disables the fieldset  |
| `errors`                              | `Partial<Record<"atoll" \| "island" \| "road" \| "house" \| "location", string \| string[]>>` |           | Errors per part                                   |
| `legend`                              | `ReactNode \| null`                                                                           | "Address" | Group heading (`null` hides it visually)          |
| `labelLayout`                         | `"stacked" \| "inline"`                                                                       |           | Label layout for the fields                       |
| `className`, `classNames`             | `{ legend, grid, field, map }`                                                                |           | Overrides                                         |

## Accessibility

A `fieldset` with a `legend`; every field is a labelled `FormField` with error wiring. Selects are native, so they work with every keyboard and screen reader and open the platform picker on phones.

## RTL and Thaana

Atoll and island labels follow the locale (e.g. "ކ. މާލޭ އަތޮޅު"). Set `thaana` to type road and house names in Thaana.
