"use client"

import * as React from "react"
import { Accessibility, type DragEndEvent, type DragOverEvent, type DragStartEvent } from "@dnd-kit/dom"
import type { DragDropProvider } from "@dnd-kit/react"

import { useTranslation } from "../../providers/onu-provider"

type ProviderProps = React.ComponentProps<typeof DragDropProvider>
type PluginsInput = NonNullable<ProviderProps["plugins"]>
type Plugins = Exclude<PluginsInput, (...args: never[]) => unknown>

type Id = string | number

/**
 * dnd-kit's screen reader instructions and announcements in the active locale
 * (R12.1), with item names instead of ids. Returns the `plugins` prop for
 * `DragDropProvider`; the default pointer (with a touch press delay) and
 * keyboard sensors are kept.
 */
export function useDndPlugins(nameOf: (id: Id) => string, targetName: (id: Id) => string = nameOf): PluginsInput {
  const { t } = useTranslation()
  const names = React.useRef({ nameOf, targetName })
  React.useEffect(() => {
    names.current = { nameOf, targetName }
  })

  return React.useMemo(() => {
    // The ref is only read inside the announcement callbacks, which run during drags, never during render.
    // eslint-disable-next-line react-hooks/refs
    const accessibility = Accessibility.configure({
      screenReaderInstructions: { draggable: t("listing.dragInstructions") },
      announcements: {
        dragstart: ({ operation: { source } }: DragStartEvent) =>
          source ? t("listing.dragStart", { name: names.current.nameOf(source.id) }) : undefined,
        dragover: ({ operation: { source, target } }: DragOverEvent) =>
          source && target && source.id !== target.id
            ? t("listing.dragOver", {
                name: names.current.nameOf(source.id),
                target: names.current.targetName(target.id),
              })
            : undefined,
        dragend: ({ operation: { source }, canceled }: DragEndEvent) => {
          if (!source) return undefined
          const name = names.current.nameOf(source.id)
          return canceled ? t("listing.dragCancel", { name }) : t("listing.dragEnd", { name })
        },
      },
    })
    return (defaults: Plugins) => defaults.map((plugin) => (plugin === Accessibility ? accessibility : plugin))
  }, [t])
}
