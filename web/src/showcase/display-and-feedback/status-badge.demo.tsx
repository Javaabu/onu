import { StatusBadge, type StatusMap } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Status badge",
  group: "Display and feedback",
  order: 2,
  description: "Status with colour, icon and text, so colour is never the only signal.",
}

const applicationStatuses: StatusMap = {
  approved: { tone: "success", label: "Approved" },
  rejected: { tone: "danger", label: "Rejected" },
  in_review: { tone: "pending", label: "In review" },
  needs_info: { tone: "warning", label: "Needs information" },
  draft: { tone: "neutral", label: "Draft" },
  paid: { tone: "info", label: "Paid", icon: "credit-card" },
}

export default function StatusBadgeDemo() {
  return (
    <DemoPage>
      <DemoSection title="Tones">
        <StatusBadge status="success" />
        <StatusBadge status="warning" />
        <StatusBadge status="danger" />
        <StatusBadge status="info" />
        <StatusBadge status="neutral" />
        <StatusBadge status="pending" />
      </DemoSection>
      <DemoSection title="Custom status map" description="Map your own statuses to tones, labels and icons.">
        {Object.keys(applicationStatuses).map((status) => (
          <StatusBadge key={status} status={status} statusMap={applicationStatuses} />
        ))}
      </DemoSection>
      <DemoSection title="Sizes">
        <StatusBadge status="success" size="sm" />
        <StatusBadge status="success" size="md" />
        <StatusBadge status="success" size="lg" />
        <StatusBadge status="pending" icon={false}>
          No icon
        </StatusBadge>
      </DemoSection>
      <DemoSection title="Dhivehi">
        <StatusBadge status="success">ފާސްވެއްޖެ</StatusBadge>
        <StatusBadge status="danger">ރިޖެކްޓްކުރެވިއްޖެ</StatusBadge>
      </DemoSection>
    </DemoPage>
  )
}
