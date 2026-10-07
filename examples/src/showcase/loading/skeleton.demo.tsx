import { SkeletonCard, SkeletonTable, SkeletonText } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Skeleton",
  group: "Loading",
  order: 2,
  description: "Skeleton presets for text, cards and tables.",
}

export default function SkeletonDemo() {
  return (
    <DemoPage>
      <DemoSection title="Text" className="gap-6 sm:grid-cols-3 grid">
        <SkeletonText />
        <SkeletonText lines={5} size="sm" />
        <SkeletonText lines={2} size="lg" widths={["40%", "80%"]} />
      </DemoSection>
      <DemoSection title="Cards" className="gap-4 sm:grid-cols-3 grid">
        <SkeletonCard />
        <SkeletonCard avatar lines={3} actions={2} />
        <SkeletonCard media lines={2} />
      </DemoSection>
      <DemoSection
        title="Table"
        description="Narrow containers show only the first two columns."
        className="gap-4 grid"
      >
        <SkeletonTable selectable />
        <div className="max-w-xs">
          <SkeletonTable rows={3} columns={5} />
        </div>
      </DemoSection>
    </DemoPage>
  )
}
