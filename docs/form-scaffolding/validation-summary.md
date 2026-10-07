---
title: ValidationSummary (AJAX validation errors)
sidebar_position: 7
---

An error summary for the top of a form. It lists every error, and each one is a link that moves focus to its field. It accepts Laravel's 422 response body as is. [`Form`](./form) renders it for you; use it directly when you handle requests yourself. `AjaxValidationErrors` is an alias.

```tsx
import { ValidationSummary } from "@javaabu/onu"

// The whole 422 body…
<ValidationSummary errors={response.data} />

// …or just the errors object
<ValidationSummary errors={{ email: ["The email has already been taken."], "items.0.name": "Required" }} />
```

Links find fields by `name` in the closest `<form>` (or `root`), matching dot and bracket notation: `items.0.name` finds `name="items[0][name]"`. A collapsed [`Fieldset`](./fieldset) around the field opens first.

## Props

| Prop          | Type                                                        | Default                 | Description                                    |
| ------------- | ----------------------------------------------------------- | ----------------------- | ---------------------------------------------- |
| `errors`      | `Record<string, string \| string[]> \| { message, errors }` |                         | Errors, or a Laravel 422 body                  |
| `message`     | `ReactNode`                                                 |                         | General message when there are no field errors |
| `title`       | `ReactNode`                                                 | "There are N problems…" | Heading                                        |
| `labels`      | `Record<string, ReactNode>`                                 |                         | Field labels shown before each message         |
| `root`        | `RefObject<HTMLElement>`                                    | closest form            | Where to look for fields                       |
| `focusOnShow` | `boolean`                                                   | `false`                 | Move focus to the summary when it appears      |
| `classNames`  | `{ title, list, item, link, message }`                      |                         | Classes for each part                          |

Renders nothing when there are no errors and no message.

## Accessibility

- `role="alert"`, labelled by its heading, and focusable (`tabIndex=-1`) so it can receive focus after a failed submit.
- Each error is a real link; activating it focuses and scrolls to the field.
- Colour is not the only signal: the heading has an error icon and states the number of problems.

| Key              | Action                       |
| ---------------- | ---------------------------- |
| <kbd>Tab</kbd>   | Move between error links     |
| <kbd>Enter</kbd> | Focus the field for the link |

## RTL and Dhivehi

The heading is pluralised in both locales ("މި ފޯމުގައި 2 މައްސަލަ ވޭ"). The list indents from the inline start.
