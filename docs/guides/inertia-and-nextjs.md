---
title: Inertia & Next.js
sidebar_position: 13
---

Onu is plain React (React 19), so it works in Vite apps, Laravel + Inertia (React) and Next.js.

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

# Laravel + Inertia

Wrap the app in `TooltipProvider` (a collapsed `AppSidebar` shows its labels as tooltips) and pass Inertia's `Link` as `linkComponent`. Inertia's `Link` types its `onClick` for any element rather than an anchor, so TypeScript needs a cast:

```tsx
import { Link } from '@inertiajs/react';
import { OnuProvider, TooltipProvider, type LinkComponent } from '@javaabu/onu';

<OnuProvider locale={usePage().props.locale} linkComponent={Link as LinkComponent}>
    <TooltipProvider>…</TooltipProvider>
</OnuProvider>
```

Render `<html lang dir>` from the Blade root view so right-to-left pages are correct before React loads.

# Next.js App Router

Every Onu module that needs the browser (state, effects, context) is marked `"use client"`, so Server Components can render Onu components directly, as long as every prop is serialisable (strings, numbers, elements). Anything that takes a function (`onSubmit`, `onChange`, `linkComponent`) belongs in a `"use client"` file. Pure helpers are not client modules, so Server Components can call them: `cn`, `themeScript`, `createTranslator`, `mergeMessages`, the `/thaana` conversion functions (`transliterate`, `containsThaana`) and the `/export` builders (`toCsv`).

Put `ThemeProvider`, `OnuProvider` and `TooltipProvider` in a client component, and render the layout's `<html lang dir>` on the server so right-to-left pages are correct in the first HTML:

```tsx
// components/providers.tsx
'use client';

import { OnuProvider, ThemeProvider, TooltipProvider } from '@javaabu/onu';
import Link from 'next/link';

export function Providers({ locale, children }) {
    return (
        <ThemeProvider>
            <OnuProvider locale={locale} linkComponent={Link}>
                <TooltipProvider>{children}</TooltipProvider>
            </OnuProvider>
        </ThemeProvider>
    );
}
```

Call `themeScript()` in the layout's `<head>` to apply the stored theme before the first paint:

```tsx
// app/layout.tsx (a Server Component)
import { themeScript } from '@javaabu/onu';

export default async function RootLayout({ children }) {
    const locale = (await cookies()).get('locale')?.value === 'dv' ? 'dv' : 'en';
    return (
        <html lang={locale} dir={locale === 'dv' ? 'rtl' : 'ltr'} suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
            </head>
            <body>
                <Providers locale={locale}>{children}</Providers>
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
