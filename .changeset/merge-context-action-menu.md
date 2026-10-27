---
"@javaabu/onu": minor
---

`ActionMenu` takes `openOn="context"`: the same `items` open as a context menu on `children` (right-click, long press on touch screens, or the Menu key / Shift+F10), with `asChild` to use the child as the area and `disabled` to turn it off. Confirmations, `name` and record actions now work in context menus too. `disabled` also disables the dropdown's trigger. `ContextActionMenu` and `ContextActionMenuProps` are removed: use `<ActionMenu openOn="context" items={items} asChild>{area}</ActionMenu>`. The area's `data-slot` is `action-menu-area` (was `context-action-menu-trigger`) and the menu's is `action-menu-content` (was `context-action-menu-content`). When no item is visible the area stays and right-click shows the browser's menu. The `ContextMenu` primitive parts are still exported.
