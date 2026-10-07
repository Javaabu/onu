---
title: Modal
sidebar_position: 1
---

A dialog with a simple `title` / `description` / `footer` API, built on shadcn's `Dialog` (Radix). It traps focus, returns focus to whatever opened it, scrolls inside its body when the content is long, and on phones becomes a bottom sheet (default) or a full-screen page.

```tsx
import { Button, Modal, ModalClose } from "@javaabu/onu"

;<Modal
  trigger={<Button>Edit staff member</Button>}
  title="Edit staff member"
  description="Changes are visible to the HR team straight away."
  footer={
    <>
      <ModalClose asChild>
        <Button variant="outline">Cancel</Button>
      </ModalClose>
      <Button onClick={save}>Save changes</Button>
    </>
  }
>
  <FormField label="Full name">
    <TextInput defaultValue="Aishath Ali" />
  </FormField>
</Modal>
```

## Controlled

```tsx
const [open, setOpen] = useState(false)

<Modal open={open} onOpenChange={setOpen} title="Transfer MVR 1,250.00">
  …
</Modal>
```

Without a `trigger`, focus still returns to the element that had focus when the modal opened.

## Sizes and phones

`size` sets the width from the `sm` breakpoint up: `sm`, `md` (default), `lg`, `xl` or `full`.

`mobile` sets the presentation below 640px:

| `mobile`          | On phones                                          |
| ----------------- | -------------------------------------------------- |
| `sheet` (default) | Slides up from the bottom, with safe-area padding  |
| `fullscreen`      | Covers the screen; good for forms and long content |
| `dialog`          | Stays a centred dialog                             |

## Composing

For full control use the parts. They are the same pieces `Modal` uses.

```tsx
import {
  ModalRoot,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
} from "@javaabu/onu"

;<ModalRoot>
  <ModalTrigger asChild>
    <Button>Transfer</Button>
  </ModalTrigger>
  <ModalContent size="sm" mobile="fullscreen">
    <ModalHeader>
      <ModalTitle>Transfer MVR 1,250.00</ModalTitle>
      <ModalDescription>To Mohamed Naseem</ModalDescription>
    </ModalHeader>
    <ModalBody>Transfers after 2 PM are processed the next working day.</ModalBody>
    <ModalFooter>
      <ModalClose asChild>
        <Button variant="outline">Cancel</Button>
      </ModalClose>
      <Button>Transfer</Button>
    </ModalFooter>
  </ModalContent>
</ModalRoot>
```

## Props

| Prop           | Type                                                           | Default   | Description                                         |
| -------------- | -------------------------------------------------------------- | --------- | --------------------------------------------------- |
| `title`        | `ReactNode`                                                    |           | Heading and accessible name (required)              |
| `description`  | `ReactNode`                                                    |           | Text under the title; the accessible description    |
| `hideTitle`    | `boolean`                                                      | `false`   | Hide the title visually, keep it for screen readers |
| `footer`       | `ReactNode`                                                    |           | Actions bar                                         |
| `trigger`      | `ReactNode`                                                    |           | Element that opens the modal (`asChild`)            |
| `open`         | `boolean`                                                      |           | Controlled open state                               |
| `defaultOpen`  | `boolean`                                                      | `false`   | Initial state when uncontrolled                     |
| `onOpenChange` | `(open: boolean) => void`                                      |           | Called when the modal opens or closes               |
| `size`         | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'`                       | `'md'`    | Width from `sm` up                                  |
| `mobile`       | `'sheet' \| 'fullscreen' \| 'dialog'`                          | `'sheet'` | Presentation on phones                              |
| `closeButton`  | `boolean`                                                      | `true`    | Show the × button                                   |
| `className`    | `string`                                                       |           | Classes for the panel                               |
| `classNames`   | `{ overlay, header, title, description, body, footer, close }` |           | Classes for each part                               |

Other props (e.g. `onEscapeKeyDown`, `onInteractOutside`) go to Radix `Dialog.Content`; `ref` points at the panel. `modalContentVariants` is exported for reuse.

## Accessibility

- Uses the WAI-ARIA dialog pattern: `role="dialog"`, `aria-modal`, labelled by the title and described by the description.
- Focus moves into the modal on open, is trapped inside, and returns to the opener on close (R14.4).
- The close button is labelled "Close" in the active locale.

| Key                                              | Action                                 |
| ------------------------------------------------ | -------------------------------------- |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Move between controls inside the modal |
| <kbd>Escape</kbd>                                | Close and return focus                 |

## RTL

The panel, header close button and footer actions use logical properties, so they mirror in RTL. Titles and body text follow the page direction; Thaana fields inside use `thaana` as usual.
