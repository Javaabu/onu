"use client"

import * as React from "react"
import { addCollection, Icon as IconifyIcon, type IconifyJSON } from "@iconify/react/offline"

import type { IconSource } from "../icon-context"
import type { IconComponentProps, IconMap, SemanticIconName } from "../types"

/**
 * Iconify adapter (R6.3). Uses the offline build: icons come only from the
 * collections you register (`@iconify-json/*` packages), never from the Iconify
 * API, so it works on kiosks, intranets and under strict CSP.
 *
 *   import tabler from "@iconify-json/tabler/icons.json"
 *   const iconify = iconifySource({ collections: [tabler] })
 *   <OnuProvider iconSources={[iconify]}>
 */
export function iconifySource({
  collections = [],
  label = "Iconify",
}: {
  collections?: IconifyJSON[]
  label?: string
} = {}): IconSource {
  for (const collection of collections) addCollection(collection)
  const prefixes = collections.map((c) => c.prefix)
  return {
    prefixes: prefixes.length ? prefixes : ["*"],
    label,
    render: (name, { className, prefix }) => <IconifyIcon icon={`${prefix}:${name}`} className={className} />,
    list: () => collections.flatMap((c) => Object.keys(c.icons).map((name) => `${c.prefix}:${name}`)),
  }
}

/** Registers collections without creating a source (e.g. for `iconifyIconMap`). */
export function registerIconifyCollections(...collections: IconifyJSON[]) {
  for (const collection of collections) addCollection(collection)
}

/**
 * Builds an icon map from Iconify ids, to switch Onu's built-in icons to an
 * Iconify set: `iconifyIconMap({ close: "tabler:x", check: "tabler:check" })`.
 * Register the collections first.
 */
export function iconifyIconMap(ids: Partial<Record<SemanticIconName | (string & {}), string>>): IconMap {
  const map: IconMap = {}
  for (const [name, id] of Object.entries(ids)) {
    if (!id) continue
    const Component = (props: IconComponentProps) => <IconifyIcon icon={id} {...(props as object)} />
    Component.displayName = `Iconify(${id})`
    map[name] = Component
  }
  return map
}

export type { IconifyJSON }
