---
"@javaabu/onu": minor
---

`AppSwitcher` and its `AppSwitcherProps` and `AppSwitcherApp` types are removed, with the `layout.apps` and `layout.switchApp` strings. `AppSidebar`'s `header` slot is unchanged; put an `ActionMenu` of the suite's apps next to the logo:

```tsx
<AppSidebar
  header={
    <div className="gap-2 flex items-center justify-between">
      <Logo src="/logo.svg" alt="" text="Atoll Records" />
      <ActionMenu
        align="start"
        trigger={
          <Button variant="ghost" size="icon" aria-label="Switch app">
            <Icon name="grid" />
          </Button>
        }
        items={[
          { type: "label", label: "Atoll apps" },
          { label: "Records", href: "/records", icon: "file-text" },
          { label: "Calendar", href: "/calendar", icon: "calendar" },
        ]}
      />
    </div>
  }
/>
```
