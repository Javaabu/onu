import { IconText } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "Icon with text", group: "Display and feedback", order: 21 }

export default function IconTextDemo() {
  return (
    <DemoPage>
      <DemoSection title="Meta rows">
        <IconText icon="map-pin" tone="muted">
          Malé, Kaafu Atoll
        </IconText>
        <IconText icon="calendar" tone="muted">
          12 March 2026
        </IconText>
        <IconText icon="clock" tone="muted">
          8:00 – 14:00
        </IconText>
        <IconText icon="phone" tone="muted">
          +960 330 0000
        </IconText>
      </DemoSection>
      <DemoSection title="Tones and sizes">
        <IconText icon="success" tone="success" size="sm">
          Verified
        </IconText>
        <IconText icon="warning" tone="warning">
          Expires soon
        </IconText>
        <IconText icon="error" tone="destructive" size="lg">
          Overdue
        </IconText>
        <IconText icon="external-link" iconPosition="end" tone="primary" iconLabel="opens in a new tab" asChild>
          <a href="https://gazette.gov.mv" target="_blank" rel="noreferrer">
            Gazette
          </a>
        </IconText>
        <IconText icon="map-pin">ހުޅުމާލެ</IconText>
      </DemoSection>
    </DemoPage>
  )
}
