import * as React from "react"
import { BackButton, Breadcrumbs, ContentCard, SegmentedControl, ShareButtons, Tag, UserAvatar } from "@javaabu/onu"
import { BlockRenderer, type JSONContent } from "@javaabu/onu/editor"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { news, newsCategories, newsImage } from "./_data"
import { useDates, useL } from "./_i18n"
import { Container } from "./_ui"

export const meta = { title: "News article", group: "Public portal", layout: "bare", order: 5 }

const text = (value: string, marks?: JSONContent["marks"]): JSONContent => ({ type: "text", text: value, marks })
const p = (...content: JSONContent[]): JSONContent => ({ type: "paragraph", content })
const h2 = (value: string): JSONContent => ({ type: "heading", attrs: { level: 2 }, content: [text(value)] })
const ul = (...items: string[]): JSONContent => ({
  type: "bulletList",
  content: items.map((i) => ({ type: "listItem", content: [p(text(i))] })),
})

const bodyEn: JSONContent = {
  type: "doc",
  content: [
    p(
      text("From Monday, ferries between "),
      text("Hulhumalé", [{ type: "bold" }]),
      text(" and "),
      text("Villimalé", [{ type: "bold" }]),
      text(" run every 30 minutes, cutting the trip across the capital from over an hour to 25 minutes."),
    ),
    p(
      text(
        "The new route stops at the Hulhumalé Phase 2 jetty, the Malé ferry terminal and Villimalé harbour. Fares stay at MVR 10 for adults and MVR 5 for students and seniors.",
      ),
    ),
    h2("Timetable"),
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: ["Route", "First ferry", "Last ferry"].map((c) => ({ type: "tableHeader", content: [p(text(c))] })),
        },
        {
          type: "tableRow",
          content: ["Hulhumalé → Villimalé", "05:30", "23:30"].map((c) => ({
            type: "tableCell",
            content: [p(text(c))],
          })),
        },
        {
          type: "tableRow",
          content: ["Villimalé → Hulhumalé", "06:00", "00:00"].map((c) => ({
            type: "tableCell",
            content: [p(text(c))],
          })),
        },
      ],
    },
    h2("What changes for passengers"),
    ul(
      "Pay with a transport card or by scanning the QR code on board.",
      "Bicycles travel free outside peak hours.",
      "Wheelchair ramps are available at every stop.",
    ),
    {
      type: "blockquote",
      content: [
        p(
          text(
            "“Families in Villimalé can now reach the hospital in Hulhumalé without changing boats.” — Ibrahim Naseem, Minister of State",
          ),
        ),
      ],
    },
    {
      type: "callout",
      attrs: { variant: "info" },
      content: [text("Ferries run on a reduced timetable on Fridays until 13:30.")],
    },
  ],
}

const bodyDv: JSONContent = {
  type: "doc",
  content: [
    p(
      text("ހޯމަ ދުވަހުން ފެށިގެން "),
      text("ހުޅުމާލެ", [{ type: "bold" }]),
      text(" އާއި "),
      text("ވިލިމާލެ", [{ type: "bold" }]),
      text(
        " ދެމެދު ކޮންމެ 30 މިނިޓަކުން ފެރީ ދުއްވާނެ. މިއާއެކު ވެރިރަށުގެ ތެރޭގައި ދަތުރުކުރަން ހޭދަވާ ވަގުތު ގަޑިއިރަކުން 25 މިނިޓަށް ދަށްވާނެ.",
      ),
    ),
    p(
      text(
        "އައު ރޫޓުގައި ހުޅުމާލޭ ފޭސް 2 ގެ ޖެޓީ، މާލޭ ފެރީ ޓާމިނަލް އަދި ވިލިމާލޭ ބަނދަރުގައި ހުއްޓާނެ. ބޮޑެތި މީހުންނަށް 10 ރުފިޔާ، ދަރިވަރުންނާއި މުސްކުޅިންނަށް 5 ރުފިޔާގެ އަގު ބަދަލެއް ނުވާނެ.",
      ),
    ),
    h2("ދަތުރުތަކުގެ ތާވަލު"),
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: ["ރޫޓު", "ފުރަތަމަ ދަތުރު", "ފަހު ދަތުރު"].map((c) => ({
            type: "tableHeader",
            content: [p(text(c))],
          })),
        },
        {
          type: "tableRow",
          content: ["ހުޅުމާލެ ← ވިލިމާލެ", "05:30", "23:30"].map((c) => ({ type: "tableCell", content: [p(text(c))] })),
        },
        {
          type: "tableRow",
          content: ["ވިލިމާލެ ← ހުޅުމާލެ", "06:00", "00:00"].map((c) => ({ type: "tableCell", content: [p(text(c))] })),
        },
      ],
    },
    h2("ދަތުރުކުރާ ފަރާތްތަކަށް އަންނަ ބަދަލު"),
    ul(
      "ޓްރާންސްޕޯޓް ކާޑުން ނުވަތަ ކިއުއާރް ކޯޑް ސްކޭންކޮށް ފައިސާ ދެއްކޭނެ.",
      "ބިޒީ ނޫން ގަޑިތަކުގައި ބައިސްކަލު ހިލޭ ގެންދެވޭނެ.",
      "ކޮންމެ ސްޓޮޕެއްގައި ވީލްޗެއާ ރޭމްޕް ހުންނާނެ.",
    ),
    {
      type: "blockquote",
      content: [
        p(
          text(
            "“ވިލިމާލޭގެ ޢާއިލާތަކަށް ދޯނި ބަދަލުނުކޮށް ހުޅުމާލޭ ހޮސްޕިޓަލަށް މިހާރު ދެވޭނެ.” — ސްޓޭޓް މިނިސްޓަރ އިބްރާހީމް ނަސީމް",
          ),
        ),
      ],
    },
    {
      type: "callout",
      attrs: { variant: "info" },
      content: [text("ހުކުރު ދުވަހު 13:30 އަށް ދަތުރުތައް މަދުކޮށް ދުއްވާނެ.")],
    },
  ],
}

export default function NewsArticlePage() {
  const tr = useTr()
  const l = useL()
  const dv = useDv()
  const dates = useDates()
  const article = news[0]
  // The article follows the site language until the reader picks one.
  const [chosen, setLang] = React.useState<string | null>(null)
  const lang = chosen ?? (dv ? "dv" : "en")
  const related = news
    .filter((n) => n.id !== article.id && n.category === "projects")
    .concat(news.slice(1, 3))
    .slice(0, 3)
  const title = lang === "dv" ? article.title.dv : article.title.en

  return (
    <PortalShell>
      <article>
        <Container className="max-w-3xl pt-8 sm:pt-12">
          <Breadcrumbs
            items={[
              { label: tr("Home", "މައި ސަފްހާ"), href: routes.public.home, icon: "home" },
              { label: tr("News", "ޚަބަރު"), href: routes.public.news },
              { label: l(article.title) },
            ]}
          />
          <div className="mt-6 gap-2 flex flex-wrap items-center">
            <Tag variant="primary" href={routes.public.news}>
              {l(newsCategories.find((c) => c.value === article.category)!.label)}
            </Tag>
            <span className="text-sm text-muted-foreground">
              <time dateTime={article.date}>{dates.date(article.date)}</time> ·{" "}
              {tr(`${article.minutes} min read`, `${article.minutes} މިނިޓު`)}
            </span>
          </div>
          <h1
            lang={lang}
            dir={lang === "dv" ? "rtl" : "ltr"}
            className="mt-4 font-semibold tracking-tight leading-tight text-[clamp(1.875rem,1.2rem+2.6vw,3rem)] text-balance"
          >
            {title}
          </h1>
          <div className="mt-6 gap-4 py-4 flex flex-wrap items-center justify-between border-y">
            <div className="gap-3 flex items-center">
              <UserAvatar name={tr("Mariyam Zahira", "މަރިޔަމް ޒާހިރާ")} decorative />
              <div className="text-sm">
                <div className="font-medium">{tr("Mariyam Zahira", "މަރިޔަމް ޒާހިރާ")}</div>
                <div className="text-muted-foreground">{tr("Communications", "މުވާސަލާތު")}</div>
              </div>
            </div>
            <div className="gap-2 flex flex-wrap items-center">
              <span id="article-lang" className="sr-only">
                {tr("Article language", "ލިޔުމުގެ ބަސް")}
              </span>
              <SegmentedControl
                className="shrink-0"
                classNames={{ item: "min-w-fit" }}
                aria-labelledby="article-lang"
                size="sm"
                value={lang}
                onValueChange={setLang}
                options={[
                  { value: "dv", label: "ދިވެހި" },
                  { value: "en", label: "English" },
                ]}
              />
            </div>
          </div>
        </Container>

        <Container className="max-w-5xl mt-8">
          <figure>
            <img
              src={newsImage(article, 1600, 800)}
              alt={tr(
                "A ferry arriving at the Hulhumalé Phase 2 jetty",
                "ހުޅުމާލޭ ފޭސް 2 ގެ ޖެޓީއަށް ފެރީއެއް އަންނަނީ",
              )}
              className="aspect-[2/1] w-full rounded-2xl border object-cover"
            />
            <figcaption className="mt-2 text-sm text-center text-muted-foreground">
              {tr(
                "The new Phase 2 jetty. Photo: Ministry of Services",
                "ފޭސް 2 ގެ އައު ޖެޓީ. ފޮޓޯ: ޚިދުމަތްތަކުގެ ވުޒާރާ",
              )}
            </figcaption>
          </figure>
        </Container>

        <Container className="max-w-3xl py-10">
          <div lang={lang} dir={lang === "dv" ? "rtl" : "ltr"}>
            <BlockRenderer content={lang === "dv" ? bodyDv : bodyEn} size="lg" />
          </div>

          <div className="mt-10 gap-4 sm:flex-row sm:items-center pt-6 flex flex-col justify-between border-t">
            <div className="gap-2 flex flex-wrap" aria-label={tr("Tags", "ޓެގްތައް")} role="group">
              {[tr("Transport", "ދަތުރުފަތުރު"), tr("Hulhumalé", "ހުޅުމާލެ"), tr("Villimalé", "ވިލިމާލެ")].map((t) => (
                <Tag key={t} variant="outline" href={routes.public.search}>
                  {t}
                </Tag>
              ))}
            </div>
            <ShareButtons
              native="never"
              title={title}
              networks={["copy", "facebook", "x", "whatsapp", "viber"]}
              iconOnly
              size="sm"
            />
          </div>
          <BackButton className="mt-6" href={routes.public.news}>
            {tr("All news", "ހުރިހާ ޚަބަރެއް")}
          </BackButton>
        </Container>
      </article>

      <div className="border-t bg-muted/30">
        <Container className="py-12">
          <h2 className="text-xl font-semibold">{tr("Related articles", "ގުޅުންހުރި ޚަބަރު")}</h2>
          <ul className="mt-6 gap-6 md:grid-cols-3 grid">
            {related.map((n) => (
              <li key={n.id}>
                <ContentCard
                  className="h-full"
                  title={l(n.title)}
                  image={{ src: newsImage(n, 800, 450), alt: "" }}
                  href={routes.public.newsArticle}
                  date={n.date}
                  category={l(newsCategories.find((c) => c.value === n.category)!.label)}
                />
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </PortalShell>
  )
}
