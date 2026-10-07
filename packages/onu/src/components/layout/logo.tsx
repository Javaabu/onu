"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { NavLink } from "./_nav"

export interface LogoProps extends Omit<React.ComponentProps<"span">, "children"> {
  /** Image for light mode (and dark mode when `darkSrc` is not set). */
  src?: string
  /** Image for dark mode. */
  darkSrc?: string
  /** Accessible name, e.g. the organisation name. Required (R14.10). */
  alt: string
  /** Link target. Defaults to `/`; pass `null` to render without a link. */
  href?: string | null
  /** Wordmark shown next to the image. */
  text?: React.ReactNode
  /** Custom mark (e.g. an inline SVG) instead of `src`. */
  children?: React.ReactNode
  width?: number
  height?: number
  /** Render the mark as the child element (e.g. your own `<svg>` component). */
  asChild?: boolean
  classNames?: { image?: string; text?: string; link?: string }
}

/**
 * The product or organisation logo, with separate light/dark sources, linking home.
 * The link's accessible name is "<alt>, home".
 */
export function Logo({
  src,
  darkSrc,
  alt,
  href = "/",
  text,
  children,
  width,
  height,
  asChild = false,
  className,
  classNames,
  ...props
}: LogoProps) {
  const { t } = useTranslation()
  const imageClass = cn("h-8 w-auto shrink-0", classNames?.image)
  const decorative = Boolean(text) || Boolean(href)

  let mark: React.ReactNode = null
  if (asChild || children) {
    mark = asChild ? <Slot.Root className={imageClass}>{children}</Slot.Root> : children
  } else if (src) {
    mark = darkSrc ? (
      <>
        <img
          src={src}
          alt={decorative ? "" : alt}
          width={width}
          height={height}
          className={cn(imageClass, "dark:hidden")}
        />
        <img
          src={darkSrc}
          alt={decorative ? "" : alt}
          width={width}
          height={height}
          className={cn(imageClass, "hidden dark:block")}
        />
      </>
    ) : (
      <img src={src} alt={decorative ? "" : alt} width={width} height={height} className={imageClass} />
    )
  }

  const content = (
    <>
      {mark}
      {text ? <span className={cn("text-base font-semibold tracking-tight", classNames?.text)}>{text}</span> : null}
    </>
  )

  return (
    <span data-slot="logo" className={cn("inline-flex items-center", className)} {...props}>
      {href ? (
        <NavLink
          href={href}
          aria-label={t("layout.homeLink", { name: alt })}
          className={cn(
            "gap-2 inline-flex items-center rounded-md text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            classNames?.link,
          )}
        >
          {content}
        </NavLink>
      ) : (
        <span
          className="gap-2 inline-flex items-center"
          role={text || src ? undefined : "img"}
          aria-label={text || src ? undefined : alt}
        >
          {content}
        </span>
      )}
    </span>
  )
}
