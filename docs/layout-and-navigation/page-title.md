---
title: PageTitle
sidebar_position: 10
---

The page header of index, view and edit pages ([§25.6](../requirements), [§25.8](../requirements)): the title, the main action button, and secondary links where a small dot marks e.g. a non-empty **Trash**. Record pages add breadcrumbs, back links and record actions. Actions move under the title when the header is narrow.

```tsx
import { Breadcrumbs, Button, PageTitle } from "@javaabu/onu"

// Index page
;<PageTitle
  title="Users"
  action={<Button>New user</Button>}
  links={[{ label: "Trash", href: "/users/trash", icon: "trash", dot: trashCount > 0 }]}
/>

// Record page
<PageTitle
  breadcrumbs={<Breadcrumbs items={[{ label: "Users", href: "/users" }, { label: user.name }]} />}
  title={user.name}
  links={[
    { label: "All users", href: "/users", icon: "back" },
    { label: "Trash", href: "/users/trash", dot: true },
  ]}
  actions={<Button variant="outline">Logs</Button>}
  action={<Button variant="destructive">Delete</Button>}
/>
```

## Props

| Prop           | Type                                                        | Default | Description                          |
| -------------- | ----------------------------------------------------------- | ------- | ------------------------------------ |
| `title`        | `ReactNode`                                                 |         | Page title                           |
| `description`  | `ReactNode`                                                 |         | Text under the title                 |
| `action`       | `ReactNode`                                                 |         | Main action (last at the inline end) |
| `actions`      | `ReactNode`                                                 |         | More actions before the main one     |
| `links`        | `{ label, href, icon?, dot?, count?, external? }[]`         |         | Secondary links under the title      |
| `breadcrumbs`  | `ReactNode`                                                 |         | Above the title                      |
| `media`        | `ReactNode`                                                 |         | Before the title (avatar, icon)      |
| `headingLevel` | `1 \| 2 \| 3`                                               | `1`     | Heading element                      |
| `classNames`   | `{ breadcrumbs, title, description, links, link, actions }` |         | Classes for each part                |

Other `<header>` props (including `ref`) go to the root.

## Behaviour (§25.6)

- The title is the page's `h1`.
- The main action button sits at the end of the header.
- A link with `dot` shows a small primary-coloured dot; screen readers hear "Trash (not empty)". Without `dot`, nothing is shown.

## Accessibility

| Key            | Action                         |
| -------------- | ------------------------------ |
| <kbd>Tab</kbd> | Move through links and actions |

## RTL

Actions sit on the left in RTL; the back icon mirrors.
