---
"@javaabu/onu": minor
---

`TopNav` items take `columns` and `featured`: an item with columns opens a wide multi-column panel (a mega menu), and panel links take part in the active state and show badges. `classNames` gains `panel`, `column` and `panelLink`. `MegaMenu`, `MegaMenuProps` and `MegaMenuItem` are removed: use `<TopNav items={[{ …, columns: […] }]}>` with `TopNavItem`, and `classNames.panelLink` instead of `classNames.link`. `MegaMenuColumn` and `MegaMenuLink` are renamed `TopNavColumn` and `TopNavLink`. On phones, each titled column is its own collapsible section in TopNav's drawer.
