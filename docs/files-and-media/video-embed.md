# VideoEmbed

A click-to-load YouTube or Vimeo embed (the "lite embed" pattern): it shows a thumbnail and a play button, and loads the privacy-enhanced player (`youtube-nocookie.com`, Vimeo with `dnt=1`) only when the user presses play. Nothing is requested from the provider before that except the YouTube thumbnail (pass your own `thumbnail` to avoid even that).

```tsx
import { VideoEmbed } from "@javaabu/onu"

<VideoEmbed url="https://www.youtube.com/watch?v=aqz-KE-bpKQ" title="Hulhumalé phase 2 tour" />
<VideoEmbed provider="vimeo" videoId="76979871" title="Reef survey" thumbnail="/thumbs/reef.jpg" />
```

`parseVideoUrl(url)` and `videoEmbedUrl(provider, id, { start })` are exported. `t=` / `start=` in the URL sets the start time.

## Props

| Prop          | Type                                         | Default    | Description                          |
| ------------- | -------------------------------------------- | ---------- | ------------------------------------ |
| `url`         | `string`                                     |            | YouTube or Vimeo URL                 |
| `provider`    | `"youtube" \| "vimeo"`                       |            | Instead of `url`, with `videoId`     |
| `videoId`     | `string`                                     |            | Video id                             |
| `title`       | `string`                                     | (required) | Names the play button and the iframe |
| `thumbnail`   | `string`                                     | YouTube's  | Poster image (needed for Vimeo)      |
| `start`       | `number`                                     |            | Start time in seconds                |
| `aspectRatio` | `number`                                     | `16/9`     | Width / height                       |
| `notice`      | `ReactNode`                                  |            | Small print, e.g. a privacy note     |
| `classNames`  | `{ button, thumbnail, play, title, iframe }` |            | Classes for each part                |

## Accessibility

The play button is named "Play video: {title}". After it is pressed, the iframe (titled with `title`) gets focus, so keyboard users continue straight into the player. An unrecognised URL disables the button.

| Key                                 | Action        |
| ----------------------------------- | ------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Load and play |

## RTL and Dhivehi

The title overlay sits at the inline start and is isolated with `<bdi>`.
