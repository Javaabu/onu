---
"@javaabu/onu": minor
---

The shadcn `resizable` primitive leaves `@javaabu/onu/primitives`: `ResizablePanelGroup`, `ResizablePanel` and `ResizableHandle` are removed, and `react-resizable-panels` is no longer a dependency. Nothing in Onu used them. An app that needs resizable panes can install `react-resizable-panels` and add shadcn's `resizable` component itself.
