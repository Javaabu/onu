"use client"

import * as React from "react"
import YarlLightbox, { type Plugin } from "yet-another-react-lightbox"
import Captions from "yet-another-react-lightbox/plugins/captions"
import Counter from "yet-another-react-lightbox/plugins/counter"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/captions.css"
import "yet-another-react-lightbox/plugins/counter.css"

import { useControllableState } from "../hooks/use-controllable-state"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { registerEnglish } from "../i18n/english"
import { common as en_common } from "../locales/en/common"
import { file as en_file } from "../locales/en/file"

registerEnglish({ common: en_common, file: en_file })

const THEME_VARS: Record<`--yarl__${string}`, string> = {
  "--yarl__color_backdrop": "color-mix(in oklch, var(--background) 96%, transparent)",
  "--yarl__color_button": "var(--foreground)",
  "--yarl__color_button_active": "var(--primary)",
  "--yarl__color_button_disabled": "var(--muted-foreground)",
  "--yarl__button_filter": "none",
  "--yarl__slide_captions_container_background": "color-mix(in oklch, var(--background) 85%, transparent)",
  "--yarl__slide_title_color": "var(--foreground)",
  "--yarl__slide_description_color": "var(--muted-foreground)",
  "--yarl__counter_color": "var(--foreground)",
  "--yarl__counter_filter": "none",
}

export interface LightboxSlide {
  src: string
  /** Alt text (required, R14.10). */
  alt: string
  /** Caption title. */
  title?: React.ReactNode
  /** Caption text under the title. */
  description?: React.ReactNode
  width?: number
  height?: number
  /** Responsive sources. */
  srcSet?: { src: string; width: number; height: number }[]
}

export interface LightboxProps {
  /** Controlled open state. */
  open?: boolean
  /** Initial open state when uncontrolled. Default `false`. */
  defaultOpen?: boolean
  /** Called with `false` when the lightbox closes. */
  onOpenChange?: (open: boolean) => void
  slides: LightboxSlide[]
  /** Slide to show. Without it, the lightbox keeps track of the slide itself, starting from the first. */
  index?: number
  onIndexChange?: (index: number) => void
  /** Pinch, double-tap, wheel and button zoom. Default `true`. */
  zoom?: boolean
  /** Show captions (title/description). Default `true`. */
  captions?: boolean
  /** Show "2 / 8". Default `true`. */
  counter?: boolean
  /** Wrap from the last slide to the first. Default `false`. */
  loop?: boolean
  /** Extra yet-another-react-lightbox plugins. */
  plugins?: Plugin[]
  className?: string
  classNames?: { root?: string; icon?: string; counter?: string }
}

/**
 * Full-screen image viewer (yet-another-react-lightbox) with keyboard, swipe, zoom,
 * captions, focus trapping and focus return, translated labels and mirrored arrows in RTL.
 */
export function Lightbox({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  slides,
  index: indexProp,
  onIndexChange,
  zoom = true,
  captions = true,
  counter = true,
  loop = false,
  plugins = [],
  className,
  classNames,
}: LightboxProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange)
  const [index, setIndex] = useControllableState(indexProp, 0, onIndexChange)

  const labels = React.useMemo(
    () => ({
      Previous: t("file.previousImage"),
      Next: t("file.nextImage"),
      Close: t("common.close"),
      Slide: t("file.slide"),
      Carousel: t("file.carousel"),
      Lightbox: t("file.lightbox"),
      "Photo gallery": t("file.photoGallery"),
      "{index} of {total}": t("file.indexOfTotal"),
      "Zoom in": t("file.zoomIn"),
      "Zoom out": t("file.zoomOut"),
      Caption: t("file.caption"),
      "Show captions": t("file.showCaptions"),
      "Hide captions": t("file.hideCaptions"),
    }),
    [t],
  )

  const allPlugins = [
    ...(zoom ? [Zoom] : []),
    ...(captions ? [Captions] : []),
    ...(counter ? [Counter] : []),
    ...plugins,
  ]

  const iconClass = cn("yarl__icon", classNames?.icon)

  return (
    <YarlLightbox
      open={open}
      close={() => setOpen(false)}
      index={index}
      slides={slides as never}
      plugins={allPlugins}
      labels={labels}
      counter={{ className: classNames?.counter }}
      carousel={{ finite: !loop }}
      controller={{ closeOnBackdropClick: true }}
      on={{ view: ({ index: i }) => setIndex(i) }}
      // Theme the lightbox through its documented CSS variables, bound to Onu tokens.
      styles={{ root: THEME_VARS }}
      className={cn(
        "[&_button:focus-visible]:rounded-md [&_button:focus-visible]:outline-3 [&_button:focus-visible]:outline-ring [&_button:focus-visible]:outline-solid",
        classNames?.root,
        className,
      )}
      render={{
        // The lightbox already rotates its arrows in RTL, so the icons must not mirror again.
        iconPrev: () => <Icon name="chevron-left" flip={false} className={iconClass} />,
        iconNext: () => <Icon name="chevron-right" flip={false} className={iconClass} />,
        iconClose: () => <Icon name="close" className={iconClass} />,
        iconZoomIn: () => <Icon name="zoom-in" className={iconClass} />,
        iconZoomOut: () => <Icon name="zoom-out" className={iconClass} />,
      }}
    />
  )
}
