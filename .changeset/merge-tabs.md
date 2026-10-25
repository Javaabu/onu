---
"@javaabu/onu": minor
---

`Tabs` takes `narrow` (`"select"` or `"scroll"`): with `orientation="vertical"` it lays the list out beside the panel, settings-style, and turns it into a select or a horizontal scroller in narrow containers. `TabItem` gains `description`, `badge` and `textLabel`, and `classNames` gains `select`. `StackedTabs`, `StackedTabsProps` and `StackedTabItem` are removed: use `<Tabs orientation="vertical" narrow="select" items={…}>` with `TabItem` (`mobile` is now `narrow`).
