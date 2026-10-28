# ImageInput

Picks one image with a preview, and Replace / Remove buttons. The value can be a picked `File` or the URL of an existing image.

```tsx
import { ImageInput } from "@javaabu/onu"

;<FormField label="Guest house photo" name="photo">
  <ImageInput
    alt="Guest house in Maafushi"
    defaultValue={guestHouse.photoUrl}
    removeName="remove_photo"
    maxSize={2 * 1024 * 1024}
  />
</FormField>
```

When an existing image is removed, `removeName` renders a hidden input set to `1` so the server knows to delete it.

## Props

| Prop           | Type                                              | Default                | Description                                               |
| -------------- | ------------------------------------------------- | ---------------------- | --------------------------------------------------------- |
| `alt`          | `string`                                          | (required)             | Alt text for the preview (R14.10)                         |
| `value`        | `File \| string \| null`                          |                        | Controlled value                                          |
| `defaultValue` | `File \| string \| null`                          |                        | Initial value                                             |
| `onChange`     | `(file: File \| null) => void`                    |                        | New file, or `null` when removed                          |
| `onReject`     | `(rejection) => void`                             |                        | A picked file failed validation                           |
| `accept`       | `string`                                          | `"image/*"`            | Accepted types                                            |
| `maxSize`      | `number`                                          |                        | Largest size in bytes                                     |
| `shape`        | `"rounded" \| "square" \| "circle"`               | `"rounded"`            | Preview shape (`imageInputVariants`)                      |
| `aspectRatio`  | `number`                                          | `4/3` (`1` for circle) | Preview aspect ratio                                      |
| `removeName`   | `string`                                          |                        | Hidden input set to `1` when an existing image is removed |
| `placeholder`  | `ReactNode`                                       |                        | Empty-state content                                       |
| `classNames`   | `{ root, preview, image, actions, empty, error }` |                        | Classes for each part                                     |

Other `<input>` props go to the (visually hidden) file input; `ref` points at it.

## Accessibility

- The empty state is a button ("Choose an image"); with an image, the preview has the `alt` text and the actions are "Replace" and "Remove". After removing, focus moves to the choose button.
- Validation errors use `role="alert"` and are linked to the buttons with `aria-describedby`.

| Key                                 | Action                    |
| ----------------------------------- | ------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Choose, replace or remove |

## RTL and Dhivehi

Buttons follow the reading direction; strings come from the `file` namespace.
