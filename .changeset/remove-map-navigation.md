---
"@javaabu/onu": minor
---

`MapNavigation`, `MapNavigationProps` and `NavigationStop` are removed from `@javaabu/onu/maps`, with the `map.*` navigation strings: turn-by-turn directions belong in the Google Maps app. Show the line with `MapRoute` and link out from a `LocationCard`, which has an "Open in Google Maps" link:

```tsx
<MapRoute value={route} disabled label="Ferry route" />
<LocationCard title="Hulhumalé ferry terminal" position={{ lat: 4.2105, lng: 73.5401 }} />
```
