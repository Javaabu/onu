---
"@javaabu/onu": minor
---

`Tabs` works as filter tabs above a listing: an item without `content` renders no panel, and `controls` (the listing's id) becomes its tab's `aria-controls` (without `controls` the attribute is left out, so no tab points at a missing panel). `countAppearance="pill"` shows counts as grey pills in the brand colour on the active tab. `FilterTabs`, `FilterTabsProps` and `FilterTab` are removed: use `<Tabs variant="line" countAppearance="pill" listLabel="Filter by status" controls={listId} items={tabs} value={…} onValueChange={…} />` with `TabItem` (`tabs` is now `items`, `classNames.tab` is `classNames.trigger`, and the list label is `listLabel`, no longer "Filter by status" by default). `ListingPage`'s `tabs` now takes `TabItem[]`. Other changes to `Tabs`: a count is a separate word in the tab's name ("Activity (12)", was "Activity(12)"), a horizontal `line` list draws its hairline under the whole row, and its scroller no longer adds bottom padding.
