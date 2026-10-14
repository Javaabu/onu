---
"@javaabu/onu": patch
---

`SidebarProvider` (and so `AppLayout`) now includes a `TooltipProvider`, as upstream shadcn does, so `AppSidebar` no longer crashes with "`Tooltip` must be used within `TooltipProvider`" in apps that don't add one.
