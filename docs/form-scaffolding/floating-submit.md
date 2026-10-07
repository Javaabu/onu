---
title: FloatingSubmit
sidebar_position: 15
---

A submit button that floats at the bottom of the screen while the form's main submit button is scrolled out of view, so a long form can be submitted from anywhere.

```tsx
import { Form, FloatingSubmit, SubmitButton } from "@javaabu/onu"

;<Form onSubmit={submit}>
  {/* a long form … */}
  <SubmitButton>Submit application</SubmitButton>
  <FloatingSubmit>Submit</FloatingSubmit>
</Form>
```

By default it watches the first other submit button in the same form. Pass `target` (a ref) to watch something else, such as a footer. It shares the form's processing state with [`SubmitButton`](./submit-button).

## Props

| Prop           | Type                     | Default       | Description                         |
| -------------- | ------------------------ | ------------- | ----------------------------------- |
| `target`       | `RefObject<HTMLElement>` | form's submit | Element whose visibility is watched |
| `forceVisible` | `boolean`                | `false`       | Always show                         |
| `classNames`   | `{ root, button }`       |               | Classes for the wrapper and button  |

All [`SubmitButton`](./submit-button) props are supported. Uses `IntersectionObserver`; without it the button never appears.

## Layout

Full width above the bottom safe area on phones; a pill at the bottom inline end (bottom right in LTR, bottom left in RTL) from `sm`.

## Accessibility

It is only rendered while visible, so it never adds a hidden tab stop. It is a normal submit button with the same name and busy state as the main one.
