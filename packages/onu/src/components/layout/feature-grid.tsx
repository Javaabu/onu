import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { NavLink } from "./_nav"

export interface FeatureItem {
  /** Stable key. Defaults to the index. */
  id?: string
  /** Semantic icon name (e.g. `"file-text"`), or any node such as an image. */
  icon?: string | React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Makes the whole item a link (the title is the link text). */
  href?: string
  /** Opens in a new tab, with a screen-reader note. */
  external?: boolean
  /** Visible cue under a linked item. Defaults to "Learn more"; `false` hides it. */
  linkLabel?: React.ReactNode | false
}

type Columns = 2 | 3 | 4

// Literal class names so Tailwind sees them. Columns follow the grid's own width (R3.19).
const COLUMN_CLASSES: Record<Columns, string> = {
  2: "@xl/features:grid-cols-2",
  3: "@xl/features:grid-cols-2 @4xl/features:grid-cols-3",
  4: "@xl/features:grid-cols-2 @4xl/features:grid-cols-3 @6xl/features:grid-cols-4",
}

export const featureGridItemVariants = cva("group/feature gap-3 min-w-0 relative flex flex-col", {
  variants: {
    variant: {
      plain: "",
      card: "p-5 rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10",
      muted: "p-5 rounded-xl bg-muted/50",
    },
    linked: {
      true: "focus-within:ring-3 focus-within:ring-ring/50",
      false: "",
    },
  },
  compoundVariants: [
    { variant: "card", linked: true, class: "hover:shadow-md transition-shadow hover:ring-foreground/20" },
    { variant: "muted", linked: true, class: "transition-colors hover:bg-muted" },
    { variant: "plain", linked: true, class: "-m-3 p-3 rounded-xl hover:bg-muted/50" },
  ],
  defaultVariants: { variant: "card", linked: false },
})

export interface FeatureGridProps
  extends Omit<React.ComponentProps<"ul">, "children">, Pick<VariantProps<typeof featureGridItemVariants>, "variant"> {
  items: FeatureItem[]
  /** Most columns, reached as the grid gets wider: 1 → 2 (≥ 36rem) → 3 (≥ 56rem) → 4 (≥ 72rem). Default `3`. */
  columns?: Columns
  /** Heading level of each item's title. Default `3` (under a section's `h2`). */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** `start` (default) or `center`. */
  align?: "start" | "center"
  classNames?: {
    root?: string
    item?: string
    icon?: string
    title?: string
    description?: string
    link?: string
  }
}

/**
 * A responsive grid of features or services (R3.7): icon, title, description and
 * an optional link, with columns from container queries so it fits a full page or
 * a sidebar. A linked item is one link (its title) with the whole card clickable.
 */
export function FeatureGrid({
  items,
  columns = 3,
  variant,
  headingLevel = 3,
  align = "start",
  className,
  classNames,
  ...props
}: FeatureGridProps) {
  const { t } = useTranslation()
  const Heading = `h${headingLevel}` as const
  const centered = align === "center"

  return (
    <div data-slot="feature-grid" className={cn("@container/features", className)}>
      <ul
        className={cn("gap-4 @xl/features:gap-6 grid grid-cols-1", COLUMN_CLASSES[columns], classNames?.root)}
        {...props}
      >
        {items.map((item, index) => {
          const linked = !!item.href
          const linkLabel = item.linkLabel === undefined ? t("layout.learnMore") : item.linkLabel
          return (
            <li
              key={item.id ?? index}
              data-slot="feature-grid-item"
              className={cn(
                featureGridItemVariants({ variant, linked }),
                centered ? "items-center text-center" : "items-start text-start",
                classNames?.item,
              )}
            >
              {item.icon ? (
                <span
                  data-slot="feature-grid-icon"
                  aria-hidden
                  className={cn(
                    "size-11 [&_svg]:size-5 flex shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary-subtle-foreground",
                    classNames?.icon,
                  )}
                >
                  {typeof item.icon === "string" ? <Icon name={item.icon} /> : item.icon}
                </span>
              ) : null}
              <Heading
                data-slot="feature-grid-title"
                className={cn("text-base font-semibold leading-snug", classNames?.title)}
              >
                {item.href ? (
                  <NavLink
                    href={item.href}
                    external={item.external}
                    // The link's hit area covers the whole item; focus shows on the item.
                    className="after:inset-0 outline-none after:absolute after:content-[''] hover:underline hover:underline-offset-4"
                  >
                    {item.title}
                  </NavLink>
                ) : (
                  item.title
                )}
              </Heading>
              {item.description ? (
                <div
                  data-slot="feature-grid-description"
                  className={cn("text-sm text-muted-foreground", classNames?.description)}
                >
                  {item.description}
                </div>
              ) : null}
              {item.href && linkLabel !== false ? (
                <span
                  data-slot="feature-grid-link"
                  aria-hidden
                  className={cn("gap-1 text-sm font-medium mt-auto flex items-center text-primary", classNames?.link)}
                >
                  {linkLabel}
                  <Icon name={item.external ? "external-link" : "arrow-right"} size="sm" />
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
