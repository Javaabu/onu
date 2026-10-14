---
"@javaabu/onu": patch
---

`AppSidebar`: a collapsed parent item now expands when `currentHref` moves into one of its pages (it used to stay as it was first rendered), and a `badgeTone: "neutral"` count is read by screen readers as the number alone instead of "N new". On phones the sidebar drawer focuses itself when it opens rather than its first field, so a filter or search field at the top no longer brings up the on-screen keyboard.
