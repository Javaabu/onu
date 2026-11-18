var e=`import * as React from "react"
import { InlineEdit } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Inline edit",
  group: "Form scaffolding",
  order: 11,
  description: "Click or press Enter to edit; Enter saves, Escape cancels; async saves with errors.",
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function InlineEditDemo() {
  const [title, setTitle] = React.useState("Annual fisheries report 2026")
  return (
    <DemoPage>
      <DemoSection title="Basic" className="max-w-xl gap-4 grid">
        <dl className="gap-x-6 gap-y-3 text-sm grid grid-cols-[auto_1fr] items-center">
          <dt className="text-muted-foreground">Title</dt>
          <dd>
            <InlineEdit label="Title" value={title} onSave={setTitle} />
          </dd>
          <dt className="text-muted-foreground">Island</dt>
          <dd>
            <InlineEdit label="Island" defaultValue="Thinadhoo" onSave={() => wait(800)} />
          </dd>
          <dt className="text-muted-foreground">Phone</dt>
          <dd>
            <InlineEdit
              label="Phone"
              defaultValue="7771234"
              inputProps={{ inputMode: "tel", dir: "ltr" }}
              validate={(v) => (/^\\d{7}$/.test(v) ? null : "Enter a 7 digit number.")}
            />
          </dd>
          <dt className="text-muted-foreground">Nickname</dt>
          <dd>
            <InlineEdit label="Nickname" placeholder="Add a nickname" />
          </dd>
        </dl>
      </DemoSection>

      <DemoSection title="Async save that fails" description="Every save fails here." className="max-w-xl grid">
        <InlineEdit
          label="Registration number"
          defaultValue="C-0412/2026"
          onSave={async () => {
            await wait(800)
            throw new Error("This registration number is already in use.")
          }}
        />
      </DemoSection>

      <DemoSection title="Thaana and multiline" className="max-w-xl gap-4 grid">
        <InlineEdit label="ނަން" defaultValue="ޙަސަން ރަޝީދު" thaana onSave={() => wait(500)} />
        <InlineEdit
          label="Notes"
          multiline
          defaultValue="Inspection done on 12 March. Follow up in two weeks."
          onSave={() => wait(500)}
        />
      </DemoSection>

      <DemoSection title="Disabled" className="max-w-xl grid">
        <InlineEdit label="Created by" defaultValue="System" disabled />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};