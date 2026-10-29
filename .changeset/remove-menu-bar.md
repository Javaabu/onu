---
"@javaabu/onu": minor
---

`MenuBar` and its `MenuBarProps`, `MenuBarMenu` and `MenuBarEntry` types are removed: desktop-application menus do not appear in web admin panels or portals. If a screen really needs one, compose the `Menubar` primitive:

```tsx
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@javaabu/onu/primitives"

;<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem onSelect={save}>Save</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```
