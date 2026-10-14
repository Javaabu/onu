import { cn } from "../lib/utils"

export type Politeness = "polite" | "assertive"

export interface LiveRegionProps extends Omit<React.ComponentProps<"div">, "role"> {
  /**
   * `polite` waits for the screen reader to finish; `assertive` interrupts it.
   * Default `polite` (`assertive` with `role="alert"`).
   */
  politeness?: Politeness
  /** Read the whole region on every change, not just the changed part. Default `true`. */
  atomic?: boolean
  /**
   * ARIA role. `status` and `alert` are live regions themselves; leave it unset
   * when the page has other `status` regions that tests or tools look up by role.
   */
  role?: "status" | "alert" | "log" | "timer" | "marquee"
  /** Element to render. Default `span`, so the region can sit inside phrasing content. */
  as?: "span" | "div" | "p"
  /** Show the text on screen too (the region is visually hidden by default). */
  visible?: boolean
}

/**
 * An `aria-live` region: screen readers read its text whenever it changes.
 * Keep it mounted and change its children; a region that mounts together
 * with its text is often not announced.
 */
export function LiveRegion({
  role,
  politeness = role === "alert" ? "assertive" : "polite",
  atomic = true,
  as: Comp = "span",
  visible = false,
  className,
  ...props
}: LiveRegionProps) {
  return (
    <Comp
      data-slot="live-region"
      role={role}
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn(!visible && "sr-only", className)}
      {...props}
    />
  )
}
