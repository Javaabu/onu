---
"@javaabu/onu": minor
---

`TopNav` items take `columns` and `featured`: an item with columns opens a wide multi-column panel (a mega menu), and panel links take part in the active state and show badges. `classNames` gains `panel`, `column` and `panelLink`. `MegaMenu` remains as a preset and now accepts `currentHref`, `match`, `mobileFooter`, top-level icons and badges; its docs and demo are now part of TopNav. Behaviour change for `MegaMenu`: its phone drawer is now the same `SideNav` drawer as `TopNav`'s, so each titled column is its own collapsible section (one more tap to reach its links) instead of a heading inside an accordion, and its plain top-level links use TopNav's link style.
