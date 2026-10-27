---
"@javaabu/onu": minor
---

`LastEditedBy` and `LastEditedByProps` are removed: they were too app-specific for the design system. Compose `UserAvatar` and `RelativeDate` instead:

```tsx
<div className="gap-2 text-sm flex items-center text-muted-foreground">
  <UserAvatar name={user.name} src={user.avatar} size="xs" decorative />
  <span>
    Last edited by <span className="font-medium text-foreground">{user.name}</span> · <RelativeDate value={updatedAt} />
  </span>
</div>
```

The `display.lastEditedBy` string is removed.
