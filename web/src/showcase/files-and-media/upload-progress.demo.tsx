import * as React from "react"
import { Button, UploadProgress, useUploadQueue, type UploadItem } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { fakeUpload } from "./_mock"

export const meta = { title: "Upload progress", group: "Files and media", order: 4 }

const file = (name: string, kb: number, type = "application/pdf") =>
  new File([new Uint8Array(kb * 1024)], name, { type })

const states: UploadItem[] = [
  { id: "1", file: file("Annual report 2025.pdf", 2300), status: "uploading", progress: 64 },
  { id: "2", file: file("Site plan.pdf", 820), status: "success", progress: 100 },
  {
    id: "3",
    file: file("Budget.xlsx", 140),
    status: "error",
    progress: 0,
    error: "The file may not be greater than 100 kilobytes.",
  },
  { id: "4", file: file("ހުށަހެޅުން.docx", 56), status: "queued", progress: 0 },
  { id: "5", file: file("Minutes.pdf", 300), status: "cancelled", progress: 20 },
]

export default function UploadProgressDemo() {
  const queue = useUploadQueue({ upload: fakeUpload })
  return (
    <DemoPage>
      <DemoSection title="Every state" className="max-w-lg gap-4 grid">
        <UploadProgress items={states} onCancel={() => {}} onRetry={() => {}} onRemove={() => {}} />
      </DemoSection>
      <DemoSection title="With useUploadQueue" className="max-w-lg gap-4 grid">
        <div className="gap-2 flex flex-wrap">
          <Button variant="outline" onClick={() => queue.add([file("Lease agreement.pdf", 900)])}>
            Add a file
          </Button>
          <Button variant="outline" onClick={() => queue.add([file("will-fail.pdf", 50)])}>
            Add a failing file
          </Button>
          <Button variant="ghost" onClick={queue.clear}>
            Clear
          </Button>
        </div>
        <UploadProgress
          items={queue.items}
          onCancel={queue.cancel}
          onRetry={queue.retry}
          onRemove={queue.remove}
          announcement={queue.announcement}
        />
      </DemoSection>
    </DemoPage>
  )
}
