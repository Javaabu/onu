import * as React from "react"
import { Link, Navigate, useLocation, useParams } from "react-router"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Icon,
} from "@javaabu/onu"

import { locate, navSections, neighbours, type Entry, type NavSection } from "../registry"
import { CodeFallback, DemoSourceContext, LazyCodeBlock } from "./demo"
import { BareChrome, SiteLayout } from "./layout"

function PageHeader({
  crumbs,
  title,
  description,
}: {
  crumbs: { label: string; href?: string }[]
  title: string
  description?: string
}) {
  return (
    <div className="mb-10 space-y-3">
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((c, i) => (
            <React.Fragment key={c.label}>
              {i > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {c.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={c.href}>{c.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl scroll-m-20">{title}</h1>
      {description ? (
        <p className="text-base sm:text-lg text-pretty text-muted-foreground">
          <span dir="auto">{description}</span>
        </p>
      ) : null}
    </div>
  )
}

function PrevNext({ pathname }: { pathname: string }) {
  const { prev, next } = neighbours(pathname)
  if (!prev && !next) return null
  return (
    <nav aria-label="Previous and next" className="mt-16 gap-4 pt-6 flex items-center justify-between border-t">
      {prev ? (
        <Button asChild variant="secondary" size="sm">
          <Link to={prev.href}>
            <Icon name="arrow-left" />
            <span className="sr-only">Previous: </span>
            {prev.title}
          </Link>
        </Button>
      ) : (
        <span />
      )}
      {next ? (
        <Button asChild variant="secondary" size="sm">
          <Link to={next.href}>
            <span className="sr-only">Next: </span>
            {next.title}
            <Icon name="arrow-right" />
          </Link>
        </Button>
      ) : null}
    </nav>
  )
}

function FullSource({ source }: { source: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <section className="mt-12 space-y-3" aria-labelledby="full-source">
      <div className="gap-3 flex flex-wrap items-center justify-between">
        <h2 id="full-source" className="text-xl font-semibold tracking-tight">
          Source
        </h2>
        <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <Icon name="code" />
          {open ? "Hide full source" : "View full source"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">The whole demo file, ready to copy.</p>
      {open ? (
        <div data-axe-skip>
          <React.Suspense fallback={<CodeFallback />}>
            <LazyCodeBlock
              code={source}
              language="tsx"
              lineNumbers
              className="my-0 rounded-xl"
              classNames={{ pre: "max-h-[70vh]" }}
            />
          </React.Suspense>
        </div>
      ) : null}
    </section>
  )
}

/** Scrolls to `#/route#section` on load and when the route changes. */
function useScrollToHash() {
  const { pathname, hash } = useLocation()
  React.useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView())
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on route change, not on every section click
  }, [pathname])
}

/** A component demo or sample page. Bare sample pages render full screen without the docs chrome. */
export function EntryView({ entries }: { entries: Entry[] }) {
  const { "*": slug } = useParams()
  const { pathname } = useLocation()
  useScrollToHash()
  const entry = entries.find((e) => e.slug === slug)
  if (!entry) return <Navigate to="/" replace />
  const { Component, meta, source } = entry

  if (meta.layout === "bare") {
    return (
      <>
        <BareChrome />
        <Component />
      </>
    )
  }

  const here = locate(pathname)
  const crumbs = here
    ? [
        { label: here.section.label, href: here.section.href },
        ...(here.section.id === "getting-started" ? [] : [{ label: here.category.label }]),
      ]
    : []

  return (
    <SiteLayout toc>
      <PageHeader crumbs={crumbs} title={meta.title} description={meta.description} />
      <DemoSourceContext.Provider value={source}>
        <Component />
      </DemoSourceContext.Provider>
      <FullSource source={source} />
      <PrevNext pathname={pathname} />
    </SiteLayout>
  )
}

/** `#/components` and `#/pages`: every category with its items, like shadcn's components index. */
export function SectionIndex({ section }: { section: NavSection }) {
  useScrollToHash()
  const count = section.categories.reduce((n, c) => n + c.items.length, 0)
  const description =
    section.id === "pages"
      ? `${count} full-screen sample pages built only from Onu components: real app shells for admin, citizen and public services.`
      : `${count} components for Maldivian apps, grouped by what they do. Each one works in light and dark, LTR and RTL, English and Dhivehi.`
  return (
    <SiteLayout>
      <PageHeader
        crumbs={[{ label: "Docs", href: "/" }, { label: section.label }]}
        title={section.label}
        description={description}
      />
      <div className="gap-12 grid">
        {section.categories.map((category) => (
          <section key={category.id} aria-labelledby={`cat-${category.id}`} className="space-y-4">
            <h2 id={`cat-${category.id}`} className="gap-2 text-xl font-semibold tracking-tight flex items-baseline">
              {category.label}
              <span className="text-sm font-normal text-muted-foreground tabular-nums">{category.items.length}</span>
            </h2>
            <ul className="gap-x-8 gap-y-1 sm:grid-cols-2 md:grid-cols-3 grid">
              {category.items.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="py-1 text-sm block underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SiteLayout>
  )
}

export const componentsSection = navSections[1]!
export const pagesSection = navSections[2]!
