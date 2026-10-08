---
"@javaabu/onu": patch
---

Maps (Google adapter), found by running the adapter against the real Maps JavaScript API:

- `MapPolygon` / `MapRoute`: the initial value is no longer wiped when it is loaded into terra-draw (terra-draw reported its `clear()` as the user deleting every shape).
- terra-draw now starts once the map has a projection, instead of throwing `Cannot read properties of null (reading 'addEventListener')` when it loaded before the map was ready.
- Shapes stay on the map when the drawing tone changes (e.g. picking another zone type).
- Maps keep their camera when they switch between light and dark, instead of jumping back to the initial centre and zoom.
- Clustered markers use `PinElement` directly and `gmp-click`, removing Google's deprecation warnings.
