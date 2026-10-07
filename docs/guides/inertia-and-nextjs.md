---
title: Inertia & Next.js
sidebar_position: 13
---

Onu is plain React, so it works in Vite apps, Laravel + Inertia (React) and Next.js.

# Links

Components that render links (link buttons, breadcrumbs, side navigation, pagination, nav tabs, …) use the link component you give `OnuProvider`:

```tsx
// Inertia
import { Link } from '@inertiajs/react';
<OnuProvider linkComponent={Link}>…</OnuProvider>

// Next.js
import Link from 'next/link';
<OnuProvider linkComponent={Link}>…</OnuProvider>
```

Or pass your own element to a single component with `asChild`.

# Next.js App Router

Every Onu component file is marked `"use client"`, so you can import them from Server Components. Put `ThemeProvider` and `OnuProvider` in a client layout component, and add `themeScript()` to `<head>` to avoid a theme flash:

```tsx
// app/layout.tsx
import { themeScript } from '@javaabu/onu';

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
```

# Inertia validation errors

Inertia puts Laravel's validation errors in `usePage().props.errors`. Pass them to `FormErrorsProvider` (or `Form`'s `errors`) and every field with a matching `name` shows its message:

```tsx
const { errors } = usePage().props;

<FormErrorsProvider errors={errors}>
    <FormField label="Email" name="email">
        <TextInput />
    </FormField>
</FormErrorsProvider>
```
