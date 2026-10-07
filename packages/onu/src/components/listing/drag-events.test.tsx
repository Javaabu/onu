import * as React from "react"
import { act, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Accessibility } from "@dnd-kit/dom"

import { renderWithOnu } from "../../../test/utils"
import { KanbanBoard } from "./kanban-board"
import { ReorderableTable } from "./reorderable-table"
import { SortableList } from "./sortable-list"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

// Drags can't be simulated in jsdom, so the provider is replaced by one that
// exposes its props, and `move` returns whatever the fake event asks for.
type Handlers = Record<string, ((event: unknown) => void) | undefined> & {
  plugins?: (defaults: unknown[]) => unknown[]
}
let provider: Handlers = {}

vi.mock("@dnd-kit/react", () => ({
  DragDropProvider: (props: Handlers & { children: React.ReactNode }) => {
    provider = props
    return <>{props.children}</>
  },
  useDroppable: () => ({ ref: () => {}, isDropTarget: false }),
}))
vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: () => ({ ref: () => {}, handleRef: () => {}, isDragging: false }),
}))
vi.mock("@dnd-kit/helpers", () => ({
  move: (_items: unknown, event: { next: unknown }) => event.next,
  arrayMove: <T,>(array: T[], from: number, to: number) => {
    const next = [...array]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item as T)
    return next
  },
}))
const configure = vi.fn((options: unknown) => ({ configured: options }))
vi.mock("@dnd-kit/dom", () => ({ Accessibility: { configure: (o: unknown) => configure(o) } }))

const items = [
  { id: "a", title: "Renew licence" },
  { id: "b", title: "Inspect vessel" },
]
const end = (sourceId: string, next: unknown, canceled = false) => ({
  operation: { source: { id: sourceId } },
  canceled,
  next,
})

beforeEach(() => {
  provider = {}
  configure.mockClear()
})

describe("drag events", () => {
  it("SortableList commits the dropped order and ignores cancelled drops", () => {
    const onReorder = vi.fn()
    renderWithOnu(
      <SortableList items={items} getName={(i) => i.title} onReorder={onReorder} renderItem={(i) => i.title} />,
    )
    act(() => provider.onDragEnd?.(end("a", ["a", "b"], true)))
    act(() => provider.onDragEnd?.({ operation: {}, canceled: false }))
    act(() => provider.onDragEnd?.(end("a", ["a", "b"])))
    expect(onReorder).not.toHaveBeenCalled()
    act(() => provider.onDragEnd?.(end("a", ["b", "a"])))
    expect(onReorder).toHaveBeenCalledWith([items[1], items[0]], { id: "a", from: 0, to: 1 })
  })

  it("ReorderableTable commits the dropped order", () => {
    const onReorder = vi.fn()
    renderWithOnu(
      <ReorderableTable
        rows={items}
        getName={(i) => i.title}
        onReorder={onReorder}
        columns={[{ id: "t", header: "T", cell: (i) => i.title }]}
      />,
    )
    act(() => provider.onDragEnd?.(end("b", ["b", "a"])))
    expect(onReorder).toHaveBeenCalledWith([items[1], items[0]], { id: "b", from: 1, to: 0 })
    act(() => provider.onDragEnd?.(end("b", ["a", "b"], true)))
    act(() => provider.onDragEnd?.({ operation: {}, canceled: false }))
    expect(onReorder).toHaveBeenCalledTimes(1)
  })

  it("KanbanBoard follows the pointer while dragging and commits on drop", () => {
    const onItemsChange = vi.fn()
    renderWithOnu(
      <KanbanBoard
        columns={[
          { id: "todo", title: "To do" },
          { id: "done", title: "Done" },
        ]}
        items={{ todo: items }}
        getName={(i) => i.title}
        onItemsChange={onItemsChange}
        renderCard={(i) => i.title}
      />,
    )
    act(() => provider.onDragStart?.({}))
    act(() => provider.onDragOver?.({ next: { todo: ["b"], done: ["a"] } }))
    expect(screen.getByRole("region", { name: "Done" })).toHaveTextContent("Renew licence")
    act(() => provider.onDragEnd?.(end("a", null)))
    expect(onItemsChange).toHaveBeenCalledWith(
      { todo: [items[1]], done: [items[0]] },
      { id: "a", from: "todo", to: "done", index: 0 },
    )

    // A cancelled drag puts everything back.
    act(() => provider.onDragStart?.({}))
    act(() => provider.onDragOver?.({ next: { todo: [], done: ["a", "b"] } }))
    act(() => provider.onDragEnd?.(end("b", null, true)))
    expect(screen.getByRole("region", { name: "To do" })).toHaveTextContent("Renew licence")
    expect(onItemsChange).toHaveBeenCalledTimes(1)

    // Dropping where it started changes nothing; unknown items are ignored.
    act(() => provider.onDragEnd?.(end("a", null)))
    act(() => provider.onDragEnd?.(end("zzz", null)))
    act(() => provider.onDragEnd?.({ operation: {}, canceled: false }))
    expect(onItemsChange).toHaveBeenCalledTimes(1)
  })

  it("announces drags in the active locale with item names", () => {
    renderWithOnu(
      <SortableList items={items} getName={(i) => i.title} onReorder={vi.fn()} renderItem={(i) => i.title} />,
    )
    const other = { name: "Other" }
    const plugins = provider.plugins?.([other, Accessibility])
    expect(plugins?.[0]).toBe(other)
    expect(plugins?.[1]).toHaveProperty("configured")
    const options = configure.mock.calls[0]?.[0] as {
      screenReaderInstructions: { draggable: string }
      announcements: Record<string, (e: unknown) => string | undefined>
    }
    expect(options.screenReaderInstructions.draggable).toMatch(/press Space or Enter/)
    const a = options.announcements
    expect(a.dragstart?.({ operation: { source: { id: "a" } } })).toBe("Picked up Renew licence.")
    expect(a.dragstart?.({ operation: {} })).toBeUndefined()
    expect(a.dragover?.({ operation: { source: { id: "a" }, target: { id: "b" } } })).toBe(
      "Renew licence is over Inspect vessel.",
    )
    expect(a.dragover?.({ operation: { source: { id: "a" }, target: { id: "a" } } })).toBeUndefined()
    expect(a.dragend?.({ operation: { source: { id: "a" } }, canceled: false })).toBe("Renew licence dropped.")
    expect(a.dragend?.({ operation: { source: { id: "zz" } }, canceled: true })).toBe(
      "Moving cancelled. zz was put back.",
    )
    expect(a.dragend?.({ operation: {}, canceled: false })).toBeUndefined()
  })

  it("names columns as drop targets on the board", () => {
    renderWithOnu(
      <KanbanBoard
        columns={[{ id: "todo", title: "To do" }]}
        items={{ todo: items }}
        getName={(i) => i.title}
        onItemsChange={vi.fn()}
        renderCard={(i) => i.title}
      />,
    )
    const options = configure.mock.calls[0]?.[0] as {
      announcements: Record<string, (e: unknown) => string | undefined>
    }
    expect(options.announcements.dragover?.({ operation: { source: { id: "a" }, target: { id: "todo" } } })).toBe(
      "Renew licence is over To do.",
    )
    expect(options.announcements.dragover?.({ operation: { source: { id: "a" }, target: { id: "x" } } })).toBe(
      "Renew licence is over x.",
    )
  })
})
