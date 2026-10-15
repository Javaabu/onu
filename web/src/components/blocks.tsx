import * as React from "react"
import { Link, Navigate, useParams } from "react-router"
import { Icon, LinkButton, SegmentedControl, useTheme } from "@javaabu/onu"

import { blockId, pageCategory, type Entry } from "../registry"
import { useSettings } from "../settings"
import { CodeFallback, LazyCodeBlock } from "./demo"
import { SiteLayout } from "./layout"
import { PageHeader, PageReady, useScrollToHash } from "./views"

const WIDTHS = {
  desktop: { label: "Desktop", width: "100%" },
  tablet: { label: "Tablet", width: "768px" },
  phone: { label: "Phone", width: "390px" },
} as const
type Width = keyof typeof WIDTHS

/** The full-screen route of a sample page, as a URL the iframe (or a new tab) can load. */
function pageUrl(entry: Entry) {
  return `${window.location.pathname}${window.location.search}#/pages/${entry.slug}`
}

function BlockSource({ load }: { load: () => Promise<string> }) {
  const source = React.use(load())
  return (
    <LazyCodeBlock
      code={source}
      language="tsx"
      lineNumbers
      className="my-0 rounded-xl"
      classNames={{ pre: "max-h-[80vh]" }}
    />
  )
}

/**
 * One sample page as a block, like shadcn's blocks: a live preview in an iframe
 * (so its full-screen layout gets its own viewport) at desktop, tablet or phone
 * width, or its source.
 */
function Block({ entry }: { entry: Entry }) {
  const [view, setView] = React.useState<"preview" | "code">("preview")
  const [width, setWidth] = React.useState<Width>("desktop")
  const { settings } = useSettings()
  const { resolvedTheme } = useTheme()
  const id = blockId(entry)
  // The page reads the shared settings and theme when it loads: reload it when they change.
  const frameKey = `${JSON.stringify(settings)}:${resolvedTheme}`

  return (
    <section
      data-demo-section
      aria-labelledby={id}
      className="scroll-m-20 gap-3 min-w-0 grid grid-cols-[minmax(0,1fr)]"
    >
      <h2 id={id} className="text-xl font-semibold tracking-tight scroll-m-24">
        <Link to={`#${id}`} className="underline-offset-4 hover:underline">
          {entry.meta.title}
        </Link>
      </h2>
      {entry.meta.description ? (
        <p className="text-sm text-muted-foreground" dir="auto">
          {entry.meta.description}
        </p>
      ) : null}
      <div className="gap-2 flex flex-wrap items-center">
        <SegmentedControl
          aria-label={`${entry.meta.title}: view`}
          size="sm"
          value={view}
          onValueChange={(v) => setView(v as "preview" | "code")}
          options={[
            { value: "preview", label: "Preview", icon: <Icon name="eye" /> },
            { value: "code", label: "Code", icon: <Icon name="code" /> },
          ]}
        />
        {view === "preview" ? (
          <SegmentedControl
            aria-label={`${entry.meta.title}: preview width`}
            size="sm"
            value={width}
            onValueChange={(v) => setWidth(v as Width)}
            className="md:inline-flex hidden"
            options={Object.entries(WIDTHS).map(([value, w]) => ({ value, label: w.label }))}
          />
        ) : null}
        <LinkButton
          href={pageUrl(entry)}
          external
          variant="ghost"
          size="sm"
          endIcon="external-link"
          className="ms-auto"
        >
          Open
        </LinkButton>
      </div>
      {view === "preview" ? (
        <div className="p-2 overflow-hidden rounded-xl border bg-muted/40">
          <iframe
            key={frameKey}
            src={pageUrl(entry)}
            title={`${entry.meta.title} preview`}
            loading="lazy"
            className="mx-auto block h-[min(800px,80vh)] max-w-full rounded-lg border bg-background transition-[width]"
            style={{ width: WIDTHS[width].width }}
          />
        </div>
      ) : (
        <div data-axe-skip>
          <React.Suspense fallback={<CodeFallback />}>
            <BlockSource load={entry.source} />
          </React.Suspense>
        </div>
      )}
    </section>
  )
}

/** `#/pages/auth`: every sample page of a category as a block, with preview and code. */
export function BlocksPage() {
  const { category: id = "" } = useParams()
  useScrollToHash()
  const category = pageCategory(id)
  if (!category) return <Navigate to="/pages" replace />
  return (
    <SiteLayout toc>
      <PageHeader
        crumbs={[{ label: "Sample pages", href: "/pages" }, { label: category.label }]}
        title={category.label}
        description={`${category.items.length} sample page${category.items.length === 1 ? "" : "s"} built only from Onu components. Preview each one at desktop, tablet or phone width, read its code, or open it full screen.`}
      />
      <PageReady />
      <div className="gap-16 grid grid-cols-[minmax(0,1fr)]">
        {category.items.map((item) => (item.entry ? <Block key={item.entry.slug} entry={item.entry} /> : null))}
      </div>
      <p className="mt-16 text-sm text-muted-foreground">
        <Icon name="info" className="size-4 me-1 inline" /> Previews use the language, direction, theme and colour you
        pick with Customize.
      </p>
    </SiteLayout>
  )
}
