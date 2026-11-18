import * as React from "react"
import { Modal } from "@javaabu/onu"
import { BlockEditor } from "@javaabu/onu/editor"

// 6.7: the block editor's slash menu inside a modal dialog.
export default function SlashMenuModalHarness() {
  const [open, setOpen] = React.useState(true)
  return (
    <Modal open={open} onOpenChange={setOpen} title="Edit page">
      <BlockEditor aria-label="Page content" />
    </Modal>
  )
}
