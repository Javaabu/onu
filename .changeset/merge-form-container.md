---
"@javaabu/onu": minor
---

`FormContainer` is folded into `Card`, with no alias left behind. `Card` gains `width` (`sm`, `md`, `lg`, `xl`, `full`: full width up to that maximum and centred, and the footer buttons stack full width when the card is narrow), `media` (above the title), `centered` (a centred header without its bottom line, for auth pages), `variant="plain"` (no surface or padding), `headingLevel={1}` and the `media` class-name key. Card never imports the form module: wrap it in a `Form`, or render the form as the card with `asChild`. `FormContainerProps` and `formContainerVariants` are removed. The auth forms render on `Card` and accept its props (they were `FormContainer` props). Note that `Card`'s `headingLevel` defaults to `3`; `FormContainer`'s was `2`.

```tsx
// Before
<FormContainer title="New staff member" width="lg" footer={<SubmitButton>Invite</SubmitButton>}>
  …
</FormContainer>

// After
<Card title="New staff member" headingLevel={2} width="lg" footer={<SubmitButton>Invite</SubmitButton>}>
  …
</Card>
```
