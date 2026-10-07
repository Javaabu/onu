"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { NavIcon, NavLink } from "./_nav"

export interface FooterLink {
  label: React.ReactNode
  href: string
  external?: boolean
}

export interface FooterColumn {
  title: React.ReactNode
  links: FooterLink[]
}

export interface SocialLink {
  /** Accessible name, e.g. "Facebook". */
  label: string
  href: string
  /** Semantic icon name or node (brand icons via Iconify / FontAwesome brands). */
  icon: string | React.ReactNode
}

export interface SiteFooterProps extends React.ComponentProps<"footer"> {
  /** Logo and short description at the start. */
  logo?: React.ReactNode
  description?: React.ReactNode
  /** Link columns. */
  columns?: FooterColumn[]
  social?: SocialLink[]
  /** Organisation name for the default copyright line. */
  name?: string
  /** Replace the copyright line. */
  copyright?: React.ReactNode
  /** Year in the copyright line. Defaults to the current year. */
  year?: number
  /** Links in the bottom bar (Privacy, Terms). */
  legalLinks?: FooterLink[]
  /** Slot for a `LanguageSwitcher` (or anything else) in the bottom bar. */
  languageSwitcher?: React.ReactNode
  classNames?: {
    brand?: string
    columns?: string
    column?: string
    columnTitle?: string
    link?: string
    social?: string
    bottom?: string
  }
}

const linkClass =
  "rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 touch:inline-flex touch:min-h-11 touch:items-center"

/**
 * Site footer for portals and public pages: brand, link columns, social links,
 * copyright, legal links and a language switcher slot. Columns reflow by the
 * footer's own width (container queries).
 */
export function SiteFooter({
  logo,
  description,
  columns,
  social,
  name,
  copyright,
  year,
  legalLinks,
  languageSwitcher,
  className,
  classNames,
  children,
  ...props
}: SiteFooterProps) {
  const { t } = useTranslation()
  const uid = React.useId()
  const copyrightLine =
    copyright ?? (name ? t("layout.copyright", { year: String(year ?? new Date().getFullYear()), name }) : null)

  return (
    <footer
      data-slot="site-footer"
      className={cn("text-sm @container/footer border-t bg-muted/30 pb-[env(safe-area-inset-bottom)]", className)}
      {...props}
    >
      <div className="gap-10 px-4 py-10 max-w-7xl sm:px-6 mx-auto flex w-full flex-col">
        {logo || description || columns?.length || social?.length ? (
          <div className="gap-10 @3xl/footer:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] grid">
            {logo || description || social?.length ? (
              <div data-slot="site-footer-brand" className={cn("gap-4 flex flex-col", classNames?.brand)}>
                {logo}
                {description ? <p className="max-w-xs text-muted-foreground">{description}</p> : null}
                {social?.length ? (
                  <ul
                    aria-label={t("layout.socialLinks")}
                    className={cn("gap-1 -ms-2 flex flex-wrap", classNames?.social)}
                  >
                    {social.map((s) => (
                      <li key={s.href}>
                        <Button asChild variant="ghost" size="icon" className="touch:size-11">
                          <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                            <NavIcon icon={s.icon} />
                          </a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
            {columns?.length ? (
              <div
                data-slot="site-footer-columns"
                className={cn("gap-8 @2xl/footer:grid-cols-4 grid grid-cols-2", classNames?.columns)}
              >
                {columns.map((column, ci) => {
                  const titleId = `${uid}-col-${ci}`
                  return (
                    <nav key={ci} aria-labelledby={titleId} className={cn("gap-3 flex flex-col", classNames?.column)}>
                      <h2 id={titleId} className={cn("text-sm font-semibold text-foreground", classNames?.columnTitle)}>
                        {column.title}
                      </h2>
                      <ul className="gap-2 flex flex-col">
                        {column.links.map((link, li) => (
                          <li key={link.href ?? li}>
                            <NavLink
                              href={link.href}
                              external={link.external}
                              className={cn(linkClass, classNames?.link)}
                            >
                              {link.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  )
                })}
              </div>
            ) : null}
          </div>
        ) : null}
        {children}
        {copyrightLine || legalLinks?.length || languageSwitcher ? (
          <div
            data-slot="site-footer-bottom"
            className={cn(
              "gap-4 pt-6 @2xl/footer:flex-row @2xl/footer:items-center flex flex-col border-t text-muted-foreground",
              classNames?.bottom,
            )}
          >
            {copyrightLine ? <p className="flex-1">{copyrightLine}</p> : <div className="flex-1" />}
            {legalLinks?.length ? (
              <ul className="gap-x-4 gap-y-2 flex flex-wrap">
                {legalLinks.map((link, li) => (
                  <li key={link.href ?? li}>
                    <NavLink href={link.href} external={link.external} className={cn(linkClass, classNames?.link)}>
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : null}
            {languageSwitcher ? <div className="shrink-0">{languageSwitcher}</div> : null}
          </div>
        ) : null}
      </div>
    </footer>
  )
}
