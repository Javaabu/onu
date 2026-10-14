"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { NavIcon, NavLink, formatCount } from "./_nav"
import { useAppLayout } from "./app-layout"
import { Breadcrumbs, type BreadcrumbsItem } from "./breadcrumbs"
import { registerEnglish } from "../../i18n/english"
import { layout as en_layout } from "../../locales/en/layout"

registerEnglish({ layout: en_layout })

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

/** A key figure in the page header, e.g. "In review: 12". */
export interface PageTitleFigure {
  label: React.ReactNode
  value: React.ReactNode
}

type HeadingLevel = 1 | 2 | 3

export interface PageTitleProps extends Omit<React.ComponentProps<"header">, "title" | "content"> {
  title: React.ReactNode
  description?: React.ReactNode
  /** Grey text next to the title (Ant's sub-title). */
  subtitle?: React.ReactNode
  /** Tags after the title, e.g. `<Tag>12 open</Tag>`. */
  tags?: React.ReactNode
  /** Main action, e.g. `<Button>New user</Button>`. Sits at the inline end. */
  action?: React.ReactNode
  /** More actions before the main one (e.g. Logs, Delete on a record page, §25.8). */
  actions?: React.ReactNode
  /** Secondary links under the title (e.g. All users, Trash). */
  links?: PageTitleLink[]
  /**
   * Breadcrumbs above the title: a trail (`BreadcrumbsItem[]`) or any node.
   * In a band, defaults to the surrounding `AppLayout`'s `breadcrumbs`.
   */
  breadcrumbs?: React.ReactNode | BreadcrumbsItem[]
  /** Content before the title, e.g. an avatar or icon. */
  media?: React.ReactNode
  /** Key figures at the end of the description row (Ant PageHeader's statistics). */
  figures?: PageTitleFigure[]
  /** More content under the heading. */
  content?: React.ReactNode
  /**
   * A tab row at the bottom of the header (`FilterTabs`, `Tabs`, `NavTabs`),
   * styled as Ant's line tabs with an ink bar.
   */
  tabs?: React.ReactNode
  /**
   * `band`: Ant's PageHeader, a white band across the top of the content
   * panel with a bottom line (the default for an `h1` inside a panel
   * `AppLayout`). `plain`: just the heading block (the default elsewhere).
   */
  variant?: "plain" | "band"
  headingLevel?: HeadingLevel
  classNames?: {
    breadcrumbs?: string
    title?: string
    subtitle?: string
    description?: string
    links?: string
    link?: string
    actions?: string
    figures?: string
    content?: string
    tabs?: string
  }
}

/** Ant's line tabs in the header: 32px apart, 12px tall padding, the brand ink bar on the bottom edge. */
const BAND_TABS = [
  "[&_[data-slot=tabs-list]]:h-auto [&_[data-slot=tabs-list]]:gap-8 [&_[data-slot=tabs-list]]:rounded-none [&_[data-slot=tabs-list]]:p-0",
  "[&_[data-slot=tabs-trigger]]:h-auto [&_[data-slot=tabs-trigger]]:flex-none [&_[data-slot=tabs-trigger]]:rounded-none [&_[data-slot=tabs-trigger]]:border-0 [&_[data-slot=tabs-trigger]]:px-0 [&_[data-slot=tabs-trigger]]:py-3 [&_[data-slot=tabs-trigger]]:font-normal [&_[data-slot=tabs-trigger]]:text-foreground",
  "[&_[data-slot=tabs-trigger]:hover]:text-primary [&_[data-slot=tabs-trigger][data-state=active]]:text-primary [&_[data-slot=tabs-trigger][data-state=active]]:[text-shadow:0_0_0.25px_currentColor]",
  "[&_[data-slot=tabs-trigger]]:after:bottom-0! [&_[data-slot=tabs-trigger]]:after:h-0.5 [&_[data-slot=tabs-trigger]]:after:bg-primary",
  // Counts: a small grey pill, the brand colour on the current tab.
  "[&_[data-slot=tabs-trigger]_[data-slot=badge]]:h-5 [&_[data-slot=tabs-trigger]_[data-slot=badge]]:min-w-5 [&_[data-slot=tabs-trigger]_[data-slot=badge]]:rounded-full [&_[data-slot=tabs-trigger]_[data-slot=badge]]:px-1.5 [&_[data-slot=tabs-trigger]_[data-slot=badge]]:font-normal",
  "[&_[data-slot=tabs-trigger][data-state=active]_[data-slot=badge]]:bg-primary [&_[data-slot=tabs-trigger][data-state=active]_[data-slot=badge]]:font-semibold [&_[data-slot=tabs-trigger][data-state=active]_[data-slot=badge]]:text-primary-foreground",
  // NavTabs: no own line (the band has one) and items flush to the bottom edge.
  "[&_[data-slot=nav-tabs]]:border-0",
].join(" ")

/**
 * The page header of index, view and edit pages (§25.6, §25.8): title, a main
 * action button and secondary links where a small dot marks e.g. a non-empty
 * Trash. Actions move under the title in narrow containers.
 *
 * Inside a panel `AppLayout`, a page's `h1` header is Ant's PageHeader band:
 * breadcrumbs, the title with sub-title and tags, actions at the end, the
 * description with key figures, and a tab row with an ink bar, on a white
 * band across the panel with a bottom line.
 */
export function PageTitle({
  title,
  description,
  subtitle,
  tags,
  action,
  actions,
  links,
  breadcrumbs,
  media,
  figures,
  content,
  tabs,
  variant: variantProp,
  headingLevel = 1,
  className,
  classNames,
  ...props
}: PageTitleProps) {
  const { t, locale } = useTranslation()
  const layout = useAppLayout()
  const Heading = `h${headingLevel}` as const
  const variant = variantProp ?? (layout?.variant === "panel" && headingLevel === 1 ? "band" : "plain")
  const band = variant === "band"
  // Bleed the band's background and bottom line to the panel edges (the panel clips them).
  const bleed = band && layout?.variant === "panel"

  const trail = Array.isArray(breadcrumbs)
    ? breadcrumbs
    : breadcrumbs === undefined && band && layout?.breadcrumbs?.length
      ? layout.breadcrumbs
      : undefined
  const crumbs = trail ? <Breadcrumbs items={trail} /> : (breadcrumbs as React.ReactNode)

  // The band shows the trail, so the layout drops its copy above the content (CSS hides it until then).
  const registerBand = band ? layout?.registerBand : undefined
  React.useLayoutEffect(() => registerBand?.(), [registerBand])

  const linkList = links?.length ? (
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
                <span data-slot="page-title-dot" aria-hidden="true" className="size-1.5 rounded-full bg-primary" />{" "}
                <span className="sr-only">{t("layout.notEmpty")}</span>
              </>
            ) : null}
          </NavLink>
        </li>
      ))}
    </ul>
  ) : null

  const actionNode =
    action || actions ? (
      <div
        data-slot="page-title-actions"
        className={cn("gap-2 flex shrink-0 flex-wrap items-center", classNames?.actions)}
      >
        {actions}
        {action}
      </div>
    ) : null

  const figureList = figures?.length ? (
    <dl data-slot="page-title-figures" className={cn("flex flex-wrap", classNames?.figures)}>
      {figures.map((figure, i) => (
        <div
          key={i}
          className="px-4 sm:px-6 sm:text-end first:ps-0 last:pe-0 sm:last:pe-0 grid border-border not-first:border-s"
        >
          <dt className="text-sm text-muted-foreground">{figure.label}</dt>
          <dd className="text-xl leading-8 m-0 text-foreground tabular-nums">{figure.value}</dd>
        </div>
      ))}
    </dl>
  ) : null

  const titleRow = (
    <div className="gap-x-3 gap-y-1 min-w-0 flex flex-wrap items-center">
      <Heading
        data-slot="page-title-heading"
        className={cn(
          band
            ? "text-xl leading-8 font-semibold tracking-tight [&:lang(dv)]:leading-10 [&:lang(dv)]:tracking-normal m-0 wrap-break-word"
            : "text-2xl font-semibold leading-tight tracking-tight wrap-break-word",
          !band && headingLevel > 1 && "text-xl",
          classNames?.title,
        )}
      >
        {title}
      </Heading>
      {subtitle ? (
        <span data-slot="page-title-subtitle" className={cn("text-sm text-muted-foreground", classNames?.subtitle)}>
          {subtitle}
        </span>
      ) : null}
      {tags ? (
        <span data-slot="page-title-tags" className="gap-2 inline-flex flex-wrap items-center">
          {tags}
        </span>
      ) : null}
    </div>
  )

  const descriptionNode = description ? (
    <p
      data-slot="page-title-description"
      className={cn("text-sm text-muted-foreground", band && "max-w-2xl m-0", classNames?.description)}
    >
      {description}
    </p>
  ) : null

  const tabsNode = tabs ? (
    <div data-slot="page-title-tabs" className={cn(band ? cn("mt-2", BAND_TABS) : "mt-1", classNames?.tabs)}>
      {tabs}
    </div>
  ) : null

  const contentNode = content ? (
    <div data-slot="page-title-content" className={cn(band && "mt-3", classNames?.content)}>
      {content}
    </div>
  ) : null

  if (band) {
    return (
      <header
        data-slot="page-title"
        data-variant="band"
        className={cn(
          "py-4 @container/page-title relative flex flex-col bg-card text-card-foreground",
          bleed
            ? "before:bottom-0 shadow-[0_0_0_100vmax_var(--card)] [clip-path:inset(0_-100vmax)] before:pointer-events-none before:absolute before:-inset-x-[100vmax] before:h-px before:bg-border"
            : "px-4 sm:px-6 border-b",
          tabs && "pb-0",
          className,
        )}
        {...props}
      >
        {crumbs ? (
          <div data-slot="page-title-breadcrumbs" className={cn("mb-2", classNames?.breadcrumbs)}>
            {crumbs}
          </div>
        ) : null}
        <div className="gap-x-4 gap-y-2 flex flex-wrap items-center justify-between">
          <div className="gap-3 min-w-0 flex items-center">
            {media ? <div className="shrink-0">{media}</div> : null}
            {titleRow}
          </div>
          {actionNode}
        </div>
        {descriptionNode || figureList ? (
          <div className="mt-3 gap-x-8 gap-y-3 flex flex-wrap items-end justify-between">
            {descriptionNode}
            {figureList}
          </div>
        ) : null}
        {linkList}
        {contentNode}
        {tabsNode}
      </header>
    )
  }

  return (
    <header
      data-slot="page-title"
      data-variant="plain"
      className={cn("gap-3 @container/page-title flex flex-col", className)}
      {...props}
    >
      {crumbs ? (
        <div data-slot="page-title-breadcrumbs" className={classNames?.breadcrumbs}>
          {crumbs}
        </div>
      ) : null}
      <div className="gap-3 @xl/page-title:flex-row @xl/page-title:items-start flex flex-col">
        <div className="gap-3 min-w-0 flex flex-1 items-start">
          {media ? <div className="shrink-0">{media}</div> : null}
          <div className="gap-1 min-w-0 flex flex-col">
            {titleRow}
            {descriptionNode}
            {linkList}
          </div>
        </div>
        {actionNode}
      </div>
      {figureList}
      {contentNode}
      {tabsNode}
    </header>
  )
}
