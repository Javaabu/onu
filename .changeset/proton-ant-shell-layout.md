---
"@javaabu/onu": minor
---

New default look for the app shell and page layout (ProtonAnt): Proton Mail's shell around Ant Design's content.

- `AppLayout` is a white content panel with a 12px rounded top-start corner and a 1px shell line, on the app shell colour (`variant="panel"`, the default; `variant="flat"` keeps the previous look). New `background="layout"` (Ant's layout grey for dashboards of cards) and `breadcrumbs` (shown in the page header band, or above the content). `useAppLayout()` is exported.
- `AppHeader` defaults to `variant="shell"` inside a panel layout: the shell colour, 60px, a wide 40px rounded search, 36px quiet icon buttons and a square account avatar (avatar only below 768px). Outside a panel layout the default is unchanged.
- `AppSidebar` defaults to `surface="shell"` inside a panel layout: Proton's 36px items with grey hover and active states, brand count pills (`badgeTone: "neutral"` for plain totals), coloured folders and labels (`NavItem.color` tints the icon or shows a dot), and a new `action` slot for a full-width 44px call to action. `Sidebar` gets a `surface` prop.
- New `UsageMeter` (a quota bar with "used / total", a link and a note for the sidebar footer) and `AppSwitcher` (Proton's app grid menu).
- `PageTitle` is Ant's PageHeader band for an `h1` inside a panel layout: breadcrumbs (defaulting to the layout's), title with `subtitle` and `tags`, actions, description with key `figures`, extra `content`, and a `tabs` row with an ink bar. `variant="band" | "plain"`; `breadcrumbs` also accepts a `BreadcrumbsItem[]`.
- `ListingPage` gets the Ant ProTable layout (`variant="card"`, the default inside a panel layout): the header band with the status tabs, an optional inline query form (`queryFilters` or `queryForm`) and the list in a table card with `tableTitle` and tools. `FilterPanel` gets `variant="form"` (labelled fields in a grid with Reset, Filter and Expand).
- `StatTile` is Ant Pro's ChartCard: a 30px regular-weight figure, a `tip` info button, a 46px `chart` slot and a footer row under a line.
- `Card` follows Ant: 24px padding, a 1px border line without shadow, and a 56px header row with its own bottom line; `padded={false}` now removes all padding. `NavTabs` line tabs and `Breadcrumbs` follow Ant too.
- The shell reads new semantic tokens (`--shell`, `--shell-foreground`, `--shell-border`, `--shell-field`, `--shell-hover`, `--shell-active`, `--shell-weak`, `--layout`) with Proton's values as fallbacks.
