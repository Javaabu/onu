"use client"

import * as React from "react"

import { useLinkComponent } from "../../providers/onu-provider"

export type AppLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  ref?: React.Ref<HTMLAnchorElement>
}

/**
 * Renders the `linkComponent` configured on `OnuProvider` (Inertia, Next.js, …),
 * or a plain `<a>` (R16.2). The component comes from context, so it is stable
 * across renders.
 */
export function AppLink(props: AppLinkProps) {
  const Link = useLinkComponent()
  return React.createElement(Link, props)
}
