import * as React from "react"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { CommentThread, Notes, type CommentData, type NoteData } from "./comment-thread"

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

  it("renders a flat, bordered list with variant=list and replies off", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    const { container } = renderWithOnu(
      <CommentThread
        comments={comments.slice(0, 1).map((c) => ({ ...c, replies: undefined }))}
        variant="list"
        replies={false}
        composerPosition="top"
        onAdd={onAdd}
        now={NOW}
        classNames={{ comment: "item-x" }}
      />,
    )
    expect(screen.queryByRole("article")).toBeNull()
    expect(screen.queryByRole("button", { name: /^Reply/ })).toBeNull()
    expect(container.querySelector("ul")).toHaveClass("divide-y", "border")
    const item = container.querySelector("[data-slot=comment]")!
    expect(item).toHaveClass("item-x", "p-3")
    // The composer comes before the list.
    const composer = container.querySelector("[data-slot=composer]")!
    expect(composer.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    await user.type(screen.getByRole("textbox"), "Hi{Control>}{Enter}{/Control}")
    expect(onAdd).toHaveBeenCalledWith("Hi", null)
  })

  it("takes custom labels", () => {
    renderWithOnu(
      <CommentThread
        comments={[]}
        onAdd={() => {}}
        labels={{ title: "Remarks", empty: "No remarks", composer: "Add a remark", submit: "Send" }}
      />,
    )
    expect(screen.getByRole("heading", { name: "Remarks" })).toBeInTheDocument()
    expect(screen.getByText("No remarks")).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Add a remark" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument()
  })

  it.each(directions)("list variant is accessible in %s (dv)", async (dir) => {
    const { container } = renderWithOnu(
      <CommentThread
        comments={comments.slice(0, 1)}
        variant="list"
        replies={false}
        onAdd={() => {}}
        onDelete={() => {}}
        currentUserId="u1"
        now={NOW}
      />,
      { dir, locale: "dv" },
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
    const { container } = renderWithOnu(<Notes notes={notes} now={NOW} classNames={{ note: "note-x" }} />)
    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Notes" })).toHaveAttribute("data-slot", "notes")
    expect(container.querySelectorAll("[data-slot=note]")).toHaveLength(2)
    expect(container.querySelector("[data-slot=note]")).toHaveClass("note-x")
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
