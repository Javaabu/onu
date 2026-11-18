# Icons

Onu uses [Lucide](https://lucide.dev) icons by default, with no setup. Components ask for icons by **semantic name** (`close`, `search`, `chevron-down`, …), so you can switch every built-in icon to another set — such as FontAwesome Pro — in one place.

```tsx
import { Icon } from '@javaabu/onu';

<Icon name="search" />                     // decorative (hidden from screen readers)
<Icon name="trash" label="Delete" />       // meaningful: role="img" + label
<Icon name="calendar" size="lg" className="text-primary" />
```

| Prop | Description |
|---|---|
| `name` | Semantic icon name (see `SEMANTIC_ICON_NAMES`) |
| `label` | Accessible name. Without it the icon is decorative |
| `size` | `xs`, `sm`, `md`, `lg`, `xl` or a number of pixels |
| `flip` | Force RTL mirroring on/off (on by default for directional icons) |
| `fallback` | Icon component or element used when no icon set has `name` |

# How names are resolved

`<Icon name="…">` looks for the name in this order:

1. your overrides from `OnuProvider icons={…}`
2. the default Lucide set (`lucideIconMap`), which `OnuProvider` loads on demand
3. the `fallback` prop
4. a generic alert icon

Neither Onu's components nor `OnuProvider` import the default set, so a page that uses only a few components does not ship all ~250 default icons. For example, importing just `Button` is about 12 kB (brotli) rather than 21 kB, and `OnuProvider` about 1 kB. Components that always show the same glyph, such as `Spinner`, a button's loading spinner, dialog close buttons and menu chevrons, pass that Lucide icon as `fallback`. They work even outside `OnuProvider`, and your `icons` overrides still replace them.

The first time an icon is chosen by name at runtime, such as `<Button startIcon="add">` or a navigation item's `icon: "home"`, `OnuProvider` loads the default set as a separate chunk (about 9 kB brotli). Until it arrives, which is usually within the first frames, the icon renders as an empty placeholder of the same size, so nothing shifts. Apps that never choose icons by name never download it.

To have every name resolved on the first render (for example in server-rendered pages or screenshots), bundle the set up front by passing it as overrides:

```tsx
import { lucideIconMap, OnuProvider } from '@javaabu/onu';

<OnuProvider icons={lucideIconMap}>            // or { ...lucideIconMap, add: MyAddIcon }
```

Wrap your app in `OnuProvider` (see [Installation](../installation-and-setup.md)). Outside it, icons chosen by name at runtime fall back to the generic icon. The `Icon` you import from `@javaabu/onu` is the exception: it includes the default set, so it resolves every name anywhere.

# FontAwesome Pro

Install FontAwesome's core packages and your Pro icon packages (they need your FontAwesome licence token for `npm.fontawesome.com`). Onu never bundles Pro icons.

```bash
npm install @fortawesome/fontawesome-svg-core @fortawesome/react-fontawesome @fortawesome/pro-regular-svg-icons
```

Then switch every built-in icon:

```tsx
import { fontAwesomeIconMap, requiredFontAwesomeIcons } from '@javaabu/onu/icons/fontawesome';
import { far } from '@fortawesome/pro-regular-svg-icons';

<OnuProvider icons={fontAwesomeIconMap({ style: 'regular', icons: [far] })}>
```

Importing the whole pack is simplest. To keep bundles small, import only the icons Onu uses — `requiredFontAwesomeIcons()` lists their names — or register them with `library.add` yourself.

Styles: `solid`, `regular`, `light`, `thin`, `duotone`, `sharp-solid`, `sharp-regular`, `sharp-light`, `sharp-thin`, `sharp-duotone-solid`, or any prefix (for example a Kit's `fak`). Icons missing in the chosen style fall back to `fallbackStyle` (solid). Duotone icons pick up the theme: the secondary layer uses the primary colour.

FontAwesome Free works the same way with `@fortawesome/free-solid-svg-icons`.

# Iconify (200,000+ icons)

```tsx
import { iconifySource, iconifyIconMap, registerIconifyCollections } from '@javaabu/onu/icons/iconify';
import tabler from '@iconify-json/tabler/icons.json';

const iconify = iconifySource({ collections: [tabler] });

<OnuProvider iconSources={[iconify]}>
```

Iconify runs offline: only the collections you register are used, and no requests go to the Iconify API — so it works on kiosks, intranets and under a strict Content Security Policy.

# Stored icon ids

`DynamicIcon` renders icons saved as strings (for example from a CMS or the menu builder): `lucide:house`, `tabler:home`, `fa:regular:house`. The icon picker returns ids in this format.

```tsx
<DynamicIcon id={menuItem.icon} />
```

# RTL

Directional icons — arrows, chevrons, back/forward, undo/redo, reply, send, log in/out, external link — mirror automatically in RTL, whichever icon set you use.
