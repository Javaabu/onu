---
"@javaabu/onu": minor
---

New `CategoryChart` in `@javaabu/onu/charts` draws category data as lines, areas or bars with `variant`: `"line"` (default), `"area"` or `"bar"`. Its props are a union on `variant`, so the line options (`curve`, `dots`, `connectNulls`, `dashedSeries`) and the bar options (`orientation`, `radius`) are only accepted for their own variant. `LineChart` and `BarChart` remain as presets with the same props, data slots, summaries and data tables, and `AreaChart` is a new preset for `variant="area"`. `LineChart`'s `area` prop still works but is deprecated in favour of `variant="area"`. The LineChart and BarChart docs and demos are now part of CategoryChart.
