import * as React from "react"

import type { IconMap } from "./types"

/** Renders a stored icon id (`prefix:name`) for one icon source, e.g. Iconify or FontAwesome. */
export interface IconSource {
  /** Id prefixes handled by this source, e.g. `["fa"]` or `["tabler", "mdi"]`. `"*"` matches any prefix. */
  prefixes: string[]
  /** Display name, used by the icon picker. */
  label: string
  render: (name: string, props: { className?: string; prefix: string }) => React.ReactNode
  /** Lists icon ids for the icon picker. Optional for sources that cannot enumerate. */
  list?: () => Promise<string[]> | string[]
}

export interface IconContextValue {
  /** Project overrides (`OnuProvider icons`). */
  icons?: IconMap
  /**
   * Default icon set used for names without an override. `OnuProvider` loads
   * `lucideIconMap` on demand (see `loadDefaults`) and supplies it here once loaded.
   */
  defaults?: IconMap
  /**
   * Asks for the default icon set. `<Icon>` calls it when a name has no override,
   * no `fallback` and the default set is not loaded yet; the set then loads in a
   * separate chunk, so apps whose icons are all fixed glyphs never download it.
   */
  loadDefaults?: () => void
  sources?: IconSource[]
}

export const IconContext = React.createContext<IconContextValue>({})

export function useIconContext() {
  return React.useContext(IconContext)
}
