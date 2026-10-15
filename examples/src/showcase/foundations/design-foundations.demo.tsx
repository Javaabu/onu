import * as React from "react"
import { Badge, Button, Density, Icon, SEMANTIC_ICON_NAMES, TextInput, cn } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Design foundations",
  group: "Foundations",
  order: 1,
  description: "Colour, type, spacing, radius, elevation, density and iconography (REQUIREMENTS R3.10).",
}

const COLOURS: [string, string, string?][] = [
  ["Primary", "bg-primary", "text-primary-foreground"],
  ["Primary subtle", "bg-primary-subtle", "text-primary-subtle-foreground"],
  ["Secondary", "bg-secondary", "text-secondary-foreground"],
  ["Muted", "bg-muted", "text-muted-foreground"],
  ["Accent", "bg-accent", "text-accent-foreground"],
  ["Destructive", "bg-destructive", "text-destructive-foreground"],
  ["Success", "bg-success", "text-success-foreground"],
  ["Warning", "bg-warning", "text-warning-foreground"],
  ["Info", "bg-info", "text-info-foreground"],
  ["Card", "bg-card border", "text-card-foreground"],
  ["Border", "bg-border"],
  ["Input", "bg-input"],
]

const CHARTS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
  "bg-chart-7",
  "bg-chart-8",
]

function Swatch({ name, bg, fg }: { name: string; bg: string; fg?: string }) {
  return (
    <div className="gap-1.5 grid">
      <div className={cn("h-16 p-2 text-xs font-medium flex items-end rounded-lg", bg, fg)}>{fg ? "Aa" : null}</div>
      <span className="text-sm">{name}</span>
    </div>
  )
}

export default function DesignFoundations() {
  return (
    <DemoPage>
      <DemoSection
        title="Colour"
        description="Every colour is a token. Change --onu-primary in the toolbar to re-theme."
        className="gap-4 sm:grid-cols-4 lg:grid-cols-6 grid grid-cols-2"
      >
        {COLOURS.map(([name, bg, fg]) => (
          <Swatch key={name} name={name} bg={bg} fg={fg} />
        ))}
      </DemoSection>

      <DemoSection title="Chart palette" className="gap-3 sm:grid-cols-8 grid grid-cols-4">
        {CHARTS.map((c, i) => (
          <div key={c} className="gap-1 grid">
            <div className={cn("h-10 rounded-md", c)} />
            <span className="text-xs text-muted-foreground">chart-{i + 1}</span>
          </div>
        ))}
      </DemoSection>

      <DemoSection title="Typography" className="gap-4 grid">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Inter — interface</p>
          <p className="text-4xl font-semibold tracking-tight">The quick brown fox</p>
          <p className="text-2xl font-semibold">Applications and permits</p>
          <p className="text-base">Body text at 16px with comfortable line height for long reading.</p>
          <p className="text-sm text-muted-foreground">Supporting text, help and captions.</p>
        </div>
        <div className="space-y-1" lang="dv" dir="rtl">
          <p className="text-xs text-muted-foreground">MV Faseyha (headings) and Faruma (text) — ތާނަ</p>
          <p className="text-4xl font-[family-name:var(--onu-font-thaana-bold)]">ދިވެހިރާއްޖޭގެ ޖުމްހޫރިއްޔާ</p>
          <p className="text-2xl font-[family-name:var(--onu-font-thaana-bold)]">ޚިދުމަތްތަކާއި ހުއްދަތައް</p>
          <p className="text-base">ދިގު ލިޔުންތައް ކިޔުމަށް ފަސޭހަ ގޮތަށް ތައްޔާރުކޮށްފައިވާ ލިޔުމެވެ.</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">JetBrains Mono — code, IDs, keys</p>
          <p className="text-sm font-mono">APP-2026-000042 · sk_live_••••4f2a · 4.1752° N, 73.5093° E</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Mixed script</p>
          <p className="text-lg">
            Application <span lang="dv">އެޕްލިކޭޝަން</span> APP-2026-0042 — MVR 1,250.00
          </p>
        </div>
      </DemoSection>

      <DemoSection title="Radius & elevation" className="gap-4 sm:grid-cols-4 grid grid-cols-2">
        {(["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl"] as const).map((r) => (
          <div key={r} className={cn("h-20 text-sm grid place-items-center border bg-card", r)}>
            {r}
          </div>
        ))}
        {(["shadow-xs", "shadow-sm", "shadow-md", "shadow-lg"] as const).map((s) => (
          <div key={s} className={cn("h-20 text-sm grid place-items-center rounded-lg bg-card", s)}>
            {s}
          </div>
        ))}
      </DemoSection>

      <DemoSection
        title="Density"
        description="Each mode scales the spacing unit for its subtree."
        className="gap-4 lg:grid-cols-2 grid"
      >
        {(["compact", "default", "comfortable", "touch"] as const).map((d) => (
          <Density key={d} value={d} className="gap-2 p-3 grid rounded-lg border">
            <span className="text-sm font-medium capitalize">{d}</span>
            <div className="gap-2 flex">
              <TextInput aria-label={`${d} input`} placeholder="Search" />
              <Button>Save</Button>
            </div>
          </Density>
        ))}
      </DemoSection>

      <DemoSection title="Spacing" className="gap-2 grid">
        {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
          <div key={n} className="gap-3 flex items-center">
            <span className="w-10 text-xs text-muted-foreground tabular-nums">{n}</span>
            <div className="h-3 rounded-sm bg-primary" style={{ width: `calc(var(--spacing) * ${n})` }} />
          </div>
        ))}
      </DemoSection>

      <DemoSection
        title={`Icons (${SEMANTIC_ICON_NAMES.length} semantic names, Lucide)`}
        description="Directional icons mirror in RTL."
        className="gap-3 sm:grid-cols-6 lg:grid-cols-8 grid grid-cols-3"
      >
        {SEMANTIC_ICON_NAMES.map((name) => (
          <div key={name} className="gap-1.5 p-3 grid place-items-center rounded-md border text-center">
            <Icon name={name} size="lg" />
            <span className="text-[11px] break-all text-muted-foreground">{name}</span>
          </div>
        ))}
      </DemoSection>

      <DemoSection title="Status" className="gap-2 flex flex-wrap">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </DemoSection>
    </DemoPage>
  )
}
