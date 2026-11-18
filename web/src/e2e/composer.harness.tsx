import * as React from "react"
import { CommentThread, type CommentData } from "@javaabu/onu"

// 6.6: focus after posting from the top-level composer.
export default function ComposerHarness() {
  const [comments, setComments] = React.useState<CommentData[]>([])
  return (
    <CommentThread
      comments={comments}
      currentUserId="me"
      onAdd={async (body) => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setComments((c) => [
          ...c,
          { id: String(c.length + 1), author: { id: "me", name: "Aishath" }, body, createdAt: new Date() },
        ])
      }}
    />
  )
}
