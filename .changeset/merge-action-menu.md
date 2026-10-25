---
"@javaabu/onu": minor
---

`ActionMenu` takes `name` (the trigger becomes "Actions for {name}" and confirmations default to "Delete {name}?") and listing-style items (`destructive`, `permitted`, `separator`, `confirm: true`, async `onSelect`), so `RecordAction[]` works as `items`. `RowActions` (with `trashActions`) remains as a preset; its docs and demo are now part of ActionMenu. Behaviour changes: ActionMenu confirmations open once the menu has closed and return focus to the trigger, and without a `ConfirmProvider` they show a styled `ConfirmDialog` instead of `window.confirm`. Listing confirmations (row menus, record header actions, bulk actions) now render with `ConfirmDialog`: destructive ones show its warning icon, a failed action's error shows in the dialog, and the dialog's `data-slot` is `confirm-dialog` (was `listing-confirm`).
