import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

type Count = 1 | 2 | 3 | 4 | 5 | 6
type Breakpoint = "base" | "sm" | "md" | "lg" | "xl"

// Literal class names so Tailwind can see them. Breakpoints are container queries (R3.19):
// the grid adapts to the space it sits in, not only the viewport.
const COLUMN_CLASSES: Record<Breakpoint, Record<Count, string>> = {
  base: { 1: "columns-1", 2: "columns-2", 3: "columns-3", 4: "columns-4", 5: "columns-5", 6: "columns-6" },
  sm: {
    1: "@sm/masonry:columns-1",
    2: "@sm/masonry:columns-2",
    3: "@sm/masonry:columns-3",
    4: "@sm/masonry:columns-4",
    5: "@sm/masonry:columns-5",
    6: "@sm/masonry:columns-6",
  },
  md: {
    1: "@xl/masonry:columns-1",
    2: "@xl/masonry:columns-2",
    3: "@xl/masonry:columns-3",
    4: "@xl/masonry:columns-4",
    5: "@xl/masonry:columns-5",
    6: "@xl/masonry:columns-6",
  },
  lg: {
    1: "@4xl/masonry:columns-1",
    2: "@4xl/masonry:columns-2",
    3: "@4xl/masonry:columns-3",
    4: "@4xl/masonry:columns-4",
    5: "@4xl/masonry:columns-5",
    6: "@4xl/masonry:columns-6",
  },
  xl: {
    1: "@6xl/masonry:columns-1",
    2: "@6xl/masonry:columns-2",
    3: "@6xl/masonry:columns-3",
    4: "@6xl/masonry:columns-4",
    5: "@6xl/masonry:columns-5",
    6: "@6xl/masonry:columns-6",
  },
}

export type MasonryColumns = Count | Partial<Record<Breakpoint, Count>>

export const masonryGridVariants = cva("", {
  variants: {
    gap: {
      sm: "gap-2 *:mb-2",
      md: "gap-4 *:mb-4",
      lg: "gap-6 *:mb-6",
    },
  },
  defaultVariants: { gap: "md" },
})

export function masonryColumnClasses(columns: MasonryColumns) {
  const spec = typeof columns === "number" ? { base: columns } : columns
  return (Object.keys(spec) as Breakpoint[]).map((bp) => COLUMN_CLASSES[bp][spec[bp] as Count])
}

export interface MasonryGridProps extends React.ComponentProps<"div">, VariantProps<typeof masonryGridVariants> {
  /**
   * Column count, fixed or per container width: `base` (any), `sm` (≥ 24rem),
   * `md` (≥ 36rem), `lg` (≥ 56rem), `xl` (≥ 72rem). Defaults to 1 → 2 → 3.
   */
  columns?: MasonryColumns
  /** Class for the wrapper around each child. */
  itemClassName?: string
}

/**
 * A masonry layout with CSS columns: items of different heights pack into columns
 * without gaps. Items flow top to bottom, then to the next column, so keep the DOM
 * (and tab) order meaningful on its own.
 */
export function MasonryGrid({
  columns = { base: 1, sm: 2, lg: 3 },
  gap,
  className,
  itemClassName,
  children,
  ...props
}: MasonryGridProps) {
  return (
    <div data-slot="masonry-grid" className="@container/masonry w-full">
      <div className={cn(masonryColumnClasses(columns), masonryGridVariants({ gap }), className)} {...props}>
        {React.Children.map(children, (child) =>
          child === null || child === undefined || child === false ? null : (
            <div data-slot="masonry-item" className={cn("break-inside-avoid", itemClassName)}>
              {child}
            </div>
          ),
        )}
      </div>
    </div>
  )
}
