import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

/*
 * Tones are surfaces made from theme tokens. Over a background image the same tone
 * becomes a translucent scrim, strong enough to keep text readable on any photo.
 */
export const heroVariants = cva("@container/hero relative isolate overflow-hidden", {
  variants: {
    tone: {
      plain: "bg-background text-foreground",
      muted: "bg-muted text-foreground",
      primary: "bg-primary text-primary-foreground",
    },
    size: {
      sm: "py-10 @3xl/hero:py-14",
      md: "py-14 @3xl/hero:py-20",
      lg: "py-16 @3xl/hero:py-28",
    },
    rounded: {
      true: "rounded-xl",
      false: "",
    },
  },
  defaultVariants: { tone: "plain", size: "md", rounded: false },
})

const OVERLAY: Record<NonNullable<HeroProps["tone"]>, string> = {
  plain: "bg-linear-to-t from-background/95 via-background/85 to-background/70",
  muted: "bg-linear-to-t from-muted/95 via-muted/90 to-muted/75",
  primary: "bg-linear-to-t from-primary/95 via-primary/90 to-primary/80",
}

const TITLE_SIZE = { sm: "text-fluid-3xl", md: "text-fluid-4xl", lg: "text-fluid-5xl" } as const

export interface HeroBackgroundImage {
  src: string
  /** Alt text when the image carries meaning. Omit for a decorative image (the default). */
  alt?: string
  srcSet?: string
  sizes?: string
  /** CSS `object-position`, e.g. `"center 30%"`. */
  position?: string
}

export interface HeroProps extends Omit<React.ComponentProps<"section">, "title">, VariantProps<typeof heroVariants> {
  /** The page or section heading. */
  title: React.ReactNode
  /** A short label above the title, e.g. the service or department name. */
  eyebrow?: React.ReactNode
  /** Lead text under the title. */
  description?: React.ReactNode
  /** Calls to action (buttons or links). */
  actions?: React.ReactNode
  /** A search field (e.g. `<SearchInput />`) under the lead text. */
  search?: React.ReactNode
  /** An image or illustration beside the text (below it in narrow containers). */
  media?: React.ReactNode
  /** A photo behind the content, covered by a token-coloured scrim (`tone`). */
  backgroundImage?: string | HeroBackgroundImage
  /** `start` (default) or `center`. Centred only applies without `media`. */
  align?: "start" | "center"
  /** Heading element. Default `1`: a hero usually holds the page's main heading. */
  headingLevel?: 1 | 2 | 3
  /** Constrain the content to a centred container of this width. Default `"6xl"`. */
  maxWidth?: "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "none"
  classNames?: {
    container?: string
    content?: string
    eyebrow?: string
    title?: string
    description?: string
    search?: string
    actions?: string
    media?: string
    image?: string
    overlay?: string
  }
}

const MAX_WIDTH: Record<NonNullable<HeroProps["maxWidth"]>, string> = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  none: "",
}

/**
 * The opening block of a portal or content page (R3.7): heading, lead text, calls
 * to action, an optional search field and media or background photo. Type is
 * fluid (`clamp()`, R3.4) and the layout follows its container, so it works full
 * width or in a column, in LTR and RTL.
 */
export function Hero({
  title,
  eyebrow,
  description,
  actions,
  search,
  media,
  backgroundImage,
  align = "start",
  headingLevel = 1,
  maxWidth = "6xl",
  tone,
  size,
  rounded,
  className,
  classNames,
  children,
  id,
  ...props
}: HeroProps) {
  const autoId = React.useId()
  const titleId = `${id ?? autoId}-title`
  const Heading = `h${headingLevel}` as const
  const image = typeof backgroundImage === "string" ? { src: backgroundImage } : backgroundImage
  const centered = align === "center" && !media
  const resolvedTone = tone ?? "plain"

  return (
    <section
      data-slot="hero"
      data-tone={resolvedTone}
      data-align={centered ? "center" : "start"}
      id={id}
      aria-labelledby={titleId}
      className={cn(heroVariants({ tone, size, rounded }), className)}
      {...props}
    >
      {image ? (
        <>
          <img
            data-slot="hero-image"
            src={image.src}
            srcSet={image.srcSet}
            sizes={image.sizes}
            alt={image.alt ?? ""}
            aria-hidden={image.alt ? undefined : true}
            decoding="async"
            className={cn("inset-0 absolute -z-20 size-full object-cover", classNames?.image)}
            style={image.position ? { objectPosition: image.position } : undefined}
          />
          <div
            data-slot="hero-overlay"
            aria-hidden
            className={cn("inset-0 absolute -z-10", OVERLAY[resolvedTone], classNames?.overlay)}
          />
        </>
      ) : null}
      <div
        data-slot="hero-container"
        className={cn(
          "px-4 sm:px-6 gap-10 mx-auto grid w-full items-center",
          MAX_WIDTH[maxWidth],
          media && "@4xl/hero:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] @4xl/hero:gap-12",
          classNames?.container,
        )}
      >
        <div
          data-slot="hero-content"
          className={cn(
            "gap-5 min-w-0 flex flex-col",
            centered ? "max-w-3xl mx-auto items-center text-center" : "items-start text-start",
            classNames?.content,
          )}
        >
          {eyebrow ? (
            <p
              data-slot="hero-eyebrow"
              className={cn(
                "text-sm font-medium",
                resolvedTone === "primary" ? "text-primary-foreground/85" : "text-primary",
                classNames?.eyebrow,
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <Heading
            id={titleId}
            data-slot="hero-title"
            className={cn("font-semibold tracking-tight text-balance", TITLE_SIZE[size ?? "md"], classNames?.title)}
          >
            {title}
          </Heading>
          {description ? (
            <div
              data-slot="hero-description"
              className={cn(
                "max-w-2xl text-fluid-lg text-pretty",
                resolvedTone === "primary" ? "text-primary-foreground/85" : "text-muted-foreground",
                classNames?.description,
              )}
            >
              {description}
            </div>
          ) : null}
          {search ? (
            <div data-slot="hero-search" className={cn("max-w-xl w-full", classNames?.search)}>
              {search}
            </div>
          ) : null}
          {actions ? (
            <div
              data-slot="hero-actions"
              className={cn(
                "gap-3 pt-1 flex flex-wrap items-center",
                centered && "justify-center",
                classNames?.actions,
              )}
            >
              {actions}
            </div>
          ) : null}
          {children}
        </div>
        {media ? (
          <div
            data-slot="hero-media"
            className={cn("min-w-0 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-xl", classNames?.media)}
          >
            {media}
          </div>
        ) : null}
      </div>
    </section>
  )
}
