---
"@javaabu/onu": minor
---

`PeriodComparisonChart` is folded into a `comparison` prop on `TimeSeriesChart` (steps are dates) and `CategoryChart` (steps are categories such as days of the week), with no alias left behind. The chart's first series is the current period and `comparison.previousKey` the previous one; the previous period is dashed (muted bars with `variant="bar"`), headline totals with a `DeltaIndicator` sit above the chart, and the data table gets a "Change" column. `currentLabel`, `previousLabel`, `aggregate`, `positiveIsGood` and `hideTotals` move into `comparison`. `PeriodComparisonChartProps` and the `chart.typePeriodComparison` string are removed; `rowChange` and the new `ChartComparison` type are exported from `@javaabu/onu/charts`.

```tsx
// Before
<PeriodComparisonChart title="Costs" variant="bar" data={rows} categoryKey="month" currentLabel="2026" previousLabel="2025" positiveIsGood={false} />

// After
<CategoryChart
  title="Costs"
  variant="bar"
  data={rows}
  categoryKey="month"
  comparison={{ previousKey: "previous", currentLabel: "2026", previousLabel: "2025", positiveIsGood: false }}
/>
```
