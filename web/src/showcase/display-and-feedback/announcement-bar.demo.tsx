import * as React from "react"
import { AnnouncementBar, Button } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Announcement bar",
  group: "Display and feedback",
  order: 9,
  description: "Top-of-page news, dismissible; with an id the dismissal is remembered.",
}

export default function AnnouncementBarDemo() {
  const [key, setKey] = React.useState(0)
  return (
    <DemoPage>
      <DemoSection title="Variants" className="p-0 grid overflow-hidden">
        <AnnouncementBar icon="megaphone" href="#apply" linkText="Apply now">
          Housing scheme applications close on 30 June.
        </AnnouncementBar>
        <AnnouncementBar variant="neutral" href="#hours" linkText="See hours">
          Ramazan service hours: 9:00–13:30.
        </AnnouncementBar>
        <AnnouncementBar variant="info">New: track your application on the mobile app.</AnnouncementBar>
        <AnnouncementBar variant="warning" dismissible={false} icon="wrench">
          Scheduled maintenance tonight from 23:00 to 01:00.
        </AnnouncementBar>
        <AnnouncementBar icon="megaphone">
          ރަސްމީ ބަންދު ދުވަސްތަކުގައި ސަރވިސް ސެންޓަރުތައް ބަންދުވާނެ.
        </AnnouncementBar>
      </DemoSection>
      <DemoSection
        title="Persistent dismissal"
        description="Dismiss it and reload: it stays hidden. Reset clears the stored choice."
        className="grid"
      >
        <AnnouncementBar key={key} id="demo-eid-2026" href="#eid" linkText="Details">
          Eid holidays: offices closed 6–10 June.
        </AnnouncementBar>
        <Button
          variant="outline"
          className="justify-self-start"
          onClick={() => {
            localStorage.removeItem("onu-announcement:demo-eid-2026")
            setKey((k) => k + 1)
          }}
        >
          Reset
        </Button>
      </DemoSection>
    </DemoPage>
  )
}
