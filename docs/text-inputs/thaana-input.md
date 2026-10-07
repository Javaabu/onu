---
title: ThaanaInput
sidebar_position: 13
---

`ThaanaInput` and `ThaanaTextarea` are [`TextInput`](./text-input) and [`Textarea`](./textarea) with Thaana typing on and the Thaana/Latin toggle shown by default.

```tsx
import { ThaanaInput, ThaanaTextarea } from '@javaabu/onu';

<FormField label="ނަން">
    <ThaanaInput />
</FormField>

<ThaanaTextarea thaana={{ keymap: 'phonetic-hh' }} thaanaToggle={false} />
```

They accept every prop of the component they wrap. `thaana` takes keyboard options only (it cannot be turned off).

For the keyboard itself, including using it on your own elements, see the [Thaana input guide](../guides/thaana-input).
