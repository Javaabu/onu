/**
 * The app shell's surface (Proton's warm grey "Snow" in light, "Carbon" in
 * dark): the sidebar, the header and the frame around the content panel.
 *
 * The classes read the semantic shell tokens (`--shell`, `--shell-foreground`,
 * `--shell-border`, `--shell-field`, `--shell-hover`, `--shell-active`,
 * `--shell-weak`) and fall back to Proton's values, so the shell looks right
 * whether or not the theme defines them. Arbitrary values (not theme colours)
 * keep the fallbacks in the class names.
 */
export const shellClasses = {
  /** The shell background. */
  bg: "bg-shell",
  /** Text on the shell. */
  fg: "text-shell-foreground",
  /** A 1px line in the shell's border colour (combine with `border-*` widths). */
  border: "border-shell-border",
  /** A field on the shell (the header search). */
  field: "bg-shell-field",
  /** Hover and pressed greys for items on the shell. */
  hover: "hover:bg-shell-hover",
  active: "data-active:bg-shell-active",
  /** A weak tonal fill (progress tracks, avatar tiles). */
  weak: "bg-shell-weak",
} as const

/**
 * Ant's "layout" grey behind cards (`colorBgLayout`), for content panels that
 * hold cards rather than a table.
 */
export const layoutGreyClass = "bg-layout"
