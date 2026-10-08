---
"@javaabu/onu": minor
---

Charts: add `ChartAnimationProvider` (and export `useChartAnimation`) to turn animation off for every Onu chart in an area, e.g. for print, kiosks or screenshot tests. Tooltips now also stop animating under `prefers-reduced-motion`, so every Onu chart passes `isAnimationActive={false}` to all its Recharts elements when reduced motion is preferred. The visual regression spec emulates reduced motion and loads fonts before charts render, so chart screenshots are stable.
