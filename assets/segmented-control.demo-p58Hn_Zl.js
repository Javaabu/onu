var e=`import * as React from "react"
import { FormField, Icon, SegmentedControl, useListingViewOptions, useTranslation } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Segmented control",
  group: "Choice inputs",
  order: 12,
  description:
    "One of a few options, side by side, or icon-only (a listing's view switcher). Arrow keys follow the visual order (RTL too).",
}

export default function SegmentedControlDemo() {
  const [period, setPeriod] = React.useState("month")
  const [view, setView] = React.useState("table")
  const { t } = useTranslation()
  const viewOptions = useListingViewOptions()
  return (
    <DemoPage>
      <DemoSection title="Basic" className="max-w-md gap-4 grid">
        <FormField label="Period" help={\`Showing: \${period}\`}>
          <SegmentedControl
            options={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ]}
            value={period}
            onValueChange={setPeriod}
          />
        </FormField>
        <SegmentedControl
          aria-label="View"
          iconOnly
          options={[
            { value: "table", label: "Table", icon: <Icon name="table" /> },
            { value: "list", label: "List", icon: <Icon name="list" /> },
            { value: "grid", label: "Grid", icon: <Icon name="grid" /> },
            { value: "kanban", label: "Kanban", icon: <Icon name="kanban" />, disabled: true },
          ]}
        />
      </DemoSection>
      <DemoSection
        title="View switcher"
        description="A listing's built-in views (useListingViewOptions): icon-only segments named by their translated labels."
      >
        <SegmentedControl
          aria-label={t("listing.view")}
          size="sm"
          iconOnly
          value={view}
          onValueChange={setView}
          options={viewOptions}
        />
        <span className="text-sm text-muted-foreground">Current: {view}</span>
      </DemoSection>
      <DemoSection title="Icons with labels, fewer views">
        <SegmentedControl
          aria-label="View"
          size="sm"
          defaultValue="list"
          options={[
            { value: "list", label: "List", icon: <Icon name="list" /> },
            { value: "grid", label: "Grid", icon: <Icon name="grid" /> },
          ]}
        />
        <SegmentedControl
          aria-label="View"
          size="sm"
          defaultValue="map"
          options={[
            { value: "table", label: "Table", icon: <Icon name="table" /> },
            { value: "map", label: "Map", icon: <Icon name="map-pin" /> },
          ]}
        />
      </DemoSection>
      <DemoSection title="Sizes and full width" className="max-w-md gap-4 grid">
        <SegmentedControl aria-label="Small" size="sm" options={["Active", "Archived"]} />
        <SegmentedControl aria-label="Default" options={["Active", "Archived"]} />
        <SegmentedControl aria-label="Large" size="lg" fullWidth options={["Active", "Archived", "Trashed"]} />
        <SegmentedControl aria-label="ބައްޓަން" fullWidth options={["ދުވަސް", "ހަފްތާ", "މަސް"]} />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};