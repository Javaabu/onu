---
"@javaabu/onu": patch
---

Maps: LiveMap pans to the selected marker when `selectedId` changes from outside the map (without turning on follow mode). LiveMap, RouteStopEditor, MapRoute, MapPolygon and MapReplay fit their points when no `center`/`zoom` is given — also when the points load after the first render — in both the Google adapter and the keyless preview; a single point is centred at zoom 15 instead of zooming all the way in. `MapView`'s `bounds` is now fitted once, as soon as it is set.
