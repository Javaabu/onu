var e=`import { DescriptionList, DescriptionListItem, StatusBadge } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Description list",
  group: "Display and feedback",
  order: 1,
  description: "Label–value pairs for record views. Missing values show “—”.",
}

export default function DescriptionListDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Auto layout"
        description="Stacked in narrow containers, side by side from 28rem. Resize the window."
        className="block"
      >
        <DescriptionList
          items={[
            { label: "Full name", value: "Aishath Shiuna" },
            { label: "ID card", value: "A123456", copyable: true },
            { label: "Island", value: "Fuvahmulah" },
            { label: "Phone", value: null },
            { label: "Status", value: <StatusBadge status="success">Active</StatusBadge> },
            { label: "Monthly fee", value: "MVR 1,250.00" },
          ]}
        />
      </DemoSection>
      <DemoSection title="Inline, striped" className="block">
        <DescriptionList layout="inline" striped>
          <DescriptionListItem label="Account number" copyable copyValue="7730000123456">
            7730 0001 23456
          </DescriptionListItem>
          <DescriptionListItem label="Bank">Bank of Maldives</DescriptionListItem>
          <DescriptionListItem label="Remarks" fullWidth>
            Payment received through the counter at the Malé branch. Receipt issued on the same day.
          </DescriptionListItem>
        </DescriptionList>
      </DemoSection>
      <DemoSection title="In a narrow column (stacked)" className="max-w-xs block">
        <DescriptionList
          items={[
            { label: "ނަން", value: "އަޙްމަދު ޢަލީ" },
            { label: "ރަށް", value: "ހުޅުމާލެ" },
            { label: "އީމެއިލް", value: "" },
          ]}
        />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};