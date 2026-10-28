# ShareButtons

Share a page. Where the device supports the [Web Share API](https://developer.mozilla.org/docs/Web/API/Navigator/share) (most phones), one **Share** button opens the system share sheet. Elsewhere it falls back to **Copy link**, Facebook, X, WhatsApp, Viber, Telegram and email.

```tsx
import { ShareButtons } from "@javaabu/onu"

<ShareButtons url={article.url} title={article.title} />
<ShareButtons native="never" networks={["copy", "whatsapp", "viber", "email"]} iconOnly />
```

## Props

| Prop       | Type                                              | Default      | Description                                                       |
| ---------- | ------------------------------------------------- | ------------ | ----------------------------------------------------------------- |
| `url`      | `string`                                          | current page | URL to share                                                      |
| `title`    | `string`                                          |              | Title (share sheet, X, Telegram, email subject)                   |
| `text`     | `string`                                          |              | Extra text (share sheet, email body)                              |
| `networks` | `ShareNetwork[]`                                  | all          | `copy`, `facebook`, `x`, `whatsapp`, `viber`, `telegram`, `email` |
| `native`   | `'auto' \| 'always' \| 'never'`                   | `'auto'`     | Share sheet only / plus networks / networks only                  |
| `iconOnly` | `boolean`                                         | `false`      | Icon buttons (labels stay as accessible names)                    |
| `icons`    | `Partial<Record<network \| 'native', ReactNode>>` |              | Replace icons, e.g. with brand logos                              |
| `size`     | `'sm' \| 'default' \| 'lg'`                       | `'default'`  | Button size                                                       |
| `variant`  | `'outline' \| 'ghost' \| 'secondary'`             | `'outline'`  | Button look                                                       |
| `onShare`  | `(network) => void`                               |              | Called after a share action                                       |

`shareUrl(network, url, title?, text?)` builds the share links.

:::info Brand icons
Onu's icon sets (Lucide, FontAwesome Free solid) don't include brand logos, so networks use generic icons with their names as text. Pass `icons` (e.g. from Simple Icons via the Iconify adapter) for logos.
:::

## Accessibility

- A `role="group"` named "Share".
- Network links are named "Share on Facebook", etc., and open in a new tab (email opens the mail app).
- "Link copied" is announced in a polite live region.

## RTL and Dhivehi

Labels are translated; the order follows the page direction.
