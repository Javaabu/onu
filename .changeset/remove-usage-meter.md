---
"@javaabu/onu": minor
---

`UsageMeter` and `UsageMeterProps` are removed: they were too app-specific for the design system. Build the quota bar from `ProgressBar` and a link:

```tsx
<div className="gap-2 pt-3 grid border-t border-shell-border">
  <ProgressBar size="sm" label="Storage" value={1284} max={2000} showValue classNames={{ track: "bg-shell-weak" }} />
  <div className="gap-2 text-xs flex items-center justify-between">
    <ConditionalLink href="/billing" className="text-primary hover:underline">
      Get more space
    </ConditionalLink>
    <span className="text-muted-foreground">v5.0.42</span>
  </div>
</div>
```

Pass `color="warning"` or `color="destructive"` to `ProgressBar` yourself when the quota is nearly full.
