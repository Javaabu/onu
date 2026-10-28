# ConditionalDisplay

Shows/hides or enables/disables part of a form depending on another field's value. A React port of `conditionalDisplay` from Javaabu's js-utilities. Hidden content is wrapped in a `disabled` fieldset, so its fields are **not submitted**.

```tsx
import { ConditionalDisplay } from "@javaabu/onu"

// react-hook-form: pass control + name and the value is watched for you
<ConditionalDisplay control={control} name="applicant_type" when="company">
  <FormField label="Company name" name="company_name">
    <TextInput {...register("company_name")} />
  </FormField>
</ConditionalDisplay>

// Any value (state, watch(), props)
<ConditionalDisplay value={type} when={["company", "ngo"]}>…</ConditionalDisplay>

// Enable instead of show
<ConditionalDisplay control={control} name="has_vehicle" action="enable">…</ConditionalDisplay>
```

## Matching

- `when` omitted: matches any non-empty value (not `""`, `"0"`, `0`, `false`, `null` or `[]`), e.g. a ticked checkbox.
- `when` a value or a list: compared as strings, so `1` matches `"1"`. Array field values (checkbox groups, multi-selects) match if any item matches.
- `when` a function: `(value) => boolean`.
- `not` inverts the match.

## Actions

| `action`         | Matches           | Doesn't match     |
| ---------------- | ----------------- | ----------------- |
| `show` (default) | visible, enabled  | hidden, disabled  |
| `hide`           | hidden, disabled  | visible, enabled  |
| `enable`         | visible, enabled  | visible, disabled |
| `disable`        | visible, disabled | visible, enabled  |

## Props

| Prop      | Type                                        | Default   | Description                                          |
| --------- | ------------------------------------------- | --------- | ---------------------------------------------------- |
| `value`   | `unknown`                                   |           | Value to test                                        |
| `control` | `Control`                                   |           | react-hook-form control (with `name`)                |
| `name`    | `FieldPath`                                 |           | Field to watch (needs `control` or a `FormProvider`) |
| `when`    | `value \| value[] \| (value) => boolean`    | non-empty | Condition                                            |
| `not`     | `boolean`                                   | `false`   | Invert                                               |
| `action`  | `'show' \| 'hide' \| 'enable' \| 'disable'` | `'show'`  | What a match does                                    |
| `unmount` | `boolean`                                   | `false`   | Unmount hidden children instead of hiding them       |

The wrapper is a `<fieldset>` with `display: contents`, `data-slot="conditional-display"` and `data-state="enabled|disabled|hidden"`. `matchesCondition()` and `resolveConditional()` are exported.

:::info react-hook-form
A natively disabled fieldset stops the browser from submitting the fields. react-hook-form reads values from its own state, so also skip hidden fields in your schema (e.g. zod `.optional()` with a refinement on the controlling field) or use `shouldUnregister`.
:::

## Accessibility

Hidden content uses the `hidden` attribute, so it is removed from the accessibility tree; disabled content is announced as disabled.
