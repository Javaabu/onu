# Tag

A compact label (chip) for categories, keywords and filters. It can be static, clickable, a link, removable, or all of these. It looks like an Ant Design tag: 22px tall, 4px corners, a hairline border and 12px text.

```tsx
import { Tag } from "@javaabu/onu"

<Tag>Malé</Tag>
<Tag icon="map-pin" variant="outline">Addu</Tag>
<Tag onRemove={() => remove("laamu")}>Laamu</Tag>
<Tag onClick={toggle} selected={active}>Fuvahmulah</Tag>
<Tag href="/tags/news">News</Tag>
<Tag color="green">Paid</Tag>
```

## Colours

`variant="default"` is the grey tag, `primary` is tinted with the brand colour (`--primary-1` fill, `--primary-3` border), and `outline` is a plain bordered tag. `color` picks one of Ant Design's preset colours instead: `blue`, `cyan`, `green`, `red` or `gold`. They come from the `--onu-preset-<colour>`, `-border` and `-foreground` tokens (see [Theming](../guides/theming.md#preset-colours)), with AA text in light and dark mode.

## Props

| Prop          | Type                                  | Default     | Description                                       |
| ------------- | ------------------------------------- | ----------- | ------------------------------------------------- |
| `variant`     | `'default' \| 'primary' \| 'outline'` | `'default'` | Look                                              |
| `color`       | `'blue' \| 'cyan' \| 'green' \| 'red' \| 'gold'` |  | Ant preset colour (overrides the variant's colours) |
| `size`        | `'sm' \| 'md' \| 'lg'`                | `'md'`      | Size                                              |
| `icon`        | `string \| ReactNode`                 |             | Icon before the label                             |
| `onClick`     | `(e) => void`                         |             | Makes the label a button                          |
| `href`        | `string`                              |             | Makes the label a link                            |
| `selected`    | `boolean`                             |             | Selected state (`aria-pressed` on clickable tags) |
| `onRemove`    | `() => void`                          |             | Shows a × button                                  |
| `removeLabel` | `string`                              |             | Accessible name for × (default "Remove {label}")  |
| `disabled`    | `boolean`                             |             | Disables the tag and its × button                 |
| `classNames`  | `{ label, remove, icon }`             |             | Classes for each part                             |

Variants are exported as `tagVariants` (`variant`, `color`, `size`). Parts have `data-slot="tag"` (with `data-variant` and `data-color`), `tag-label` and `tag-remove`.

## Accessibility

- The remove button has its own accessible name ("Remove Malé").
- On touch screens the label and × get a 44px hit area without changing the layout.

| Key                                      | Action                                   |
| ---------------------------------------- | ---------------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd>      | Activate a clickable tag or the × button |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Remove a focused clickable/link tag      |

## RTL and Dhivehi

The × button sits at the inline end, so it moves to the left in RTL. Dhivehi labels use the Thaana font automatically.
