var e=`import * as React from "react"
import { PublishBox, toast, type PublishStatus } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { daysFromNow } from "./_data"

export const meta = {
  title: "Publish box",
  group: "Display and feedback",
  order: 14,
  description: "Status, visibility and publish date with Preview, Save draft and Publish actions.",
}

const delay = () => new Promise((resolve) => setTimeout(resolve, 1200))

export default function PublishBoxDemo() {
  const [status, setStatus] = React.useState<PublishStatus>("draft")
  const [visibility, setVisibility] = React.useState("public")
  const [publishAt, setPublishAt] = React.useState<Date | null>(null)

  return (
    <DemoPage>
      <DemoSection title="Editable (sidebar width)" className="max-w-xs block">
        <PublishBox
          status={status}
          onStatusChange={setStatus}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          publishAt={publishAt}
          onPublishAtChange={setPublishAt}
          previewHref="#preview"
          onSaveDraft={async () => {
            await delay()
            toast.success("Draft saved")
          }}
          onPublish={async () => {
            await delay()
            setStatus(publishAt && publishAt > new Date() ? "scheduled" : "published")
            toast.success("News article published")
          }}
        />
      </DemoSection>
      <DemoSection title="Read-only states" className="sm:grid-cols-2 grid">
        <PublishBox status="scheduled" visibility="public" publishAt={daysFromNow(3)} onPublish={() => {}} />
        <PublishBox
          status="published"
          visibility="private"
          publishAt={daysFromNow(-12)}
          onPublish={() => {}}
          onPreview={() => {}}
        />
        <PublishBox status="pending" onSaveDraft={() => {}} onPublish={() => {}} disabled />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};