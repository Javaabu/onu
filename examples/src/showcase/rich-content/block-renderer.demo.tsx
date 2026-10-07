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

export default function BlockRendererDemo() {
  return (
    <DemoPage>
      <DemoSection title="Published page" className="block">
        <BlockRenderer content={pageJson} className="max-w-3xl" />
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
