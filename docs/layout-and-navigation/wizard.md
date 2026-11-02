# Wizard

A multi-step flow (application wizards, onboarding): a step list with each step's status, Back / Next buttons with per-step validation, jumping back to completed steps, a compact "Step 2 of 4" header with a progress bar in narrow containers, and step changes announced to screen readers.

```tsx
import { Wizard } from "@javaabu/onu"

;<Wizard
  steps={[
    {
      id: "applicant",
      title: "Applicant",
      content: <ApplicantFields />,
      validate: () => form.trigger(["name", "nid"]),
    },
    { id: "address", title: "Address", content: <AddressFields /> },
    { id: "documents", title: "Documents", optional: true, content: <Uploads /> },
    { id: "review", title: "Review", content: <Review /> },
  ]}
  onComplete={submit}
  finishLabel="Submit"
/>
```

`validate` can be async (e.g. react-hook-form's `trigger`). While it runs, Next shows a spinner and ignores further clicks. If it returns `false`, the step is marked "Has errors" and the wizard stays.

## Navigation

- **Next** validates the current step (`validate`, then `onValidateStep`) and moves on; on the last step it calls `onComplete`.
- **Back** never validates.
- With `linear` (default), users can jump back to completed steps, and forward to the furthest unlocked step. `linear={false}` lets them jump anywhere.
- `errorSteps={["address"]}` marks steps with server-side errors.

## useWizard

Inside the wizard, `useWizard()` returns `{ index, total, step, isFirst, isLast, validating, next, back, goTo, statusOf }` for custom footers (set `hideFooter`).

## Props

| Prop             | Type                                                                        | Default        | Description                               |
| ---------------- | --------------------------------------------------------------------------- | -------------- | ----------------------------------------- |
| `steps`          | `{ id, title, textTitle?, description?, optional?, content?, validate? }[]` |                | Steps                                     |
| `step`           | `number`                                                                    |                | Controlled step index                     |
| `defaultStep`    | `number`                                                                    | `0`            | Initial step                              |
| `onStepChange`   | `(index) => void`                                                           |                | Called when the step changes              |
| `onValidateStep` | `(index, step) => boolean \| Promise<boolean>`                              |                | Validation hook for every step            |
| `onComplete`     | `() => void \| Promise<void>`                                               |                | Called when the last step validates       |
| `linear`         | `boolean`                                                                   | `true`         | Restrict jumping                          |
| `errorSteps`     | `string[]`                                                                  |                | Step ids with errors                      |
| `orientation`    | `'horizontal' \| 'vertical'`                                                | `'horizontal'` | Steps on top or at the inline start       |
| `finishLabel`    | `ReactNode`                                                                 | "Finish"       | Label of the last button                  |
| `hideFooter`     | `boolean`                                                                   | `false`        | Hide Back / Next                          |
| `footerExtra`    | `ReactNode`                                                                 |                | Between Back and Next (e.g. "Save draft") |
| `classNames`     | `{ steps, step, marker, panel, title, footer, compact }`                    |                | Classes for each part                     |

## Accessibility

- The step list is a `navigation` named "Steps"; the current step has `aria-current="step"` and every step has a screen-reader status (Completed, Current step, Not started, Has errors). Colour is never the only cue: completed steps show a check, errors an icon.
- After a step change, focus moves to the step heading and a live region announces "Step 2 of 4: Address".

| Key                                 | Action                                  |
| ----------------------------------- | --------------------------------------- |
| <kbd>Tab</kbd>                      | Move through fields, Back and Next      |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activate Next, Back or a completed step |

## RTL

Steps run right to left; the Back and Next arrows mirror. Step numbers use the locale's digits (Western digits in Dhivehi).
