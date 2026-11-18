# Error pages

Full-page error states with a code, title, message, illustration and actions (**Go home**, **Go back**, **Try again**), translated into English and Dhivehi.

```tsx
import { ErrorPage, ForbiddenPage, MaintenancePage, NotFoundPage, ServerErrorPage } from "@javaabu/onu"

<NotFoundPage />                      // 404
<ForbiddenPage homeHref="/dashboard" /> // 403
<ServerErrorPage onRetry={refetch} />   // 500, with Try again
<MaintenancePage homeHref={null} />     // 503
<ErrorPage code={419} title="Session expired" message="Please sign in again." />
```

| Page              | Code | Default icon | Try again |
| ----------------- | ---- | ------------ | --------- |
| `ForbiddenPage`   | 403  | `lock`       | no        |
| `NotFoundPage`    | 404  | `search`     | no        |
| `ServerErrorPage` | 500  | `error`      | yes       |
| `MaintenancePage` | 503  | `wrench`     | yes       |

## Props

| Prop           | Type                                              | Default  | Description                                         |
| -------------- | ------------------------------------------------- | -------- | --------------------------------------------------- |
| `code`         | `403 \| 404 \| 500 \| 503 \| number`              |          | Status code (`ErrorPage` only)                      |
| `title`        | `ReactNode`                                       | per code | Heading                                             |
| `message`      | `ReactNode`                                       | per code | Explanation                                         |
| `illustration` | `ReactNode`                                       | icon     | Image or SVG slot                                   |
| `homeHref`     | `string \| null`                                  | `'/'`    | "Go home" link; `null` hides it                     |
| `showBack`     | `boolean`                                         | `true`   | "Go back" (`history.back()`)                        |
| `showRetry`    | `boolean`                                         | 500/503  | "Try again"                                         |
| `onRetry`      | `() => void`                                      | reload   | Retry action                                        |
| `extraActions` | `ReactNode`                                       |          | Added after the default actions                     |
| `actions`      | `ReactNode`                                       |          | Replace all actions                                 |
| `as`           | `'main' \| 'div'`                                 | `'main'` | Use `div` inside a layout that already has `<main>` |
| `classNames`   | `{ illustration, code, title, message, actions }` |          | Classes for each part                               |

## Accessibility

- Rendered as a `<main>` landmark labelled by its `h1`.
- The illustration should be decorative (`alt=""` / `aria-hidden`).
- Buttons stack full-width on phones and are 44px tall on touch screens.

## Framework notes

In Laravel + Inertia, render these from your `Error` page component by status. In Next.js, use them in `not-found.tsx` and `error.tsx` (pass `onRetry={reset}`).
