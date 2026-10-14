---
title: Introduction
sidebar_position: 1.0
---

# Onu

[Onu](https://github.com/Javaabu/onu) is Javaabu's React UI component library. Onu (އޮނު) means _bamboo_ in Dhivehi.

It is built on [shadcn/ui](https://ui.shadcn.com) and [Tailwind CSS](https://tailwindcss.com), and adds what Javaabu projects need out of the box:

- every component works right-to-left, with Dhivehi strings, dates and fonts built in;
- every free-text field can type Thaana from a Latin keyboard;
- one CSS variable, `--onu-primary`, re-themes the whole library;
- dark mode, density modes (compact to touch) and responsive, touch-friendly components;
- WCAG 2.2 AA accessibility;
- Lucide icons by default, with FontAwesome Pro and Iconify adapters.

```tsx
import { FormField, OnuProvider, TextInput } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"

export function NameField() {
  return (
    <OnuProvider locale={dv}>
      <FormField label="ނަން" required>
        <TextInput thaana />
      </FormField>
    </OnuProvider>
  )
}
```

Browse every component and the sample pages in the [examples site](https://javaabu.github.io/onu/).
