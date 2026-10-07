---
title: Custom attribute fields
sidebar_position: 6
---

Renders form fields from a schema, for custom attributes, settings or product specs, using Onu's inputs. Values go in and out as one object, input names follow Laravel's `attributes[key]` convention, and server errors map back to the right field.

```tsx
import { CustomAttributeFields, type AttributeField } from "@javaabu/onu/editor"

const schema: AttributeField[] = [
  { name: "name", label: "Property name", type: "text", required: true },
  { name: "name_dv", label: "ނަން", type: "text", thaana: true },
  { name: "island", label: "Island", type: "select", options: ["Malé", "Hulhumalé", "Maafushi"] },
  { name: "bedrooms", label: "Bedrooms", type: "number", min: 0 },
  { name: "amenities", label: "Amenities", type: "multiselect", options: ["Pool", "Jetty"] },
  { name: "furnished", label: "Furnished", type: "boolean" },
]

export const Example = (
  <CustomAttributeFields schema={schema} name="attributes" columns={2} value={values} onChange={setValues} />
)
```

## Field types

| `type`                     | Control                  | Value            | Posted as                           |
| -------------------------- | ------------------------ | ---------------- | ----------------------------------- |
| `text`                     | Text input (`thaana` ok) | `string`         | `attributes[key]`                   |
| `textarea`                 | Textarea (`thaana` ok)   | `string`         | `attributes[key]`                   |
| `number`                   | Number input             | `number \| null` | `attributes[key]`                   |
| `email`, `url`, `tel`      | Input, forced LTR        | `string`         | `attributes[key]`                   |
| `date`, `time`, `datetime` | Native date/time input   | `string` (ISO)   | `attributes[key]`                   |
| `color`                    | Colour input             | `string`         | `attributes[key]`                   |
| `select`                   | Select                   | `string`         | `attributes[key]`                   |
| `radio`                    | Radio group              | `string`         | `attributes[key]`                   |
| `multiselect`              | Checkbox group           | `string[]`       | `attributes[key][]` (one per value) |
| `boolean`                  | Switch                   | `boolean`        | `attributes[key]` = `1` or `0`      |

Options are strings or `{ value, label, disabled? }`.

Field keys: `name`, `label`, `type`, `options`, `required`, `help`, `placeholder`, `disabled`, `defaultValue`, `min`, `max`, `step`, `maxLength`, `thaana`, `fullWidth`.

## Errors

Laravel's 422 errors work as they come, either through a surrounding `FormErrorsProvider` or the `errors` prop:

```tsx
<CustomAttributeFields schema={schema} name="attributes" errors={response.errors} />
// { "attributes.name": ["The name field is required."] }
```

## Props

| Prop           | Type                    | Default      | Description                              |
| -------------- | ----------------------- | ------------ | ---------------------------------------- |
| `schema`       | `AttributeField[]`      |              | Fields, in order                         |
| `value`        | `AttributeValues`       |              | Controlled values                        |
| `defaultValue` | `AttributeValues`       |              | Initial values                           |
| `onChange`     | `(values) => void`      |              | Called with all values                   |
| `name`         | `string`                |              | Wraps input names: `name[key]`           |
| `errors`       | `FormErrors`            |              | Server errors keyed by dot notation      |
| `columns`      | `1 \| 2`                | `1`          | Two columns from medium container widths |
| `labelLayout`  | `'stacked' \| 'inline'` | form default | Label layout for every field             |
| `disabled`     | `boolean`               | `false`      | Disable every field                      |
| `classNames`   | `{ field, control }`    |              | Classes for each field and control       |

## RTL, Thaana and accessibility

Every field is a [`FormField`](../form-scaffolding/form-field): labelled, with help and errors wired through `aria-describedby`, `aria-invalid` and `aria-required`. Radio and checkbox groups are labelled by the field label. Latin-only types (email, URL, phone, number, colour) stay LTR; text fields use `dir="auto"` or Thaana. Two-column layouts stack in narrow containers, and choice targets are 44px on touch screens.
