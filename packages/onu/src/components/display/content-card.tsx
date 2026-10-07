"use client"

import * as React from "react"
import { format as formatDate } from "date-fns"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { toDate, type DateInput } from "./_utils"
import { AppLink } from "./_link"

interface ImageProps {
  src: string
  /** Required: describe the image, or pass `""` when it is purely decorative (R14.10). */
  alt: string
}

export interface ContentCardProps extends Omit<React.ComponentProps<"article">, "title"> {
  title: React.ReactNode
  /** Short summary; clamped to three lines. */
  excerpt?: React.ReactNode
  image?: ImageProps
  /** Link for the whole card (the title is the link; the card is clickable). */
  href?: string
  /** Publish date, shown in the locale's format. */
  date?: DateInput
  /** date-fns format for `date`. Default `"PP"`. */
  dateFormat?: string
  /** Category or type label, e.g. "News". */
  category?: React.ReactNode
  /** Extra meta items (author, read time, venue). */
  meta?: React.ReactNode
  /** Footer content such as tags or a "Read more" link. */
  footer?: React.ReactNode
  /**
   * `vertical` (default): image on top. `horizontal`: image beside the text,
   * stacking vertically when the card is narrow.
   */
  orientation?: "vertical" | "horizontal"
  /** Heading level for the title. Default `3`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  classNames?: { image?: string; body?: string; title?: string; excerpt?: string; meta?: string; footer?: string }
}

/**
 * A card for news articles, services or events: image, title, excerpt, date,
 * category and a link. The whole card is clickable, but only the title is a
 * link, so screen readers hear a short link name.
 */
export function ContentCard({
  title,
  excerpt,
  image,
  href,
  date,
  dateFormat = "PP",
  category,
  meta,
  footer,
  orientation = "vertical",
  headingLevel = 3,
  className,
  classNames,
  ...props
}: ContentCardProps) {
  const { locale } = useTranslation()
  const parsed = toDate(date)
  const Heading = `h${headingLevel}` as const
  const horizontal = orientation === "horizontal"

  return (
    <div className="@container h-full">
      <article
        data-slot="content-card"
        data-orientation={orientation}
        className={cn(
          "group/content-card relative flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground transition-shadow",
          href && "hover:shadow-md has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50",
          horizontal && "@lg:flex-row",
          className,
        )}
        {...props}
      >
        {image ? (
          <div
            className={cn(
              "aspect-video overflow-hidden bg-muted",
              horizontal && "@lg:aspect-auto @lg:w-2/5 @lg:shrink-0",
              classNames?.image,
            )}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="size-full object-cover transition-transform duration-200 group-hover/content-card:scale-[1.02] motion-reduce:transition-none"
            />
          </div>
        ) : null}
        <div className={cn("gap-2 p-4 flex flex-1 flex-col", classNames?.body)}>
          {parsed || category || meta ? (
            <div
              className={cn(
                "gap-x-3 gap-y-1 text-xs flex flex-wrap items-center text-muted-foreground",
                classNames?.meta,
              )}
            >
              {category ? (
                <span className="font-medium text-primary" data-slot="content-card-category">
                  {category}
                </span>
              ) : null}
              {parsed ? (
                <time dateTime={parsed.toISOString()} className="gap-1 inline-flex items-center">
                  <Icon name="calendar" className="size-3.5" />
                  {formatDate(parsed, dateFormat, { locale: locale.dateFns })}
                </time>
              ) : null}
              {meta}
            </div>
          ) : null}
          <Heading className={cn("text-base font-semibold leading-snug text-balance", classNames?.title)}>
            {href ? (
              <AppLink
                href={href}
                className="after:inset-0 underline-offset-4 outline-none after:absolute hover:underline"
              >
                {title}
              </AppLink>
            ) : (
              title
            )}
          </Heading>
          {excerpt ? (
            <p className={cn("text-sm line-clamp-3 text-muted-foreground", classNames?.excerpt)}>{excerpt}</p>
          ) : null}
          {footer ? (
            <div className={cn("pt-2 gap-2 relative z-10 mt-auto flex flex-wrap items-center", classNames?.footer)}>
              {footer}
            </div>
          ) : null}
        </div>
      </article>
    </div>
  )
}
