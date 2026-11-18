---
"@javaabu/onu": patch
---

Maps: editing a shape on the map no longer deletes a `MapPolygon` or `MapRoute` shape that is still being entered with the keyboard; `LiveMap` lets a newer `markers` prop replace an earlier streamed update, drops markers that leave `markers`, and its `subscribe` gets a `remove(id)` callback; place search on Google Maps uses the `MapProvider` `region` instead of always the Maldives.
