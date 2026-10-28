# AvatarUpload

A circular avatar picker: shows the photo (or initials), opens a crop step after picking (using [`ImageCropper`](./image-cropper.md)), and offers Change and Remove. It lives in the optional media entry because it uses `react-easy-crop`.

```bash
pnpm add react-easy-crop
```

```tsx
import { AvatarUpload } from "@javaabu/onu/media"

;<FormField label="Profile photo" name="avatar">
  <AvatarUpload personName="Aishath Shifa" defaultValue={user.avatarUrl} maxSize={5 * 1024 * 1024} />
</FormField>
```

The cropped image is a square JPEG, 512px by default (`cropOptions`), returned as a `File` through `onChange` and kept on the hidden file input for plain form submits. If cropping fails (for example a cross-origin image), the original file is used.

## Props

| Prop           | Type                                 | Default     | Description                             |
| -------------- | ------------------------------------ | ----------- | --------------------------------------- |
| `personName`   | `string`                             | (required)  | Used for the initials and the alt text  |
| `value`        | `File \| string \| null`             |             | Controlled value                        |
| `defaultValue` | `File \| string \| null`             |             | Initial value                           |
| `onChange`     | `(file: File \| null) => void`       |             | New (cropped) file, or `null`           |
| `onReject`     | `(rejection) => void`                |             | A picked file failed validation         |
| `accept`       | `string`                             | `"image/*"` | Accepted types                          |
| `maxSize`      | `number`                             |             | Largest size in bytes (before cropping) |
| `crop`         | `boolean`                            | `true`      | Show the crop step                      |
| `cropOptions`  | `CropImageOptions`                   | 512px JPEG  | `{ type, quality, maxSize }`            |
| `removable`    | `boolean`                            | `true`      | Show the Remove button                  |
| `size`         | `"sm" \| "default" \| "lg" \| "xl"`  | `"default"` | Avatar size (`avatarUploadVariants`)    |
| `classNames`   | `{ avatar, actions, dialog, error }` |             | Classes for each part                   |

## Accessibility

- The avatar image is named "Photo of {name}"; without a photo the initials are exposed as "{name} (no photo)".
- The crop dialog traps focus; Cancel or Escape closes it and focus returns to the Change/Upload button.
- See [`ImageCropper`](./image-cropper.md) for the crop keyboard support.

| Key                                 | Action                  |
| ----------------------------------- | ----------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Upload/change or remove |
| <kbd>Escape</kbd>                   | Cancel the crop dialog  |

## RTL and Dhivehi

Initials work with Thaana names ("އަޙްމަދު ނާޒިމް" → "އނ"). The layout mirrors in RTL.
