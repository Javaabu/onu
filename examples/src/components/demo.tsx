import * as React from "react"
import { useLocation, useNavigate } from "react-router"
import { CodeBlock } from "@javaabu/onu/editor"
import { Spinner, Tabs, TabsContent, TabsList, TabsTrigger, cn } from "@javaabu/onu"

/** The demo file's source, so each section can show its own code. */
export const DemoSourceContext = React.createContext<string>("")

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

/** Index just past the `>` that closes the JSX opening tag starting at `start`. */
function openTagEnd(source: string, start: number) {
  let depth = 0
  let quote = ""
  for (let i = start; i < source.length; i++) {
    const ch = source[i]
    if (quote) {
      if (ch === quote) quote = ""
    } else if (ch === "{") depth++
    else if (ch === "}") depth--
    else if (depth === 0 && (ch === '"' || ch === "'")) quote = ch
    else if (depth === 0 && ch === ">") return source[i - 1] === "/" ? -1 : i + 1
  }
  return -1
}

function dedent(code: string) {
  const lines = code
    .replace(/^\s*\n/, "")
    .replace(/\s+$/, "")
    .split("\n")
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length))
  return lines.map((l) => l.slice(indent)).join("\n")
}

/** The JSX inside `<DemoSection title="…">` in a demo file, or "" when it can't be found. */
export function sectionSource(source: string, title: string) {
  const marker = source.indexOf(`title=${JSON.stringify(title)}`)
  if (marker === -1) return ""
  const start = source.lastIndexOf("<DemoSection", marker)
  if (start === -1) return ""
  const bodyStart = openTagEnd(source, start)
  if (bodyStart === -1) return ""
  let depth = 1
  const tag = /<DemoSection\b|<\/DemoSection>/g
  tag.lastIndex = bodyStart
  for (let m = tag.exec(source); m; m = tag.exec(source)) {
    depth += m[0] === "</DemoSection>" ? -1 : 1
    if (depth === 0) return dedent(source.slice(bodyStart, m.index))
  }
  return ""
}

export function CodeFallback() {
  return (
    <div className="h-32 flex items-center justify-center text-muted-foreground">
      <Spinner />
    </div>
  )
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
  const code = React.useMemo(() => (source ? sectionSource(source, title) : ""), [source, title])
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
      {code ? (
        <Tabs defaultValue="preview" className="gap-3">
          <TabsList variant="line" aria-label={`${title}: preview or code`} className="-ms-1">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">{preview}</TabsContent>
          <TabsContent value="code" data-axe-skip>
            <React.Suspense fallback={<CodeFallback />}>
              <LazyCodeBlock
                code={code}
                language="tsx"
                className="my-0 rounded-xl"
                classNames={{ pre: "max-h-[28rem]" }}
              />
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
