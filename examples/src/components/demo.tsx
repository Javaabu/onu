import * as React from "react"
import { useLocation, useNavigate } from "react-router"
import { CodeBlock } from "@javaabu/onu/editor"
import { Spinner, Tabs, TabsContent, TabsList, TabsTrigger, cn } from "@javaabu/onu"

import { sectionSource } from "./section-source"

/** The demo file's source (loaded on demand), so each section can show its own code. */
export interface DemoSource {
  /** Section titles with extractable code, known at build time. */
  sections: string[]
  /** Fetches the file's source text; cached, so every call returns the same promise. */
  load: () => Promise<string>
}

export const DemoSourceContext = React.createContext<DemoSource | null>(null)

/** Code views; the CodeBlock loads its Shiki highlighter only when it first renders. */
export const LazyCodeBlock = CodeBlock

/** `Thaana input` → `thaana-input`; used for section anchors and the table of contents. */
export function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9ހ-޿]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  )
}

export function CodeFallback() {
  return (
    <div className="h-32 flex items-center justify-center text-muted-foreground">
      <Spinner />
    </div>
  )
}

/** A section's code. The Code tab mounts this only when opened, so the source loads then. */
function SectionCode({ load, title }: { load: () => Promise<string>; title: string }) {
  const source = React.use(load())
  const code = React.useMemo(() => sectionSource(source, title), [source, title])
  return <LazyCodeBlock code={code} language="tsx" className="my-0 rounded-xl" classNames={{ pre: "max-h-[28rem]" }} />
}

/** A titled block on a showcase page: heading, description, then a Preview / Code card. */
export function DemoSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const source = React.useContext(DemoSourceContext)
  const hasCode = !!source?.sections.includes(title)
  const id = slugify(title)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const preview = (
    <div className="p-4 sm:p-8 md:p-10 min-h-48 flex items-center justify-center overflow-x-auto rounded-xl border bg-background">
      <div
        className={cn(
          className
            ? "gap-3 min-w-0 flex w-full flex-wrap items-start"
            : "gap-3 flex flex-wrap items-center justify-center",
          className,
        )}
      >
        {children}
      </div>
    </div>
  )

  return (
    <section data-demo-section aria-labelledby={id} className="scroll-mt-20 gap-3 grid">
      <h2 id={id} className="group text-xl font-semibold tracking-tight scroll-mt-20">
        <a
          href={`#${pathname}#${id}`}
          onClick={(e) => {
            scrollToAnchor(e, id)
            navigate({ hash: id }, { replace: true, preventScrollReset: true })
          }}
          className="decoration-primary decoration-2 underline-offset-4 hover:underline"
        >
          {title}
        </a>
      </h2>
      {description ? (
        <p className="text-sm text-muted-foreground">
          <span dir="auto">{description}</span>
        </p>
      ) : null}
      {source && hasCode ? (
        <Tabs defaultValue="preview" className="gap-3">
          <TabsList variant="line" aria-label={`${title}: preview or code`} className="-ms-1">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">{preview}</TabsContent>
          <TabsContent value="code" data-axe-skip>
            <React.Suspense fallback={<CodeFallback />}>
              <SectionCode load={source.load} title={title} />
            </React.Suspense>
          </TabsContent>
        </Tabs>
      ) : (
        preview
      )}
    </section>
  )
}

/**
 * The router owns the URL hash (`#/components/...#section`), so section
 * anchors scroll themselves instead of relying on the browser.
 */
export function scrollToAnchor(event: React.MouseEvent, id: string) {
  event.preventDefault()
  const target = document.getElementById(id)
  if (!target) return
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
}

/** Stacks sections on a showcase page. */
export function DemoPage({ children }: { children: React.ReactNode }) {
  return <div className="gap-12 grid">{children}</div>
}
