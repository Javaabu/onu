---
"@javaabu/onu": minor
---

`PrintButton`, `BackButton`, `PrintButtonProps` and `BackButtonProps` are removed: they were too app-specific for the design system. Use `Button` and `LinkButton`:

```tsx
<Button variant="outline" startIcon="print" className="print:hidden" onClick={() => window.print()}>
  Print
</Button>
<LinkButton variant="ghost" startIcon="back" href="/applications" className="print:hidden">
  Back
</LinkButton>
<Button variant="ghost" startIcon="back" className="print:hidden" onClick={() => history.back()}>
  Back
</Button>
```

For an icon-only button, use `size="icon"` with an `aria-label` and `<Icon name="print" />` as the child. The `display.print` string is removed.
