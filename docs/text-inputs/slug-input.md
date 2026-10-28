# SlugInput

A slug generator, like `slugInput` in [`@javaabu/js-utilities`](https://github.com/Javaabu/js-utilities). While locked, the slug follows a source value (usually the title). Typing in the slug, or pressing the unlock button, switches to manual editing; the lock button generates it again. A preview shows the full URL.

```tsx
import { SlugInput, TextInput } from "@javaabu/onu"

const [title, setTitle] = useState("")

<FormField label="Title">
  <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
</FormField>
<FormField label="Slug" name="slug">
  <SlugInput source={title} prefix="https://example.mv/news/" />
</FormField>
```

On an edit page, pass the saved slug as `defaultValue` (or `value`). It then starts unlocked, so editing the title does not change a published URL until the user locks it again.

## Thaana titles

Slugs are generated with [`@sindresorhus/slugify`](https://github.com/sindresorhus/slugify). Thaana is transliterated to Latin first using the common Maldivian romanisation, so Dhivehi titles give readable slugs:

| Title                | Slug                  |
| -------------------- | --------------------- |
| މާލެ ސިޓީ ކައުންސިލް | `maale-sitee-kaunsil` |
| ހުޅުމާލެ 2026        | `hulhumaale-2026`     |
| ދިވެހިރާއްޖެ         | `dhivehiraajje`       |

`toSlug(text, { separator })` and `thaanaToLatin(text)` are exported for use elsewhere (for example on the server through a shared module).

## Props

| Prop            | Type                                        | Default                     | Description                              |
| --------------- | ------------------------------------------- | --------------------------- | ---------------------------------------- |
| `source`        | `string`                                    | `""`                        | Text to generate from                    |
| `value`         | `string`                                    |                             | Controlled slug                          |
| `defaultValue`  | `string`                                    |                             | Initial slug                             |
| `onValueChange` | `(slug: string) => void`                    |                             | Called when the slug changes             |
| `auto`          | `boolean`                                   |                             | Controlled locked/automatic state        |
| `defaultAuto`   | `boolean`                                   | `true` when no initial slug | Start locked                             |
| `onAutoChange`  | `(auto: boolean) => void`                   |                             | Called when locking or unlocking         |
| `prefix`        | `string`                                    |                             | URL shown before the slug in the preview |
| `separator`     | `string`                                    | `"-"`                       | Word separator                           |
| `slugify`       | `(text: string) => string`                  | `toSlug`                    | Custom slug function                     |
| `classNames`    | `{ wrapper, root, input, toggle, preview }` |                             | Classes for each part                    |

Other `<input>` props are passed through; `ref` points at the input. When `readOnly`, the lock button is hidden.

## RTL and Thaana

The slug and the preview are always left-to-right. No `thaana` prop: slugs are Latin.

## Accessibility

- The lock button is named "Generate the slug automatically" and exposes the state with `aria-pressed`. Switching between automatic and manual is announced.
- The URL preview is linked to the input with `aria-describedby`.
