---
"@javaabu/onu": patch
---

An app that uses `@javaabu/onu/charts` without the optional map peers (`@vis.gl/react-google-maps`, deck.gl) now builds with webpack too; it used to fail with "Module not found". `MapChart` loads them on demand and, when they are missing, shows a note and the data table instead of the map.
