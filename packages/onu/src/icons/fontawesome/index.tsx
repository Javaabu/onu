"use client"

import * as React from "react"
import {
  findIconDefinition,
  library,
  type IconDefinition,
  type IconName,
  type IconPrefix,
} from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import type { IconSource } from "../icon-context"
import type { IconComponentProps, IconMap, SemanticIconName } from "../types"
import { FONT_AWESOME_NAMES } from "./names"

/** FontAwesome style names and their prefixes. Any other prefix (e.g. a Kit's) can be passed directly. */
export const FONT_AWESOME_STYLES = {
  solid: "fas",
  regular: "far",
  light: "fal",
  thin: "fat",
  duotone: "fad",
  "sharp-solid": "fass",
  "sharp-regular": "fasr",
  "sharp-light": "fasl",
  "sharp-thin": "fast",
  "sharp-duotone-solid": "fasds",
  brands: "fab",
  kit: "fak",
} as const

export type FontAwesomeStyle = keyof typeof FONT_AWESOME_STYLES

export interface FontAwesomeIconMapOptions {
  /** Style for every icon. Default `"solid"` (included in FontAwesome Free). */
  style?: FontAwesomeStyle | (string & {})
  /**
   * Icon definitions to register, e.g. imported from `@fortawesome/pro-regular-svg-icons`.
   * Import only what you use to keep bundles small; `requiredFontAwesomeIcons()` lists the names.
   */
  icons?: (IconDefinition | Record<string, IconDefinition>)[]
  /** Override the FontAwesome name for individual semantic icons. */
  names?: Partial<Record<SemanticIconName | (string & {}), string>>
  /** Style used when an icon is missing in `style` (e.g. Pro → Free fallback). Default `"solid"`. */
  fallbackStyle?: FontAwesomeStyle | (string & {})
}

function prefixOf(style: string): IconPrefix {
  return ((FONT_AWESOME_STYLES as Record<string, string>)[style] ?? style) as IconPrefix
}

function register(icons: FontAwesomeIconMapOptions["icons"]) {
  for (const entry of icons ?? []) {
    if ("iconName" in entry && "prefix" in entry) library.add(entry as IconDefinition)
    else library.add(...Object.values(entry as Record<string, IconDefinition>).filter((d) => d && "iconName" in d))
  }
}

function FaIcon({
  prefix,
  fallback,
  iconName,
  ...props
}: IconComponentProps & { prefix: IconPrefix; fallback: IconPrefix; iconName: string }) {
  const definition =
    findIconDefinition({ prefix, iconName: iconName as IconName }) ??
    findIconDefinition({ prefix: fallback, iconName: iconName as IconName })
  if (!definition) return null
  return <FontAwesomeIcon icon={definition} fixedWidth={false} {...(props as object)} />
}

/**
 * Switches every built-in Onu icon to FontAwesome (R6.4, R6.5):
 *
 *   import { faXmark, faCheck } from "@fortawesome/pro-regular-svg-icons"
 *   <OnuProvider icons={fontAwesomeIconMap({ style: "regular", icons: [faXmark, faCheck] })}>
 *
 * Pro packages come from your project (they need a FontAwesome licence); Onu never bundles them.
 */
export function fontAwesomeIconMap({
  style = "solid",
  icons,
  names,
  fallbackStyle = "solid",
}: FontAwesomeIconMapOptions = {}): IconMap {
  register(icons)
  const prefix = prefixOf(style)
  const fallback = prefixOf(fallbackStyle)
  const all = { ...FONT_AWESOME_NAMES, ...names } as Record<string, string>
  const map: IconMap = {}
  for (const [semantic, iconName] of Object.entries(all)) {
    const Component = (props: IconComponentProps) => (
      <FaIcon prefix={prefix} fallback={fallback} iconName={iconName} {...props} />
    )
    Component.displayName = `FontAwesome(${iconName})`
    map[semantic] = Component
  }
  return map
}

/** FontAwesome icon names Onu's components use, to import exactly those definitions. */
export function requiredFontAwesomeIcons(): string[] {
  return [...new Set(Object.values(FONT_AWESOME_NAMES))].sort()
}

/**
 * Icon source for `DynamicIcon` and the icon picker: ids like `fa:regular:house`
 * or `fa:house` (default style). Icons must be registered (`icons` or `library.add`).
 */
export function fontAwesomeSource({
  icons,
  style = "solid",
  label = "FontAwesome",
  list,
}: {
  icons?: FontAwesomeIconMapOptions["icons"]
  style?: FontAwesomeStyle | (string & {})
  label?: string
  /** Icon ids offered in the picker. Defaults to the registered `icons`. */
  list?: string[]
} = {}): IconSource {
  register(icons)
  const defaults = (icons ?? []).flatMap((entry) =>
    "iconName" in entry ? [entry as IconDefinition] : Object.values(entry as Record<string, IconDefinition>),
  )
  return {
    prefixes: ["fa"],
    label,
    render: (rest, { className }) => {
      const parts = rest.split(":")
      const [styleName, iconName] = parts.length > 1 ? [parts[0]!, parts[1]!] : [style, parts[0]!]
      const prefix = prefixOf(styleName)
      return <FaIcon prefix={prefix} fallback={prefixOf(style)} iconName={iconName} className={className} />
    },
    list: () =>
      list ??
      defaults.map((d) => {
        const styleName = Object.entries(FONT_AWESOME_STYLES).find(([, p]) => p === d.prefix)?.[0] ?? d.prefix
        return `fa:${styleName}:${d.iconName}`
      }),
  }
}

export { FONT_AWESOME_NAMES } from "./names"
