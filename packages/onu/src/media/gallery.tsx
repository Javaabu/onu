"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"
import { Lightbox, type LightboxProps, type LightboxSlide } from "./lightbox"

export interface GalleryImage extends LightboxSlide {
  /** Smaller image for the grid. Defaults to `src`. */
  thumbnail?: string
}

/** Classes for the gallery's list, by layout and column count (container queries). */
export const galleryVariants = cva("gap-3", {
  variants: {
    layout: { grid: "grid grid-cols-2", masonry: "columns-2" },
    columns: { 2: "", 3: "", 4: "" },
  },
  compoundVariants: [
    { layout: "grid", columns: 3, className: "@md/gallery:grid-cols-3" },
    { layout: "grid", columns: 4, className: "@md/gallery:grid-cols-3 @2xl/gallery:grid-cols-4" },
    { layout: "masonry", columns: 3, className: "@md/gallery:columns-3" },
    { layout: "masonry", columns: 4, className: "@md/gallery:columns-3 @2xl/gallery:columns-4" },
  ],
  defaultVariants: { layout: "grid", columns: 3 },
})

export interface GalleryProps
  extends Omit<React.ComponentProps<"div">, "children">, VariantProps<typeof galleryVariants> {
  images: GalleryImage[]
  /** Thumbnail shape in the grid layout. Default `square`. */
  aspect?: "square" | "video" | "portrait"
  /** Show each image's title under it. */
  showCaptions?: boolean
  /** Open the lightbox on click. Default `true`. */
  lightbox?: boolean
  /** Options passed to the lightbox (zoom, captions, counter, loop, plugins). */
  lightboxProps?: Omit<LightboxProps, "open" | "onOpenChange" | "slides" | "index" | "onIndexChange">
  /** Called when an image is activated (also when the lightbox is off). */
  onImageClick?: (index: number) => void
  classNames?: { list?: string; item?: string; image?: string; caption?: string }
}

/**
 * Responsive image grid or masonry. Thumbnails are lazy-loaded; activating one opens the
 * Lightbox (keyboard, swipe, zoom), and focus returns to the thumbnail on close.
 */
export function Gallery({
  images,
  layout,
  columns,
  aspect = "square",
  showCaptions = false,
  lightbox = true,
  lightboxProps,
  onImageClick,
  className,
  classNames,
  ...props
}: GalleryProps) {
  const [index, setIndex] = React.useState(-1)
  const masonry = layout === "masonry"

  return (
    <div
      data-slot="gallery"
      data-layout={masonry ? "masonry" : "grid"}
      className={cn("@container/gallery w-full", className)}
      {...props}
    >
      <ul className={cn(galleryVariants({ layout, columns }), classNames?.list)}>
        {images.map((image, i) => (
          <li key={`${image.src}-${i}`} className={cn(masonry && "mb-3 break-inside-avoid", classNames?.item)}>
            <figure className="gap-1.5 m-0 grid">
              <button
                type="button"
                aria-haspopup={lightbox ? "dialog" : undefined}
                onClick={() => {
                  onImageClick?.(i)
                  if (lightbox) setIndex(i)
                }}
                className="group/gallery block w-full cursor-zoom-in overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <img
                  src={image.thumbnail ?? image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    "w-full object-cover transition-transform duration-200 group-hover/gallery:scale-105",
                    masonry
                      ? "h-auto"
                      : aspect === "video"
                        ? "aspect-video"
                        : aspect === "portrait"
                          ? "aspect-[3/4]"
                          : "aspect-square",
                    classNames?.image,
                  )}
                />
              </button>
              {showCaptions && image.title ? (
                <figcaption className={cn("text-sm text-muted-foreground", classNames?.caption)}>
                  <bdi>{image.title}</bdi>
                </figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
      {lightbox ? (
        <Lightbox
          {...lightboxProps}
          open={index >= 0}
          onOpenChange={(open) => !open && setIndex(-1)}
          slides={images}
          index={Math.max(0, index)}
          onIndexChange={setIndex}
        />
      ) : null}
    </div>
  )
}
