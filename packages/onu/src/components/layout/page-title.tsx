"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { NavIcon, NavLink, formatCount } from "./_nav"

export interface PageTitleLink {
  label: React.ReactNode
  href: string
  /** Semantic icon name or node. */
  icon?: string | React.ReactNode
  /** Small dot, e.g. Trash isn't empty (§25.6). Announced as "(not empty)". */
  dot?: boolean
  /** Count after the label. */
  count?: number
  external?: boolean
}

type HeadingLevel = 1 | 2 | 3

export interface PageTitleProps extends Omit<React.ComponentProps<"header">, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  /** Main action, e.g. `<Button>New user</Button>`. Sits at the inline end. */
  action?: React.ReactNode
  /** More actions before the main one (e.g. Logs, Delete on a record page, §25.8). */
  actions?: React.ReactNode
  /** Secondary links under the title (e.g. All users, Trash). */
  links?: PageTitleLink[]
  /** Breadcrumbs above the title. */
  breadcrumbs?: React.ReactNode
  /** Content before the title, e.g. an avatar or icon. */
  media?: React.ReactNode
  headingLevel?: HeadingLevel
  classNames?: {
    breadcrumbs?: string
    title?: string
    description?: string
    links?: string
    link?: string
    actions?: string
  }
}

/**
 * The page header of index, view and edit pages (§25.6, §25.8): title, a main
 * action button and secondary links where a small dot marks e.g. a non-empty
 * Trash. Actions move under the title in narrow containers.
 */
export function PageTitle({
  title,
  description,
  action,
  actions,
  links,
  breadcrumbs,
  media,
  headingLevel = 1,
  className,
  classNames,
  ...props
}: PageTitleProps) {
  const { t, locale } = useTranslation()
  const Heading = `h${headingLevel}` as const

  return (
    <header data-slot="page-title" className={cn("gap-3 @container/page-title flex flex-col", className)} {...props}>
      {breadcrumbs ? (
        <div data-slot="page-title-breadcrumbs" className={classNames?.breadcrumbs}>
          {breadcrumbs}
        </div>
      ) : null}
      <div className="gap-3 @xl/page-title:flex-row @xl/page-title:items-start flex flex-col">
        <div className="gap-3 min-w-0 flex flex-1 items-start">
          {media ? <div className="shrink-0">{media}</div> : null}
          <div className="gap-1 min-w-0 flex flex-col">
            <Heading
              data-slot="page-title-heading"
              className={cn(
                "text-2xl font-semibold leading-tight tracking-tight wrap-break-word",
                headingLevel > 1 && "text-xl",
                classNames?.title,
              )}
            >
              {title}
            </Heading>
            {description ? (
              <p
                data-slot="page-title-description"
                className={cn("text-sm text-muted-foreground", classNames?.description)}
              >
                {description}
              </p>
            ) : null}
            {links?.length ? (
              <ul
                data-slot="page-title-links"
                className={cn("gap-x-4 gap-y-1 mt-1 text-sm flex flex-wrap items-center", classNames?.links)}
              >
                {links.map((link, i) => (
                  <li key={link.href ?? i}>
                    <NavLink
                      href={link.href}
                      external={link.external}
                      data-slot="page-title-link"
                      className={cn(
                        "gap-1.5 touch:min-h-11 [&_svg]:size-4 inline-flex items-center rounded-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
                        classNames?.link,
                      )}
                    >
                      <NavIcon icon={link.icon} />
                      <span>{link.label}</span>
                      {link.count !== undefined ? (
                        <span className="tabular-nums">({formatCount(link.count, locale.numberLocale, 9999)})</span>
                      ) : null}
                      {link.dot ? (
                        <>
                          <span
                            data-slot="page-title-dot"
                            aria-hidden="true"
                            className="size-1.5 rounded-full bg-primary"
                          />{" "}
                          <span className="sr-only">{t("layout.notEmpty")}</span>
                        </>
                      ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        {action || actions ? (
          <div
            data-slot="page-title-actions"
            className={cn("gap-2 flex shrink-0 flex-wrap items-center", classNames?.actions)}
          >
            {actions}
            {action}
          </div>
        ) : null}
      </div>
    </header>
  )
}
