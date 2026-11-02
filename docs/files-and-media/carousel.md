# Carousel

shadcn's Carousel (Embla) extended with RTL direction, translated controls, dot navigation, autoplay with a pause button, and slide announcements. Swipe works on touch out of the box. Compose it with the shadcn parts.

```tsx
import {
  Carousel,
  CarouselAutoplayToggle,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@javaabu/onu"

;<Carousel label="Featured islands" autoplay={{ delay: 4000 }} loop>
  <CarouselContent>
    {photos.map((p) => (
      <CarouselItem key={p.src}>
        <img src={p.src} alt={p.alt} loading="lazy" />
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
  <div className="gap-2 flex items-center justify-center">
    <CarouselAutoplayToggle />
    <CarouselDots />
  </div>
</Carousel>
```

:::info

`Carousel` replaces shadcn's primitive of the same name in the main export. The plain primitive is still available from `@javaabu/onu/primitives`; `CarouselContent`, `CarouselItem`, `CarouselPrevious` and `CarouselNext` are shared.

:::

## Autoplay

Autoplay advances every `delay` ms and wraps to the first slide. It pauses while the pointer is over the carousel or focus is inside it, never runs with `prefers-reduced-motion`, and `CarouselAutoplayToggle` pauses it for good (WCAG 2.2.2). With `stopOnInteraction`, swiping or using the controls stops it.

## Props

`Carousel` takes shadcn's props (`opts`, `plugins`, `orientation`, `setApi`) plus:

| Prop       | Type                                        | Default | Description                   |
| ---------- | ------------------------------------------- | ------- | ----------------------------- |
| `label`    | `string`                                    |         | Accessible name of the region |
| `autoplay` | `boolean \| { delay?, stopOnInteraction? }` | `false` | Advance automatically         |
| `loop`     | `boolean`                                   |         | Wrap around                   |

`CarouselDots` takes `classNames={{ dot }}`; `CarouselAutoplayToggle` takes Button props. `useCarouselState()` returns `{ api, selected, count, playing, setPlaying }`.

## Accessibility

The root is a `region` with `aria-roledescription="carousel"`; slides are groups. "Slide 2 of 5" is announced politely when the slide changes (silenced while autoplaying). Dots are buttons ("Go to slide 3") with `aria-current` on the active one, and at least 44px on touch screens.

| Key                   | Action                       |
| --------------------- | ---------------------------- |
| <kbd>ArrowRight</kbd> | Next slide (previous in RTL) |
| <kbd>ArrowLeft</kbd>  | Previous slide (next in RTL) |
| <kbd>Tab</kbd>        | Move to the buttons and dots |

## RTL and Dhivehi

Embla gets `direction: "rtl"` from `OnuProvider`, so slides lay out and swipe right-to-left, arrow keys follow the visual order, and the prev/next icons mirror. Labels come from the locale.
