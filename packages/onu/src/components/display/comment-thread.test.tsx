import * as React from "react"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { CommentThread, type CommentData } from "./comment-thread"
import { Notes, type NoteData } from "./notes"

const NOW = new Date("2026-03-12T10:00:00Z")
const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const comments: CommentData[] = [
  {
    id: 1,
    author: { id: "u1", name: "Aishath Shiuna" },
    body: "Please attach the lease agreement.",
    createdAt: ago(60),
    replies: [
      {
        id: 2,
        author: { id: "u2", name: "Ahmed Ali" },
        body: "Uploaded now.",
        createdAt: ago(30),
        editedAt: ago(20),
        replies: [
          {
            id: 3,
            author: { id: "u1", name: "Aishath Shiuna" },
            body: "Thanks!",
            createdAt: ago(10),
            replies: [{ id: 4, author: { id: "u2", name: "Ahmed Ali" }, body: "👍", createdAt: ago(5) }],
          },
        ],
      },
    ],
  },
]

describe("CommentThread", () => {
  it("renders nested replies with authors, times and edited marks", () => {
    const { container } = renderWithOnu(<CommentThread comments={comments} now={NOW} />)
    expect(screen.getByRole("heading", { name: "Comments" })).toBeInTheDocument()
    expect(screen.getAllByRole("article")).toHaveLength(4)
    expect(screen.getByText("(edited)")).toBeInTheDocument()
    expect(screen.getByText("1 hour ago")).toBeInTheDocument()
    const lists = container.querySelectorAll("ul")
    expect(lists[1]).toHaveClass("border-s")
    // Past maxDepth (3) replies stop indenting.
    expect(lists[3]).not.toHaveClass("border-s")
  })

  it("posts a new comment and clears the composer", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(undefined)
    renderWithOnu(<CommentThread comments={[]} onAdd={onAdd} />)
    expect(screen.getByText("No comments yet")).toBeInTheDocument()
    const box = screen.getByRole("textbox", { name: "Write a comment…" })
    const submit = screen.getByRole("button", { name: "Comment" })
    expect(submit).toBeDisabled()
    await user.type(box, "  Looks good  ")
    await user.click(submit)
    expect(onAdd).toHaveBeenCalledWith("Looks good", null)
    await waitFor(() => expect(box).toHaveValue(""))
  })

  it("submits with Ctrl+Enter", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    renderWithOnu(<CommentThread comments={[]} onAdd={onAdd} />)
    await user.type(screen.getByRole("textbox"), "Hi{Control>}{Enter}{/Control}")
    expect(onAdd).toHaveBeenCalledWith("Hi", null)
  })

  it("replies to a comment; Escape cancels and returns focus", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    renderWithOnu(<CommentThread comments={comments.slice(0, 1)} onAdd={onAdd} now={NOW} currentUserId="u9" />)
    const replyButtons = screen.getAllByRole("button", { name: /^Reply/ })
    await user.click(replyButtons[0]!)
    const box = screen.getByRole("textbox", { name: "Reply to Aishath Shiuna" })
    await waitFor(() => expect(box).toHaveFocus())
    await user.keyboard("{Escape}")
    await waitFor(() => expect(replyButtons[0]).toHaveFocus())
    await user.click(replyButtons[0]!)
    await user.type(screen.getByRole("textbox", { name: "Reply to Aishath Shiuna" }), "On it")
    await user.click(screen.getByRole("button", { name: "Reply" }))
    expect(onAdd).toHaveBeenCalledWith("On it", 1)
  })

  it("lets you edit and delete only your own comments", async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    renderWithOnu(
      <CommentThread comments={comments} currentUserId="u2" onEdit={onEdit} onDelete={onDelete} now={NOW} />,
    )
    expect(screen.getAllByRole("button", { name: "Edit comment" })).toHaveLength(2)
    const mine = screen.getAllByRole("article", { name: "Ahmed Ali" })[0]!
    await user.click(within(mine).getAllByRole("button", { name: "Edit comment" })[0]!)
    const box = screen.getByRole("textbox", { name: "Edit comment" })
    expect(box).toHaveValue("Uploaded now.")
    await user.clear(box)
    await user.type(box, "Uploaded the lease.")
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(onEdit).toHaveBeenCalledWith(2, "Uploaded the lease.")

    const deleteButton = within(mine).getAllByRole("button", { name: "Delete comment" })[0]!
    await user.click(deleteButton)
    const dialog = await screen.findByRole("alertdialog", { name: "Delete this comment?" })
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(deleteButton).toHaveFocus())
    await user.click(deleteButton)
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Delete" }))
    expect(onDelete).toHaveBeenCalledWith(2)
  })

  it("accepts custom permissions and hides the title", () => {
    renderWithOnu(
      <CommentThread
        comments={comments.slice(0, 1)}
        title={null}
        onEdit={() => {}}
        onDelete={() => {}}
        canEdit={() => true}
        canDelete={() => false}
      />,
    )
    expect(screen.getByRole("region", { name: "Comments" })).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "Edit comment" }).length).toBeGreaterThan(0)
    expect(screen.queryByRole("button", { name: "Delete comment" })).toBeNull()
  })

  it("composer types Thaana with the thaana prop", () => {
    renderWithOnu(<CommentThread comments={[]} onAdd={() => {}} thaana />, { locale: "dv" })
    const box = screen.getByRole("textbox", { name: "ކޮމެންޓެއް ލިޔުއްވާ…" })
    expect(box).toHaveAttribute("lang", "dv")
    expect(box).toHaveAttribute("dir", "rtl")
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(
      <CommentThread comments={comments} onAdd={() => {}} onDelete={() => {}} currentUserId="u1" now={NOW} />,
      { dir },
    )
    await expectNoA11yViolations(container)
  })
})

const notes: NoteData[] = [
  { id: 1, author: { id: "u1", name: "Aishath Shiuna" }, body: "Called the applicant.", createdAt: ago(90) },
  { id: 2, author: { id: "u2", name: "Ahmed Ali" }, body: "Waiting for documents.", createdAt: ago(3) },
]

describe("Notes", () => {
  it("lists notes with author and time", () => {
    renderWithOnu(<Notes notes={notes} now={NOW} />)
    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument()
    expect(screen.getByText("Called the applicant.")).toBeInTheDocument()
    expect(screen.getByText("3 minutes ago")).toBeInTheDocument()
  })

  it("adds a note", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    renderWithOnu(<Notes notes={[]} onAdd={onAdd} composerPosition="bottom" />)
    expect(screen.getByText("No notes yet")).toBeInTheDocument()
    await user.type(screen.getByRole("textbox", { name: "Add an internal note…" }), "Checked")
    await user.click(screen.getByRole("button", { name: "Add note" }))
    expect(onAdd).toHaveBeenCalledWith("Checked")
  })

  it("deletes after confirmation, only for allowed notes", async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const { rerender } = renderWithOnu(<Notes notes={notes} onDelete={onDelete} currentUserId="u2" now={NOW} />)
    const buttons = screen.getAllByRole("button", { name: "Delete note" })
    expect(buttons).toHaveLength(1)
    await user.click(buttons[0]!)
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Delete" }))
    expect(onDelete).toHaveBeenCalledWith(2)
    rerender(<Notes notes={notes} onDelete={onDelete} canDelete={() => true} title={null} now={NOW} />)
    expect(screen.getAllByRole("button", { name: "Delete note" })).toHaveLength(2)
    rerender(<Notes notes={notes} onDelete={onDelete} now={NOW} />)
    expect(screen.getAllByRole("button", { name: "Delete note" })).toHaveLength(2)
  })

  it("supports Thaana in the note box", () => {
    renderWithOnu(<Notes notes={[]} onAdd={() => {}} thaana />)
    expect(screen.getByRole("textbox")).toHaveAttribute("lang", "dv")
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(<Notes notes={notes} onAdd={() => {}} onDelete={() => {}} now={NOW} />, {
      dir,
      locale: "dv",
    })
    await expectNoA11yViolations(container)
  })
})
