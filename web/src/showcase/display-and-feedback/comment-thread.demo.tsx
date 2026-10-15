import * as React from "react"
import { CommentThread, type CommentData, type CommentId } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { minutesAgo } from "./_data"

export const meta = {
  title: "Comment thread",
  group: "Display and feedback",
  order: 19,
  description: "Nested replies; edit and delete your own comments; the composer can type Thaana.",
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
    </DemoPage>
  )
}
