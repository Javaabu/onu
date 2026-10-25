---
"@javaabu/onu": minor
---

`Tabs` takes `narrow` (`"select"` or `"scroll"`): with `orientation="vertical"` it lays the list out beside the panel, settings-style, and turns it into a select or a horizontal scroller in narrow containers. `TabItem` gains `description`, `badge` and `textLabel`, and `classNames` gains `select`. `StackedTabs` remains as a preset (vertical, `narrow` from its `mobile` prop); its docs and demo are now part of Tabs. `StackedTabItem` is now an alias of `TabItem`, so stacked tabs also accept `count`. `StackedTabs` props other than `className` (such as `id` or `style`) now go to the inner tabs element instead of the outer container.
