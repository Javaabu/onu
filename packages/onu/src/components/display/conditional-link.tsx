"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { AppLink } from "./_link"

export interface ConditionalLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Link target. When empty, plain text is rendered. */
  href?: string | null
  /**
   * Extra condition, e.g. a permission check (`can("view", user)`). When `false`,
   * plain text is rendered even if `href` is set. Default `true`.
   */
  when?: boolean
  /** Element used for the plain-text version. Default `span`. */
  fallbackAs?: React.ElementType
  /** Classes applied only to the link version. */
  linkClassName?: string
  ref?: React.Ref<HTMLAnchorElement>
}

/**
 * Renders a link only when there is somewhere to go and the user may go there;
 * otherwise renders the same content as plain text. Handy in tables and detail
 * views where some rows link to a record and others don't. Uses the
 * `linkComponent` from `OnuProvider` (Inertia, Next.js, …).
 */
export function ConditionalLink({
  href,
  when = true,
  fallbackAs: Fallback = "span",
  className,
  linkClassName,
  children,
  ref,
  ...props
}: ConditionalLinkProps) {
  if (!href || !when) {
    return (
      <Fallback data-slot="conditional-link" data-linked="false" className={className}>
        {children}
      </Fallback>
    )
  }
  return (
    <AppLink
      ref={ref}
      href={href}
      data-slot="conditional-link"
      data-linked="true"
      className={cn(
        "font-medium rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
        linkClassName,
      )}
      {...props}
    >
      {children}
    </AppLink>
  )
}
