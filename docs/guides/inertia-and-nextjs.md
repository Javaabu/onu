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

Every Onu component file is marked `"use client"`, so Server Components can render Onu components directly, as long as every prop is serialisable (strings, numbers, elements). Anything that takes a function (`onSubmit`, `onChange`, `linkComponent`) belongs in a `"use client"` file.

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

Because the package is a client module, `themeScript()` can't be called from a Server Component. Render it from a small client component instead, which puts the script in the server-rendered HTML:

```tsx
// components/theme-script.tsx
'use client';

import { themeScript } from '@javaabu/onu';

export function ThemeScript() {
    return <script dangerouslySetInnerHTML={{ __html: themeScript() }} suppressHydrationWarning />;
}
```

```tsx
// app/layout.tsx (a Server Component)
export default async function RootLayout({ children }) {
    const locale = (await cookies()).get('locale')?.value === 'dv' ? 'dv' : 'en';
    return (
        <html lang={locale} dir={locale === 'dv' ? 'rtl' : 'ltr'} suppressHydrationWarning>
            <head>
                <ThemeScript />
            </head>
            <body>
                <Providers locale={locale}>{children}</Providers>
            </body>
        </html>
    );
}
```

# Starter templates

The repository has two complete starters, built and tested in CI against the current library:

- [`templates/nextjs`](https://github.com/Javaabu/onu/tree/main/templates/nextjs): the setup above, a page of Onu components rendered by a Server Component, an English / Dhivehi switch, a form backed by a Server Action, and a check that the server-rendered HTML contains Onu's markup.
- [`templates/laravel-inertia-react`](https://github.com/Javaabu/onu/tree/main/templates/laravel-inertia-react): Laravel with Inertia, React and TypeScript, an `AppLayout` / `AppSidebar` admin shell, an English / Dhivehi switch stored in the session, and a form that shows Laravel's validation errors, with feature tests.

Each template's README shows how to copy it and use the npm package.

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
