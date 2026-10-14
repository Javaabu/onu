"use client"

// Vendored from shadcn/ui (radix base, nova style, RTL) by scripts/sync-shadcn.mjs.
// Onu changes are marked with "onu:" comments; keep them when re-syncing.

import * as React from "react"
import { cn } from "../lib/utils"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"

import { Button } from "./button"
// onu: fixed glyphs passed as Icon fallbacks, so primitives work without OnuProvider and the full icon map.
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Icon } from "../icons/icon"
// onu: direction and translated labels.
import { useOnu } from "../providers/onu-provider"
import { registerEnglish } from "../i18n/english"
import { common as en_common } from "../locales/en/common"

registerEnglish({ common: en_common })

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  // onu: Embla needs the reading direction to lay out and swipe correctly in RTL.
  const { dir } = useOnu()
  const [carouselRef, api] = useEmblaCarousel(
    {
      direction: dir,
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // onu: arrow keys follow visual order, so ArrowLeft moves forward in RTL (R11.5).
      const rtl = (opts?.direction ?? dir) === "rtl"
      if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext, opts?.direction, dir],
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
      <div className={cn("flex", orientation === "horizontal" ? "-ms-4" : "-mt-4 flex-col", className)} {...props} />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "ps-4" : "pt-4", className)}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()
  const { t } = useOnu()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "inset-y-0 -start-12 my-auto"
          : "-top-12 start-1/2 -translate-x-1/2 rotate-90 rtl:translate-x-1/2",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      {/* onu: the Icon already mirrors in RTL; translated label. */}
      <Icon name="chevron-left" fallback={ChevronLeftIcon} />
      <span className="sr-only">{t("common.previousSlide")}</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()
  const { t } = useOnu()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "inset-y-0 -end-12 my-auto"
          : "-bottom-12 start-1/2 -translate-x-1/2 rotate-90 rtl:translate-x-1/2",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      {/* onu: the Icon already mirrors in RTL; translated label. */}
      <Icon name="chevron-right" fallback={ChevronRightIcon} />
      <span className="sr-only">{t("common.nextSlide")}</span>
    </Button>
  )
}

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, useCarousel }
