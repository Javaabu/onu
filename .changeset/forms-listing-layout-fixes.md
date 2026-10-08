---
"@javaabu/onu": minor
---

Form, listing and layout fixes:

- Textarea keeps its character counter in LTR order on RTL pages; SegmentedControl never truncates labels and scrolls sideways when space runs out.
- File names use `dir="auto"` and sizes read left-to-right in MediaLister, AttachmentPreview, DocumentDownload, FileInput and file rows.
- SaveBar keeps inside the main column (mirrored in RTL) and reads "No changes yet" when clean.
- The unsaved-changes guard covers hash-router links and, where the Navigation API exists, Back/Forward (new `interceptHistory` option).
- `describeChanges` is typed per key; auth forms pass every named field to `onSubmit` (`AuthFormValues`) and use the transparent divider.
- Nav items match on path and query; AppSidebar parent badges sit before the chevron.
- Card pads content placed straight inside it (`padded={false}` opts out).
- DataTable selection checkboxes are 24px targets.
- ListingPage with custom `children` keeps pagination and adds a Sort by menu; state equal to `defaultState` stays out of the URL.
- New `useFormatFilter`, `useActiveFilterLabels` and `formatFilterLabel`; new `useFormatDate`, `useFormatNumber` and `useFormatCurrency`.
- TreeView shows partly selected parents and gains opt-in `selectionPropagation` (`propagateTreeSelection` exported).
