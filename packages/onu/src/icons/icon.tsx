import * as React from "react"
import { CircleAlertIcon } from "lucide-react"

import { cn } from "../lib/utils"
import { useIconContext } from "./icon-context"
import { DIRECTIONAL_ICONS, type IconComponent, type SemanticIconName } from "./types"

/** Lucide icon used when a name is not in any map and no `fallback` is given. */
export const fallbackIcon: IconComponent = CircleAlertIcon

const SIZES = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
  xl: "size-6",
} as const

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, "name"> {
  /** Semantic name (e.g. `"close"`) resolved through the configured icon map. */
  name: SemanticIconName | (string & {})
  /** Accessible label. Without it the icon is decorative and hidden from screen readers. */
  label?: string
  /** Size token. Omit to size with `className` or inherit from the parent (`[&_svg]:size-*`). */
  size?: keyof typeof SIZES | number
  /** Force mirroring in RTL on or off. Defaults to on for directional icons. */
  flip?: boolean
  /**
   * Glyph used when neither `OnuProvider icons` nor the default icon set has `name`,
   * e.g. outside `OnuProvider`. Components that always show the same icon pass their
   * Lucide glyph here, so they work on their own without loading the whole default set.
   */
  fallback?: IconComponent | React.ReactElement
  className?: string
}

/**
 * Renders an icon by semantic name. Lucide by default; projects can switch every
 * built-in icon (e.g. to FontAwesome Pro) with `OnuProvider icons={…}` (R6.5).
 *
 * Lookup order: `OnuProvider icons` overrides, the default set (`lucideIconMap`, supplied
 * by `OnuProvider`), the `fallback` glyph, then a generic alert icon. This module does
 * not import the default set itself, so a component that only needs a few fixed glyphs
 * does not pull ~250 icons into the bundle. The `Icon` exported from the package root
 * adds the default set as `fallback`, so it also works outside `OnuProvider`.
 */
export function Icon({ name, label, size, flip, fallback, className, ...rest }: IconProps) {
  const { icons, defaults } = useIconContext()
  const entry = icons?.[name] ?? defaults?.[name] ?? fallback ?? fallbackIcon
  const mirror = flip ?? DIRECTIONAL_ICONS.has(name)

  const classes = cn(typeof size === "string" && SIZES[size], mirror && "rtl:-scale-x-100", className)
  if (typeof size === "number") Object.assign(rest, { width: size, height: size })
  const a11y = label ? ({ role: "img", "aria-label": label } as const) : ({ "aria-hidden": true } as const)

  if (React.isValidElement<{ className?: string }>(entry)) {
    return React.cloneElement(entry, {
      ...rest,
      ...a11y,
      "data-icon-name": name,
      className: cn(entry.props.className, classes),
    } as unknown as React.Attributes & { className?: string })
  }

  const Component = entry as IconComponent
  // Rendered without a wrapper so parent selectors like `[&_svg]` and `*:[svg]` keep working.
  return <Component {...(rest as object)} {...a11y} data-icon-name={name} className={classes} />
}
