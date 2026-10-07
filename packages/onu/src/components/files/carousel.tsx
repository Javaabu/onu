"use client"

import * as React from "react"

import { useMediaQuery } from "../../hooks/use-media-query"
import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Carousel as BaseCarousel, type CarouselApi } from "../../ui/carousel"

export interface CarouselAutoplayOptions {
  /** Milliseconds per slide. Default 5000. */
  delay?: number
  /** Stop for good once the user swipes, drags or uses the controls. Default `false`. */
  stopOnInteraction?: boolean
}

interface OnuCarouselContextValue {
  api: CarouselApi | undefined
  selected: number
  count: number
  autoplay: boolean
  playing: boolean
  setPlaying: (playing: boolean) => void
  interact: () => void
}

const OnuCarouselContext = React.createContext<OnuCarouselContextValue | null>(null)

/** Onu carousel state (selected slide, count, autoplay) from inside a `Carousel`. */
export function useCarouselState() {
  const ctx = React.useContext(OnuCarouselContext)
  if (!ctx) throw new Error("useCarouselState must be used within an Onu <Carousel />")
  return ctx
}

function useEmblaValue<T>(api: CarouselApi | undefined, read: (api: NonNullable<CarouselApi>) => T, fallback: T) {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (!api) return () => {}
      api.on("select", onChange)
      api.on("reInit", onChange)
      return () => {
        api.off("select", onChange)
        api.off("reInit", onChange)
      }
    },
    [api],
  )
  return React.useSyncExternalStore(
    subscribe,
    () => (api ? read(api) : fallback),
    () => fallback,
  )
}

export interface CarouselProps extends React.ComponentProps<typeof BaseCarousel> {
  /** Accessible name for the carousel region, e.g. "Featured islands". */
  label?: string
  /** Advance slides automatically. Pauses on hover and focus, and has a pause button (`CarouselAutoplayToggle`). */
  autoplay?: boolean | CarouselAutoplayOptions
  /** Wrap from the last slide to the first. */
  loop?: boolean
}

/**
 * shadcn's Carousel (Embla) with RTL direction, translated controls, autoplay with pause,
 * dot navigation (`CarouselDots`) and slide announcements. Compose it with
 * `CarouselContent`, `CarouselItem`, `CarouselPrevious` and `CarouselNext`.
 */
export function Carousel({
  label,
  autoplay = false,
  loop,
  opts,
  setApi,
  className,
  children,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: CarouselProps) {
  const { t } = useTranslation()
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const [api, setLocalApi] = React.useState<CarouselApi>()
  const options = typeof autoplay === "object" ? autoplay : {}
  const delay = options.delay ?? 5000
  const [playing, setPlaying] = React.useState(!!autoplay)
  const [stopped, setStopped] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const selected = useEmblaValue(api, (a) => a.selectedScrollSnap(), 0)
  const count = useEmblaValue(api, (a) => a.scrollSnapList().length, 0)
  const running = !!autoplay && playing && !stopped && !hovered && !focused && !reducedMotion

  const handleApi = React.useCallback(
    (next: CarouselApi) => {
      setLocalApi(next)
      setApi?.(next)
    },
    [setApi],
  )

  React.useEffect(() => {
    if (!api || !running) return
    const timer = setInterval(() => {
      if (api.canScrollNext()) api.scrollNext()
      else api.scrollTo(0)
    }, delay)
    return () => clearInterval(timer)
  }, [api, running, delay])

  const interact = React.useCallback(() => {
    if (options.stopOnInteraction) setStopped(true)
  }, [options.stopOnInteraction])

  const ctx = React.useMemo<OnuCarouselContextValue>(
    () => ({
      api,
      selected,
      count,
      autoplay: !!autoplay,
      playing: playing && !stopped,
      setPlaying: (next) => {
        setStopped(false)
        setPlaying(next)
      },
      interact,
    }),
    [api, selected, count, autoplay, playing, stopped, interact],
  )

  return (
    <OnuCarouselContext.Provider value={ctx}>
      <BaseCarousel
        opts={{ loop, ...opts }}
        setApi={handleApi}
        aria-label={label}
        data-autoplay={running ? "running" : autoplay ? "paused" : undefined}
        className={cn("touch-pan-y", className)}
        onPointerDown={(e) => {
          interact()
          onPointerDown?.(e)
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHovered(true)
          onPointerEnter?.(e)
        }}
        onPointerLeave={(e) => {
          setHovered(false)
          onPointerLeave?.(e)
        }}
        onFocus={(e) => {
          setFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
          onBlur?.(e)
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") interact()
          onKeyDown?.(e)
        }}
        {...props}
      >
        {children}
        <div aria-live={running ? "off" : "polite"} aria-atomic className="sr-only">
          {count ? t("file.slideOf", { index: selected + 1, total: count }) : null}
        </div>
      </BaseCarousel>
    </OnuCarouselContext.Provider>
  )
}

export interface CarouselDotsProps extends React.ComponentProps<"div"> {
  classNames?: { dot?: string }
}

/** One button per slide; the current one is marked with `aria-current`. */
export function CarouselDots({ className, classNames, ...props }: CarouselDotsProps) {
  const { t } = useTranslation()
  const { api, selected, count, interact } = useCarouselState()
  if (count < 2) return null
  return (
    <div
      role="group"
      aria-label={t("file.chooseSlide")}
      data-slot="carousel-dots"
      className={cn("gap-1 mt-3 flex items-center justify-center", className)}
      {...props}
    >
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={t("file.goToSlide", { index: i + 1 })}
          aria-current={i === selected ? "true" : undefined}
          onClick={() => {
            interact()
            api?.scrollTo(i)
          }}
          className={cn(
            "group/dot size-6 touch:size-11 flex items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            classNames?.dot,
          )}
        >
          <span className="size-2 group-aria-[current=true]/dot:w-5 block rounded-full bg-foreground/25 transition-all group-hover/dot:bg-foreground/50 group-aria-[current=true]/dot:bg-primary" />
        </button>
      ))}
    </div>
  )
}

export type CarouselAutoplayToggleProps = Omit<React.ComponentProps<typeof Button>, "children" | "onClick">

/** Pause / play button for an autoplaying carousel (WCAG 2.2.2). */
export function CarouselAutoplayToggle({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: CarouselAutoplayToggleProps) {
  const { t } = useTranslation()
  const { autoplay, playing, setPlaying } = useCarouselState()
  if (!autoplay) return null
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      data-slot="carousel-autoplay-toggle"
      aria-label={playing ? t("file.pauseSlides") : t("file.playSlides")}
      className={cn("rounded-full", className)}
      onClick={() => setPlaying(!playing)}
      {...props}
    >
      <Icon name={playing ? "pause" : "play"} />
    </Button>
  )
}
