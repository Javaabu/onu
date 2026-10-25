---
"@javaabu/onu": minor
---

New `CategoryChart` in `@javaabu/onu/charts` draws category data as lines, areas or bars with `variant`: `"line"` (default), `"area"` or `"bar"`. Its props are a union on `variant`, so the line options (`curve`, `dots`, `connectNulls`, `dashedSeries`) and the bar options (`orientation`, `radius`) are only accepted for their own variant. `LineChart` and `BarChart` are removed: use `<CategoryChart variant="line">` (the default) or `<CategoryChart variant="bar">`, with the same props, data slots, summaries and data tables. `LineChart`'s `area` prop is gone: use `variant="area"`. `LineChartProps` and `BarChartProps` are now `CategoryChartLineProps` and `CategoryChartBarProps`, and `LineCurve` is `CategoryChartCurve`.
