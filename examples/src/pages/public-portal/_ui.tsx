import * as React from "react"
import { Breadcrumbs, cn } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"

/** Centred page container with the portal's side gutters. */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("max-w-6xl px-4 sm:px-6 mx-auto w-full", className)} {...props} />
}

/**
 * Header band for inner portal pages: breadcrumbs, the page's h1 and a lead
 * paragraph, with an optional slot (search box, actions) underneath.
 */
export function PortalPageHeader({
  title,
  description,
  crumbs = [],
  eyebrow,
  children,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  crumbs?: { label: string; href?: string }[]
  eyebrow?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  const tr = useTr()
  return (
    <div className={cn("border-b bg-muted/40", className)}>
      <Container className="py-8 sm:py-12">
        <Breadcrumbs
          items={[{ label: tr("Home", "މައި ސަފްހާ"), href: routes.public.home, icon: "home" }, ...crumbs]}
        />
        {eyebrow ? <div className="mt-6 text-sm font-medium text-primary">{eyebrow}</div> : null}
        <h1
          className={cn(
            "max-w-3xl font-semibold tracking-tight leading-tight text-[clamp(1.75rem,1.2rem+2.2vw,2.75rem)] text-balance",
            eyebrow ? "mt-2" : "mt-6",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-[clamp(1rem,0.95rem+0.3vw,1.125rem)] text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </Container>
    </div>
  )
}
