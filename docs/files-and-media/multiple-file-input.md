# MultipleFileInput

A [`FileInput`](./file-input.md) for several files: each pick adds to the list (duplicates are skipped), every file has a remove button, and an optional hint shows the limits with a live count ("3 of 5").

```tsx
import { MultipleFileInput } from "@javaabu/onu"

;<FormField label="Tender documents">
  <MultipleFileInput accept=".pdf,.xlsx,.docx" maxFiles={5} maxSize={10 * 1024 * 1024} />
</FormField>
```

When `maxFiles` is reached the picker is disabled until a file is removed; extra files from one pick are rejected with "x.pdf was not added: only 5 files are allowed."

## Props

Takes every [`FileInput`](./file-input.md) prop except `multiple` and `append` (always on), plus:

| Prop         | Type      | Default | Description                                     |
| ------------ | --------- | ------- | ----------------------------------------------- |
| `showLimits` | `boolean` | `true`  | Show "Up to 5 files · 10 MB max each" and count |

## Accessibility

The count is announced politely as it changes. See [`FileInput`](./file-input.md) for the keyboard table.

## RTL and Dhivehi

As for `FileInput`; the limits hint uses plural rules for both locales.
