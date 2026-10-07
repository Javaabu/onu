---
title: Toast
sidebar_position: 11
---

Short notifications, using [sonner](https://sonner.emilkowal.ski) (shadcn's toast). Onu's `Toaster` adds Onu icons, follows `useTheme()`, uses logical positions that flip in RTL, and the Dhivehi font. It replaces the shadcn `Toaster` export with a compatible API.

```tsx
import { Toaster, toast } from "@javaabu/onu"

// Once, inside OnuProvider (and ThemeProvider):
;<Toaster />

toast("Draft saved")
toast.success("User saved", { description: "Aishath Shiuna" })
toast.error("Payment failed")
toast.warning("Session expires in 2 minutes")
toast.info("3 new applications")
toast.promise(upload(file), { loading: "Uploading…", success: "Uploaded", error: "Upload failed" })
toast("Moved to trash", { action: { label: "Undo", onClick: restore } })
```

## Toaster props

| Prop       | Type                                                                                            | Default        | Description               |
| ---------- | ----------------------------------------------------------------------------------------------- | -------------- | ------------------------- |
| `position` | `'top-start' \| 'top-center' \| 'top-end' \| 'bottom-start' \| 'bottom-center' \| 'bottom-end'` | `'bottom-end'` | `start`/`end` flip in RTL |
| `theme`    | `'light' \| 'dark' \| 'system'`                                                                 | `useTheme()`   | Override the theme        |
| `icons`    | `ToastIcons`                                                                                    | Onu icons      | Override icons            |

All other [sonner `Toaster` props](https://sonner.emilkowal.ski/toaster) are passed through. `resolveToastPosition(position, dir)` is exported.

`toast` is sonner's `toast` function, re-exported so you only import from Onu.

## Accessibility

- Toasts are announced by sonner's live region, labelled "Notifications" (translated).
- The close button is labelled "Close" (translated).
- Don't put the only copy of important information in a toast; it disappears.

| Key                         | Action                    |
| --------------------------- | ------------------------- |
| <kbd>Alt</kbd>+<kbd>T</kbd> | Focus the toasts (sonner) |
| <kbd>Tab</kbd>              | Move to a toast's action  |

## RTL and Dhivehi

`dir` comes from `OnuProvider`, so `bottom-end` is bottom-left in RTL and swipe-to-dismiss follows. With `locale="dv"` toasts use the Thaana font.
