import { Icon as BaseIcon, type IconProps } from "./icon"
import { lucideIconMap } from "./lucide-map"
import type { IconComponent } from "./types"

/**
 * Renders an icon by semantic name (R6.1, R6.5). This is the `Icon` exported from
 * `@javaabu/onu`: it resolves any name, also outside `OnuProvider`, because it falls
 * back to the default Lucide set. Onu's own components use the lighter `./icon` and
 * get the default set from `OnuProvider`.
 */
export function Icon({ fallback, ...props }: IconProps) {
  return <BaseIcon {...props} fallback={fallback ?? (lucideIconMap as Record<string, IconComponent>)[props.name]} />
}

export type { IconProps }
