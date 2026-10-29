---
"@javaabu/onu": minor
---

`EmailInput` and `UrlInput` are folded into `TextInput`, with no aliases left behind. `TextInput type="email"` and `type="url"` set the matching `inputMode` and `autoComplete`, turn off auto-capitalisation, autocorrect and spell check, are always `dir="ltr"`, and ignore `thaana` / `thaanaToggle`. A URL without a scheme gets `https://` on blur; the new `urlProtocol` prop (`string | false`, default `"https://"`) replaces `UrlInput`'s `defaultProtocol`. `normalizeUrl` is now exported from `text-input`. The `showIcon` prop is gone: pass the icon as `startAddon`. `EmailInputProps` and `UrlInputProps` are removed.

```tsx
// Before
<EmailInput showIcon />
<UrlInput defaultProtocol={false} />

// After
<TextInput type="email" startAddon={<Icon name="mail" />} />
<TextInput type="url" urlProtocol={false} />
```
