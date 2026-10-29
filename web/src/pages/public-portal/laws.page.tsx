import * as React from "react"
import {
  AttachmentPreview,
  BottomSheet,
  Button,
  Highlight,
  SegmentedControl,
  SideNav,
  StatusBadge,
  TextInput,
  Icon,
  cn,
} from "@javaabu/onu"
import { proseVariants } from "@javaabu/onu/editor"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { law, type LawSection } from "./_data"
import type { L } from "./_i18n"
import { useDates, useL } from "./_i18n"
import { Container, PortalPageHeader } from "./_ui"

export const meta = { title: "Laws and regulations reader", group: "Public portal", layout: "bare", order: 14 }

type Lang = "dv" | "en" | "both"

const pick = (value: L, lang: "dv" | "en") => (lang === "dv" ? value.dv : value.en)
const langAttrs = (lang: "dv" | "en") => ({ lang, dir: lang === "dv" ? "rtl" : "ltr" }) as const

export default function LawsReaderPage() {
  const tr = useTr()
  const l = useL()
  const dv = useDv()
  const dates = useDates()
  const [chosen, setChosen] = React.useState<Lang | null>(null)
  const lang: Lang = chosen ?? (dv ? "dv" : "en")
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState("s-1")
  const [tocOpen, setTocOpen] = React.useState(false)

  const q = query.trim().toLowerCase()
  const langs: ("dv" | "en")[] = lang === "both" ? ["dv", "en"] : [lang]
  const sectionMatches = (s: LawSection) =>
    !q || [s.title, ...s.body].some((v) => langs.some((lg) => pick(v, lg).toLowerCase().includes(q)))
  const matchCount = law.chapters.flatMap((c) => c.sections).filter(sectionMatches).length

  // Highlight the section being read in the table of contents.
  React.useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-law-section]"))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-80px 0px -60% 0px" },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [q, lang])

  const goTo = (id: string) => {
    setTocOpen(false)
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    el.focus({ preventScroll: true })
    setActive(id)
  }

  const toc = (
    <SideNav
      aria-label={tr("Table of contents", "ފިހުރިސްތު")}
      size="sm"
      groups={law.chapters.map((c) => ({
        label: `${tr("Chapter", "ބާބު")} ${c.number}. ${l(c.title)}`,
        items: c.sections.map((s) => ({
          id: s.id,
          label: `${s.number}. ${l(s.title)}`,
          isActive: active === s.id,
          disabled: !sectionMatches(s),
          onSelect: () => goTo(s.id),
        })),
      }))}
    />
  )

  const text = (value: L, lg: "dv" | "en") => <Highlight text={pick(value, lg)} query={q} />

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("Laws", "ޤާނޫނުތައް"), href: routes.public.laws }, { label: l(law.title) }]}
        eyebrow={l(law.number)}
        title={l(law.title)}
        className="print:border-0 print:bg-transparent"
      >
        <div className="gap-x-6 gap-y-2 text-sm flex flex-wrap items-center text-muted-foreground">
          <StatusBadge status="success" size="sm">
            {tr("In force", "ހިނގަމުންދާ")}
          </StatusBadge>
          <span>
            {tr("Ratified", "ތަޞްދީޤުކުރީ")} {dates.date(law.ratified)}
          </span>
          <span>
            {tr("Last amended", "ފަހުން އިޞްލާޙުކުރީ")} {dates.date(law.amended)}
          </span>
        </div>
      </PortalPageHeader>

      {/* Toolbar */}
      <div className="top-14 backdrop-blur sticky z-20 border-b bg-background/95 print:hidden">
        <Container className="gap-3 py-3 flex flex-wrap items-center">
          <Button variant="outline" size="sm" startIcon="list" className="lg:hidden" onClick={() => setTocOpen(true)}>
            {tr("Contents", "ފިހުރިސްތު")}
          </Button>
          <SegmentedControl
            className="shrink-0"
            classNames={{ item: "min-w-fit" }}
            aria-label={tr("Language", "ބަސް")}
            size="sm"
            value={lang}
            onValueChange={(v) => setChosen(v as Lang)}
            options={[
              { value: "dv", label: "ދިވެހި" },
              { value: "en", label: "English" },
              { value: "both", label: tr("Both", "ދެބަސް") },
            ]}
          />
          <div className="gap-2 flex min-w-[12rem] flex-1 items-center">
            <TextInput
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              thaana={lang === "dv"}
              aria-label={tr("Search within this law", "މި ޤާނޫނުގައި ހޯދާ")}
              placeholder={tr("Search within this law…", "މި ޤާނޫނުގައި ހޯދާ…")}
              startAddon={<Icon name="search" />}
              className="sm:max-w-xs h-8"
            />
            <span role="status" className="text-xs whitespace-nowrap text-muted-foreground">
              {q ? tr(`${matchCount} sections`, `${matchCount} މާއްދާ`) : ""}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={tr("Print", "ޕްރިންޓްކުރޭ")}
            className="ms-auto print:hidden"
            onClick={() => window.print()}
          >
            <Icon name="print" />
          </Button>
        </Container>
      </div>

      <BottomSheet open={tocOpen} onOpenChange={setTocOpen} title={tr("Table of contents", "ފިހުރިސްތު")}>
        {toc}
      </BottomSheet>

      <Container className="py-8 gap-10 lg:grid-cols-[16rem_1fr] grid items-start">
        <aside className="top-32 lg:block sticky hidden max-h-[calc(100svh-9rem)] overflow-y-auto print:hidden">
          {toc}
        </aside>

        <div className="min-w-0">
          <article className={cn("max-w-none", proseVariants({ size: "lg" }))}>
            {law.chapters.map((chapter) => {
              const sections = chapter.sections.filter(sectionMatches)
              if (!sections.length) return null
              return (
                <section key={chapter.id} aria-labelledby={`${chapter.id}-h`}>
                  <h2 id={`${chapter.id}-h`} className="pb-2 border-b">
                    {tr("Chapter", "ބާބު")} {chapter.number}. {l(chapter.title)}
                  </h2>
                  {sections.map((s) => (
                    <section
                      key={s.id}
                      id={s.id}
                      data-law-section
                      tabIndex={-1}
                      aria-labelledby={`${s.id}-h`}
                      className="scroll-mt-36 outline-none"
                    >
                      <h3 id={`${s.id}-h`}>
                        {tr("Section", "މާއްދާ")} {s.number}. {l(s.title)}
                      </h3>
                      <div className={cn("gap-x-8", lang === "both" && "md:grid-cols-2 grid")}>
                        {langs.map((lg) => (
                          <div key={lg} {...langAttrs(lg)} className={lang === "both" ? "min-w-0" : undefined}>
                            {lang === "both" ? (
                              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                {lg === "dv" ? "ދިވެހި" : "English"}
                              </p>
                            ) : null}
                            {s.body.map((b) => (
                              <p key={b.en}>{text(b, lg)}</p>
                            ))}
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </section>
              )
            })}
          </article>

          <div className="mt-12 print:hidden">
            <h2 className="text-lg font-semibold">{tr("Download", "ޑައުންލޯޑް")}</h2>
            <AttachmentPreview
              className="mt-3"
              name={l(law.title)}
              description={tr(
                "Official gazette version, consolidated to 2 March 2026",
                "ސަރުކާރުގެ ގެޒެޓުގެ ނުސްޚާ، 2 މާރިޗް 2026 އާ ހަމައަށް",
              )}
              meta={l(law.number)}
              versions={[
                { lang: "dv", href: "#public-services-act-dv.pdf", size: 1_240_000, type: "application/pdf" },
                { lang: "en", href: "#public-services-act-en.pdf", size: 980_000, type: "application/pdf" },
              ]}
            />
          </div>
        </div>
      </Container>
    </PortalShell>
  )
}
