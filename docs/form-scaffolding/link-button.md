# LinkButton

A link that looks like a [`Button`](./button.md). It renders through the `linkComponent` set on `OnuProvider`, so it navigates with Inertia, Next.js or your router (R16.2).

```tsx
import { LinkButton, OnuProvider } from "@javaabu/onu"
import { Link } from "@inertiajs/react"

;<OnuProvider linkComponent={Link}>
  <LinkButton href="/users/create" startIcon="add">
    New user
  </LinkButton>
  <LinkButton href="/users" variant="outline" startIcon="back">
    All users
  </LinkButton>
  <LinkButton href="https://efaas.gov.mv" external variant="link">
    eFaas
  </LinkButton>
</OnuProvider>
```

## Props

| Prop        | Type                               | Default   | Description                                                                      |
| ----------- | ---------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `href`      | `string`                           |           | Destination                                                                      |
| `variant`   | Button variants                    | `default` | Style                                                                            |
| `size`      | Button sizes                       | `default` | Size                                                                             |
| `startIcon` | `SemanticIconName \| ReactElement` |           | Icon before the label                                                            |
| `endIcon`   | `SemanticIconName \| ReactElement` |           | Icon after the label                                                             |
| `external`  | `boolean`                          | `false`   | Plain `<a target="_blank" rel="noopener noreferrer">` with an external-link icon |
| `disabled`  | `boolean`                          | `false`   | Dimmed, `aria-disabled`, no `href`                                               |

All `<a>` props are passed through; `ref` points at the anchor.

## Accessibility

- It is a real link (`role="link"`), so screen readers announce it as one; use [`Button`](./button.md) for actions.
- External links add "(opens in a new tab)" for screen readers (translated).
