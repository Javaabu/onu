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
  bg: "bg-[color:var(--shell,#f5f4f2)] dark:bg-[color:var(--shell,#16141c)]",
  /** Text on the shell. */
  fg: "text-[color:var(--shell-foreground,var(--foreground))]",
  /** A 1px line in the shell's border colour (combine with `border-*` widths). */
  border: "border-[color:var(--shell-border,#e5e3e0)] dark:border-[color:var(--shell-border,#343140)]",
  /** A field on the shell (the header search). */
  field: "bg-[color:var(--shell-field,#ffffff)] dark:bg-[color:var(--shell-field,#292733)]",
  /** Hover and pressed greys for items on the shell. */
  hover:
    "hover:bg-[color:var(--shell-hover,rgb(194_193_192/0.2))] dark:hover:bg-[color:var(--shell-hover,rgb(91_87_107/0.2))]",
  active:
    "data-active:bg-[color:var(--shell-active,rgb(194_192_190/0.35))] dark:data-active:bg-[color:var(--shell-active,rgb(91_87_107/0.4))]",
  /** A weak tonal fill (progress tracks, avatar tiles). */
  weak: "bg-[color:var(--shell-weak,#eae7e4)] dark:bg-[color:var(--shell-weak,#3f3b4c)]",
} as const

/**
 * Ant's "layout" grey behind cards (`colorBgLayout`), for content panels that
 * hold cards rather than a table.
 */
export const layoutGreyClass = "bg-[color:var(--layout,#f5f5f5)] dark:bg-[color:var(--layout,#141414)]"
