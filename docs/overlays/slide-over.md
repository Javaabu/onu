# SlideOver

A panel that slides in from the side, for detail views, quick edits and filters. Built on shadcn's `Sheet`. The `side` is **logical** (`start` / `end`), so it flips in RTL. The header and footer stay put while the body scrolls.

```tsx
import { Button, SlideOver, SlideOverClose } from "@javaabu/onu"

;<SlideOver
  trigger={<Button>Edit vessel</Button>}
  title="Edit vessel"
  description="MV Hithadhoo Express, registration P-2041"
  footer={
    <>
      <SlideOverClose asChild>
        <Button variant="outline">Cancel</Button>
      </SlideOverClose>
      <Button onClick={save}>Save</Button>
    </>
  }
>
  <FormField label="Vessel name">
    <TextInput defaultValue="Hithadhoo Express" />
  </FormField>
</SlideOver>
```

## Sides and sizes

- `side="end"` (default) is on the right in LTR and on the left in RTL; `side="start"` is the opposite.
- `size`: `sm`, `md` (default), `lg`, `xl` or `full`. On phones the panel leaves a 2.5rem strip of the page visible (except `full`).

## Composing

`SlideOverRoot`, `SlideOverTrigger`, `SlideOverContent` (`side`, `size`), `SlideOverHeader` (`closeButton`), `SlideOverTitle`, `SlideOverDescription`, `SlideOverBody`, `SlideOverFooter` and `SlideOverClose` are exported. `physicalSide(side, dir)` maps a logical side to `left` / `right`.

## Props

| Prop                                           | Type                                                  | Default | Description                            |
| ---------------------------------------------- | ----------------------------------------------------- | ------- | -------------------------------------- |
| `title`                                        | `ReactNode`                                           |         | Heading and accessible name (required) |
| `description`                                  | `ReactNode`                                           |         | Accessible description                 |
| `footer`                                       | `ReactNode`                                           |         | Sticky action bar                      |
| `trigger`                                      | `ReactNode`                                           |         | Element that opens the panel           |
| `side`                                         | `'start' \| 'end'`                                    | `'end'` | Edge it slides from                    |
| `size`                                         | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'`              | `'md'`  | Width                                  |
| `closeButton`                                  | `boolean`                                             | `true`  | Show the × button                      |
| `open`, `defaultOpen`, `onOpenChange`, `modal` |                                                       |         | Dialog state                           |
| `className`                                    | `string`                                              |         | Classes for the panel                  |
| `classNames`                                   | `{ header, title, description, body, footer, close }` |         | Classes for each part                  |

`ref` points at the panel. `slideOverVariants` is exported.

## Accessibility

- A modal dialog (`role="dialog"`), labelled by its title. Focus is trapped inside and returns to the opener on close.
- The header and footer respect the safe-area insets on notched phones.

| Key               | Action                 |
| ----------------- | ---------------------- |
| <kbd>Tab</kbd>    | Move between controls  |
| <kbd>Escape</kbd> | Close and return focus |

## RTL

Use `start` / `end`, never left/right: the panel and its slide animation flip with the direction.
