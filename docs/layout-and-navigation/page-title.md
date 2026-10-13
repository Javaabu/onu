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

## Page header band (Ant PageHeader)

Inside a panel [`AppLayout`](./app-layout) (the default), a page's `h1` header is **Ant Design's PageHeader**: a white band across the top of the content panel with a bottom line, holding

- the **breadcrumbs** (by default the `AppLayout`'s `breadcrumbs`, so pages need not repeat them),
- the **title** (20px) with a grey `subtitle` and `tags`, and the actions at the inline end,
- the **description** with key `figures` at the end of its row (a `<dl>`: label above a 20px value, split by lines),
- secondary `links` and extra `content`,
- a `tabs` row (`FilterTabs`, `Tabs` or `NavTabs`) as Ant's line tabs with the brand ink bar on the band's bottom edge.

```tsx
<PageTitle
  title="Applications"
  tags={<Tag size="sm">67 open</Tag>}
  description="Permit and licence applications from every island."
  figures={[
    { label: "In review", value: 34 },
    { label: "Approved", value: 50 },
  ]}
  actions={<LinkButton href="/trash" variant="outline" startIcon="trash">Trash</LinkButton>}
  action={<LinkButton href="/applications/new" startIcon="add">New application</LinkButton>}
  tabs={<FilterTabs tabs={tabs} value={status} onValueChange={setStatus} />}
/>
```

Sub-headings (`headingLevel` 2 or 3) and headers outside a panel layout stay `plain`. Set `variant="band"` or `variant="plain"` to choose.

## Props

| Prop           | Type                                                        | Default | Description                          |
| -------------- | ----------------------------------------------------------- | ------- | ------------------------------------ |
| `title`        | `ReactNode`                                                 |         | Page title                           |
| `description`  | `ReactNode`                                                 |         | Text under the title                 |
| `action`       | `ReactNode`                                                 |         | Main action (last at the inline end) |
| `actions`      | `ReactNode`                                                 |         | More actions before the main one     |
| `links`        | `{ label, href, icon?, dot?, count?, external? }[]`         |         | Secondary links under the title      |
| `breadcrumbs`  | `ReactNode \| BreadcrumbsItem[]`                            |         | Above the title (a band defaults to the layout's) |
| `subtitle`     | `ReactNode`                                                 |         | Grey text next to the title          |
| `tags`         | `ReactNode`                                                 |         | Tags after the title                 |
| `figures`      | `{ label, value }[]`                                        |         | Key figures at the end of the description row |
| `content`      | `ReactNode`                                                 |         | More content under the heading       |
| `tabs`         | `ReactNode`                                                 |         | A tab row at the bottom (ink bar)    |
| `variant`      | `'band' \| 'plain'`                                         | `'band'` for an `h1` in a panel `AppLayout`, else `'plain'` | Ant PageHeader band or the plain block |
| `media`        | `ReactNode`                                                 |         | Before the title (avatar, icon)      |
| `headingLevel` | `1 \| 2 \| 3`                                               | `1`     | Heading element                      |
| `classNames`   | `{ breadcrumbs, title, subtitle, description, links, link, actions, figures, content, tabs }` |         | Classes for each part                |

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
