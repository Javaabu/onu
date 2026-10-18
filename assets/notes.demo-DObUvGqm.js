var e=`import * as React from "react"
import { Notes, type NoteData } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { minutesAgo } from "./_data"

export const meta = {
  title: "Notes",
  group: "Display and feedback",
  order: 20,
  description: "Internal notes on a record, with a Thaana-capable note box.",
}

const me = { id: "me", name: "Aishath Shiuna" }

export default function NotesDemo() {
  const [notes, setNotes] = React.useState<NoteData[]>([
    {
      id: 1,
      author: { id: "u2", name: "Ahmed Ali" },
      body: "Called the applicant; documents to follow by Thursday.",
      createdAt: minutesAgo(300),
    },
    { id: 2, author: me, body: "ލިޔެކިޔުންތައް ލިބިއްޖެ.", createdAt: minutesAgo(20) },
  ])
  return (
    <DemoPage>
      <DemoSection title="Notes" description="You can delete only your own notes." className="max-w-xl block">
        <Notes
          notes={notes}
          currentUserId={me.id}
          thaana={{ defaultEnabled: false }}
          onAdd={async (body) => {
            await new Promise((r) => setTimeout(r, 400))
            setNotes((n) => [{ id: Date.now(), author: me, body, createdAt: new Date() }, ...n])
          }}
          onDelete={(id) => setNotes((n) => n.filter((note) => note.id !== id))}
        />
      </DemoSection>
      <DemoSection title="Read-only, empty" className="max-w-xl block">
        <Notes notes={[]} />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};