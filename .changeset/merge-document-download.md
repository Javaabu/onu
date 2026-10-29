---
"@javaabu/onu": minor
---

`DocumentDownload` is folded into `AttachmentPreview`, with no alias left behind. `AttachmentPreview` gains `versions` (one download button per language version, named "Download {name} in {language}"), `description` (a line under the name) and the `description` and `versions` class-name keys. The `DocumentVersion` type now comes from `attachment-preview`; `DocumentDownloadProps` is removed. `title`/`titleText` become `name`, `href` becomes `downloadUrl` (or `url` to allow opening and previewing), and `fileName` becomes the `name`.

```tsx
// Before
<DocumentDownload title="Public Services Act" versions={[{ lang: "dv", href: "/act-dv.pdf" }, { lang: "en", href: "/act-en.pdf" }]} />
<DocumentDownload title="Tender form" href="/tender.docx" fileName="tender-form.docx" size={56_000} />

// After
<AttachmentPreview name="Public Services Act" versions={[{ lang: "dv", href: "/act-dv.pdf" }, { lang: "en", href: "/act-en.pdf" }]} />
<AttachmentPreview name="tender-form.docx" description="Tender form" downloadUrl="/tender.docx" size={56_000} />
```
