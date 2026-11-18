---
"@javaabu/onu": patch
---

Server-rendered `DateCalendar` and `HijriCalendar` now mark the browser's today once hydrated. Before, a server in another time zone (UTC against the Maldives between 00:00 and 05:00) could leave yesterday marked.
