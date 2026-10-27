---
"@javaabu/onu": minor
---

`FilterSubmit` (and `FilterSubmitProps`) is removed. Its Reset only called `onReset`, so end a server-rendered filter form with the buttons themselves: `<SubmitButton processing={loading} startIcon="filter">{t("listing.filterSubmit")}</SubmitButton>` and `<Button variant="ghost" onClick={onReset}>{t("listing.filterReset")}</Button>` (or a `LinkButton` to the unfiltered URL); `form`, `disabled` and `className` go on each button. `FilterPanel` (including `variant="form"`) already has its own Reset and Filter buttons and is unchanged; see "Server-rendered filter forms" on its docs page.
