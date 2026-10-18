# Hero

The opening block of a portal or content page (R3.7): a heading, lead text, calls to action, an optional search field, and either media beside the text or a photo behind it. The heading and lead use the [fluid type scale](../guides/design-and-density.md#fluid-type) (`clamp()`, R3.4), and the layout follows the hero's own width (container queries), so it works full width or inside a column.

```tsx
import { Button, Hero, SearchBox } from "@javaabu/onu"

;<Hero
  tone="muted"
  align="center"
  eyebrow="National portal"
  title="Government services, in one place"
  description="Apply for passports, pay taxes and track your requests online."
  search={<SearchBox aria-label="Search services" placeholder="Search services" />}
  actions={
    <>
      <Button>Get started</Button>
      <Button variant="outline">Browse all services</Button>
    </>
  }
/>
```

## Media and background images

- `media` puts an image or illustration beside the text. It sits at the inline end (left in RTL) from a 56rem container width and moves below the text in narrower containers.
- `backgroundImage` puts a photo behind the content, covered by a scrim in the hero's `tone` (a gradient of `--background`, `--muted` or `--primary`), so text keeps its contrast on any photo and follows light/dark mode and the brand colour. The image is decorative (`alt=""`) unless you pass `alt`.

```tsx
<Hero
  tone="primary"
  size="lg"
  backgroundImage={{ src: "/img/addu.jpg", srcSet: "…", sizes: "100vw", position: "center 30%" }}
  title="Welcome to Addu City"
  description="The southernmost city of the Maldives."
  actions={<Button variant="secondary">Plan your trip</Button>}
/>
```

## Props

| Prop              | Type                                                       | Default   | Description                                                       |
| ----------------- | ---------------------------------------------------------- | --------- | ----------------------------------------------------------------- |
| `title`           | `ReactNode`                                                | required  | The heading                                                       |
| `eyebrow`         | `ReactNode`                                                |           | Short label above the title                                       |
| `description`     | `ReactNode`                                                |           | Lead text                                                         |
| `actions`         | `ReactNode`                                                |           | Buttons or links                                                  |
| `search`          | `ReactNode`                                                |           | A search field under the lead text                                |
| `media`           | `ReactNode`                                                |           | Image or illustration beside the text                             |
| `backgroundImage` | `string \| { src, alt?, srcSet?, sizes?, position? }`      |           | Photo behind the content, with a token scrim                      |
| `tone`            | `"plain" \| "muted" \| "primary"`                          | `"plain"` | Surface colour, or scrim colour over a background image           |
| `size`            | `"sm" \| "md" \| "lg"`                                     | `"md"`    | Padding and title size (`text-fluid-3xl` / `4xl` / `5xl`)         |
| `align`           | `"start" \| "center"`                                      | `"start"` | Text alignment (centred only without `media`)                     |
| `headingLevel`    | `1 \| 2 \| 3`                                              | `1`       | Heading element                                                   |
| `maxWidth`        | `"3xl" \| "4xl" \| "5xl" \| "6xl" \| "7xl" \| "none"`      | `"6xl"`   | Width of the centred content container                            |
| `rounded`         | `boolean`                                                  | `false`   | Rounded corners (for a hero inside a page, not edge to edge)      |
| `classNames`      | `{ container, content, eyebrow, title, description, search, actions, media, image, overlay }` | | Classes for each part |

Other `<section>` props go to the root. `heroVariants` is exported.

## Accessibility

- The hero is a `<section>` labelled by its heading, so it is a region landmark. The heading is an `<h1>` by default; use `headingLevel` when the page already has one.
- Background images are decorative by default; give `alt` when the photo carries information.
- Text sizes are mostly `rem`, so they follow browser zoom (WCAG 1.4.4), and long headings wrap with `text-wrap: balance`.

## RTL and Dhivehi

Alignment, padding and the media column use logical properties: the text starts on the right and the media is on the left in RTL. With `lang="dv"` the fluid headings get a taller line height so Thaana fili are not clipped.
