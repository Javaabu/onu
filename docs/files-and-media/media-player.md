# MediaPlayer

An accessible audio and video player built on [Media Chrome](https://www.media-chrome.org): play/pause, seek, time, mute and volume, captions, playback speed and full screen, with keyboard shortcuts, translated labels and Onu theming. Part of the optional media entry.

```bash
pnpm add media-chrome
```

```tsx
import { MediaPlayer } from "@javaabu/onu/media"

<MediaPlayer
  title="Coral reef restoration in Baa Atoll"
  src={[
    { src: "/video/reef.webm", type: "video/webm" },
    { src: "/video/reef.mp4", type: "video/mp4" },
  ]}
  poster="/video/reef.jpg"
  tracks={[
    { src: "/video/reef.dv.vtt", srcLang: "dv", label: "ދިވެހި", default: true },
    { src: "/video/reef.en.vtt", srcLang: "en", label: "English" },
  ]}
/>

<MediaPlayer kind="audio" title="Island news" src="/audio/news.mp3" />
```

## Props

| Prop                                      | Type                        | Default                  | Description                                                   |
| ----------------------------------------- | --------------------------- | ------------------------ | ------------------------------------------------------------- |
| `src`                                     | `string \| { src, type }[]` |                          | Media URL or sources                                          |
| `kind`                                    | `"video" \| "audio"`        | `"video"`                | Media type                                                    |
| `title`                                   | `string`                    |                          | Names the player (required)                                   |
| `poster`                                  | `string`                    |                          | Video poster                                                  |
| `tracks`                                  | `MediaTrack[]`              | `[]`                     | `{ src, srcLang, label, kind?, default? }` captions/subtitles |
| `playbackRates`                           | `number[]`                  | `[0.5, 1, 1.25, 1.5, 2]` | Speeds offered                                                |
| `seekOffset`                              | `number`                    | `10`                     | Seconds per seek button                                       |
| `loop`, `muted`, `preload`, `crossOrigin` |                             |                          | Passed to the media element                                   |
| `classNames`                              | `{ media, controlBar }`     |                          | Classes for each part                                         |

## Accessibility

Every control has a label; the captions button appears when `tracks` are given (R14.10). Controls are at least 44px on touch screens. In narrow players (under 24rem) the volume slider and the seek buttons hide so the timeline keeps its room and nothing overlaps the time display; mute stays, and the arrow keys still seek.

| Key                                          | Action              |
| -------------------------------------------- | ------------------- |
| <kbd>Space</kbd> / <kbd>K</kbd>              | Play / pause        |
| <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> | Seek back / forward |
| <kbd>M</kbd>                                 | Mute                |
| <kbd>F</kbd>                                 | Full screen         |
| <kbd>C</kbd>                                 | Captions            |

## RTL and Dhivehi

The control bar stays left-to-right in RTL, so the timeline and the seek keys match the media's time direction. Labels are registered with Media Chrome for the active locale (Dhivehi included) from the `file` namespace. Media Chrome's language setting is global, so all players on a page share the active locale.
