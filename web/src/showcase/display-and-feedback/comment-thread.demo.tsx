import * as React from "react"
import { CommentThread, type CommentData, type CommentId } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { minutesAgo } from "./_data"

export const meta = {
  title: "Comment thread",
  group: "Display and feedback",
  order: 19,
  description:
    "Nested replies; edit and delete your own comments; the composer can type Thaana. Also flat internal notes.",
}

const me = { id: "me", name: "Aishath Shiuna" }

const initial: CommentData[] = [
  {
    id: 1,
    author: { id: "u2", name: "Ahmed Ali" },
    body: "Please attach the lease agreement before we can approve this.",
    createdAt: minutesAgo(180),
    replies: [
      {
        id: 2,
        author: me,
        body: "Uploaded it just now. Let me know if anything else is missing.",
        createdAt: minutesAgo(45),
        editedAt: minutesAgo(40),
      },
    ],
  },
  {
    id: 3,
    author: { id: "u3", name: "މަރިޔަމް ޒާހިރާ" },
    body: "ލިޔެކިޔުންތައް ފުރިހަމަ. ފާސްކުރެވިދާނެ.",
    createdAt: minutesAgo(10),
  },
]

let nextId = 100

function insert(list: CommentData[], parentId: CommentId | null, comment: CommentData): CommentData[] {
  if (parentId === null) return [...list, comment]
  return list.map((c) =>
    c.id === parentId
      ? { ...c, replies: [...(c.replies ?? []), comment] }
      : { ...c, replies: c.replies && insert(c.replies, parentId, comment) },
  )
}

function update(list: CommentData[], id: CommentId, fn: (c: CommentData) => CommentData | null): CommentData[] {
  return list.flatMap((c) => {
    if (c.id === id) {
      const next = fn(c)
      return next ? [next] : []
    }
    return [{ ...c, replies: c.replies && update(c.replies, id, fn) }]
  })
}

export default function CommentThreadDemo() {
  const [comments, setComments] = React.useState(initial)
  const [notes, setNotes] = React.useState<CommentData[]>([
    {
      id: 1,
      author: { id: "u2", name: "Ahmed Ali" },
      body: "Called the applicant; documents to follow by Thursday.",
      createdAt: minutesAgo(300),
    },
    { id: 2, author: me, body: "ލިޔެކިޔުންތައް ލިބިއްޖެ.", createdAt: minutesAgo(20) },
  ])
  const noteLabels = {
    title: "Notes",
    empty: "No notes yet",
    composer: "Add an internal note…",
    submit: "Add note",
    delete: "Delete note",
    deleteConfirm: "Delete this note?",
  }
  return (
    <DemoPage>
      <DemoSection title="Discussion" className="max-w-2xl block">
        <CommentThread
          comments={comments}
          currentUserId={me.id}
          thaana={{ defaultEnabled: false }}
          onAdd={async (body, parentId) => {
            await new Promise((r) => setTimeout(r, 400))
            setComments((list) => insert(list, parentId, { id: nextId++, author: me, body, createdAt: new Date() }))
          }}
          onEdit={(id, body) => setComments((list) => update(list, id, (c) => ({ ...c, body, editedAt: new Date() })))}
          onDelete={(id) => setComments((list) => update(list, id, () => null))}
        />
      </DemoSection>
      <DemoSection
        title="Notes"
        description="variant=list with replies off and the box on top. You can delete only your own notes."
        className="max-w-xl block"
      >
        <CommentThread
          variant="list"
          replies={false}
          composerPosition="top"
          labels={noteLabels}
          comments={notes}
          currentUserId={me.id}
          thaana={{ defaultEnabled: false }}
          onAdd={async (body) => {
            await new Promise((r) => setTimeout(r, 400))
            setNotes((n) => [{ id: Date.now(), author: me, body, createdAt: new Date() }, ...n])
          }}
          onDelete={(id) => setNotes((n) => n.filter((note) => note.id !== id))}
        />
      </DemoSection>
      <DemoSection title="Read-only notes, empty" className="max-w-xl block">
        <CommentThread variant="list" replies={false} labels={noteLabels} comments={[]} />
      </DemoSection>
    </DemoPage>
  )
}
