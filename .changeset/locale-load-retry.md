---
"@javaabu/onu": patch
---

`OnuProvider locale="dv"` now retries a failed Dhivehi chunk load (after 1, 3 and 10 seconds, then when the browser comes back online) instead of staying in English for the rest of the session.
