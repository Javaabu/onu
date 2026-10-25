---
"@javaabu/onu": minor
---

`ViewSwitcher` is removed: use `<SegmentedControl iconOnly size="sm" aria-label={t("listing.view")} options={useListingViewOptions()}>`. The new `useListingViewOptions(views?)` hook returns the built-in table, list, grid and board views with translated labels and icons; `ListingView` stays and `ViewOption` is removed. Icon-only segments show their label as a tooltip and are at least 44px wide on touch screens.
