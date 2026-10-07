import * as React from "react"
import { Tag } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "Tag / chip", group: "Display and feedback", order: 3 }

const ATOLLS = ["Malé", "Addu", "Fuvahmulah", "Laamu", "Baa", "ހުވަދު"]

export default function TagDemo() {
  const [tags, setTags] = React.useState(ATOLLS)
  const [selected, setSelected] = React.useState<string[]>(["Addu"])
  return (
    <DemoPage>
      <DemoSection title="Variants and sizes">
        <Tag>Default</Tag>
        <Tag variant="primary">Primary</Tag>
        <Tag variant="outline">Outline</Tag>
        <Tag size="sm">Small</Tag>
        <Tag size="lg" icon="map-pin">
          Large with icon
        </Tag>
        <Tag disabled onRemove={() => {}}>
          Disabled
        </Tag>
      </DemoSection>
      <DemoSection title="Removable" description="Click × or focus a tag and press Delete.">
        {tags.map((tag) => (
          <Tag key={tag} onRemove={() => setTags((t) => t.filter((x) => x !== tag))}>
            {tag}
          </Tag>
        ))}
        {tags.length === 0 ? (
          <button type="button" className="text-sm text-primary" onClick={() => setTags(ATOLLS)}>
            Reset
          </button>
        ) : null}
      </DemoSection>
      <DemoSection title="Clickable filters">
        {ATOLLS.map((atoll) => (
          <Tag
            key={atoll}
            variant="outline"
            selected={selected.includes(atoll)}
            onClick={() => setSelected((s) => (s.includes(atoll) ? s.filter((x) => x !== atoll) : [...s, atoll]))}
          >
            {atoll}
          </Tag>
        ))}
      </DemoSection>
      <DemoSection title="Links">
        <Tag href="#news" icon="file-text">
          News
        </Tag>
        <Tag href="#services">Services</Tag>
      </DemoSection>
    </DemoPage>
  )
}
