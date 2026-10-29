---
"@javaabu/onu": minor
---

`CookieConsent`, `useCookieConsent`, `readCookieConsent`, `openCookiePreferences`, `COOKIE_CONSENT_STORAGE_KEY` and their types are removed, with the `display.cookie*` strings: no Maldivian requirement asks for a consent banner and no sample page used one. When a project needs one, compose `AnnouncementBar` and `Modal` with `Switch`es, and store the choice in the app:

```tsx
<AnnouncementBar id="cookies" variant="neutral" href="/privacy" linkText="Cookie policy">
  We use essential cookies to make this site work.{" "}
  <Button size="sm" variant="link" onClick={() => setOpen(true)}>
    Preferences
  </Button>
</AnnouncementBar>

<Modal
  open={open}
  onOpenChange={setOpen}
  title="Cookie preferences"
  footer={<Button onClick={() => save(choices)}>Save preferences</Button>}
>
  <Switch label="Strictly necessary" checked disabled />
  <Switch label="Analytics" checked={choices.analytics} onCheckedChange={(analytics) => setChoices({ ...choices, analytics })} />
</Modal>
```
