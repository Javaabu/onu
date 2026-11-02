# Style overrides

Every component can be restyled without forking it.

# `className`

Classes you pass are merged with the component's own using [tailwind-merge](https://github.com/dcastil/tailwind-merge), so yours win:

```tsx
<Button className="rounded-full px-6">Save</Button>
```

# `classNames` for parts

Compound components take a `classNames` object with one entry per part:

```tsx
<FormField label="Name" classNames={{ label: 'font-semibold', help: 'italic' }}>…</FormField>
<TextInput startAddon="@" classNames={{ root: 'bg-muted', input: 'font-mono' }} />
```

# Variants

Variants are built with [class-variance-authority](https://cva.style) and exported, so you can reuse them on other elements:

```tsx
import { buttonVariants } from '@javaabu/onu';

<a className={buttonVariants({ variant: 'outline', size: 'sm' })} href="/export">Export</a>
```

# `asChild`

Buttons, links and triggers accept `asChild` to render your own element with their styles and behaviour:

```tsx
<Button asChild>
    <Link href="/users/create">New user</Link>
</Button>
```

# Data attributes

Components expose `data-slot` (which part), plus `data-state`, `data-variant`, `data-size`, `data-invalid` and similar attributes for styling from CSS:

```css
[data-slot="form-field"][data-invalid] [data-slot="label"] { text-decoration: underline; }
```

# Primitives

The shadcn/ui primitives Onu builds on are available from `@javaabu/onu/primitives` when you need to compose something new.

Onu never uses `!important`, and inline styles only for values that change at runtime (positions, progress).
