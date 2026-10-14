---
"@javaabu/onu": patch
---

Maps: an empty Map ID (for example an unset CI secret passed through as `""`) now counts as no Map ID, so Google maps fall back to `DEMO_MAP_ID` and advanced markers keep working. `staticMapUrl` (and `LocationCard`'s thumbnail) no longer sends `DEMO_MAP_ID` to the Static Maps API.
