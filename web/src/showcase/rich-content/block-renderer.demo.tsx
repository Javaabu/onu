import { BlockRenderer } from "@javaabu/onu/editor"

import { DemoPage, DemoSection } from "../../components/demo"
import { pageJson } from "./sample-content"

export const meta = {
  title: "Block renderer",
  group: "Rich content",
  order: 3,
  description: "Renders block editor JSON to React without loading the editor. Safe by default.",
}

const unsafe = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "This link uses a javascript: URL, so it renders as plain text: " },
        { type: "text", text: "click me", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] },
      ],
    },
    { type: "paragraph", content: [{ type: "text", text: "<script>alert('raw HTML is shown as text')</script>" }] },
    { type: "embed", attrs: { src: "https://unknown.example/widget" } },
  ],
}

const t = (text: string) => ({ type: "text", text })
const para = (text: string) => ({ type: "paragraph", content: [t(text)] })
const items = (...texts: string[]) => texts.map((text) => ({ type: "listItem", content: [para(text)] }))
const table = (...rows: string[][]) => ({
  type: "table",
  content: rows.map((row, i) => ({
    type: "tableRow",
    content: row.map((text) => ({ type: i === 0 ? "tableHeader" : "tableCell", content: [para(text)] })),
  })),
})

/** Lists, quotes and tables take their direction from their text, whatever the page direction. */
const dhivehiArticle = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [t("ރާއްޖޭގެ ރީފުތައް")] },
    para("ރާއްޖޭގައި 1,192 ރަށް ހުރެއެވެ. Coral reefs protect every island."),
    { type: "bulletList", content: items("ހުޅުމާލެ", "އައްޑޫ ސިޓީ", "ފުވައްމުލައް") },
    { type: "orderedList", content: items("2024 ގައި ފެށުނު", "ދެވަނަ ބައި") },
    { type: "blockquote", content: [para("« ރީފުތައް ރައްކާތެރިކުރުމަކީ އަޅުގަނޑުމެންގެ ޒިންމާއެކެވެ. »")] },
    { type: "bulletList", content: items("An English list inside a Dhivehi article", "keeps its own direction") },
    table(["ރަށް", "އަތޮޅު", "އާބާދީ"], ["ހުޅުމާލެ", "ކ. އަތޮޅު", "60,000"], ["ފުވައްމުލައް", "ޏ. އަތޮޅު", "13,000"]),
    table(["Island", "Atoll", "Population"], ["Hulhumalé", "Kaafu", "60,000"], ["Addu City", "Seenu", "35,000"]),
  ],
}

export default function BlockRendererDemo() {
  return (
    <DemoPage>
      <DemoSection title="Published page" className="block">
        <BlockRenderer content={pageJson} className="max-w-3xl" />
      </DemoSection>
      <DemoSection
        title="Dhivehi article"
        description="Lists, quotes and tables follow their own text: bullets, numbers, the quote border and the first table column sit at the inline start."
        className="block"
      >
        <BlockRenderer content={dhivehiArticle} className="max-w-3xl" />
      </DemoSection>
      <DemoSection title="Sizes" className="gap-6 md:grid-cols-2 grid">
        <BlockRenderer size="sm" content={{ type: "doc", content: pageJson.content!.slice(0, 4) }} />
        <BlockRenderer size="lg" content={{ type: "doc", content: pageJson.content!.slice(0, 4) }} />
      </DemoSection>
      <DemoSection
        title="Safe by default"
        description="Script links are dropped, HTML stays text, and only YouTube/Vimeo are embedded."
        className="block"
      >
        <BlockRenderer content={unsafe} />
      </DemoSection>
      <DemoSection title="Empty" className="block">
        <BlockRenderer content={null} empty={<p className="text-sm text-muted-foreground">No content yet.</p>} />
      </DemoSection>
    </DemoPage>
  )
}
