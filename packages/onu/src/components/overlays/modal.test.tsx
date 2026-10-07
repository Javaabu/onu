import * as React from "react"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Button } from "../../ui/button"
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalRoot,
  ModalTitle,
  ModalTrigger,
  modalContentVariants,
} from "./modal"

// Radix overlays + axe are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

function Basic(props: Partial<React.ComponentProps<typeof Modal>>) {
  return (
    <Modal
      trigger={<Button>Edit staff member</Button>}
      title="Edit staff member"
      description="Changes are visible to HR."
      footer={
        <ModalClose asChild>
          <Button>Save</Button>
        </ModalClose>
      }
      {...props}
    >
      <input aria-label="Full name" defaultValue="Aishath Ali" />
    </Modal>
  )
}

describe("Modal", () => {
  it("opens from the trigger with title, description, body and footer", async () => {
    renderWithOnu(<Basic />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Edit staff member" }))
    const dialog = screen.getByRole("dialog", { name: "Edit staff member" })
    expect(dialog).toHaveAccessibleDescription("Changes are visible to HR.")
    expect(dialog).toHaveAttribute("data-slot", "modal-content")
    expect(dialog).toHaveAttribute("data-size", "md")
    expect(dialog).toHaveAttribute("data-mobile", "sheet")
    expect(dialog.querySelector("[data-slot=modal-body]")).toContainElement(screen.getByLabelText("Full name"))
    expect(dialog.querySelector("[data-slot=modal-footer]")).toContainElement(
      screen.getByRole("button", { name: "Save" }),
    )
    await expectNoA11yViolations()
  })

  it("traps focus and returns it to the trigger on Escape (§25.10)", async () => {
    renderWithOnu(<Basic />)
    const trigger = screen.getByRole("button", { name: "Edit staff member" })
    await userEvent.click(trigger)
    const dialog = screen.getByRole("dialog")
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
    for (let i = 0; i < 5; i++) {
      await userEvent.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it("closes with the translated close button", async () => {
    const onOpenChange = vi.fn()
    renderWithOnu(<Basic onOpenChange={onOpenChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Edit staff member" }))
    await userEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("is controlled with open / onOpenChange", async () => {
    function Controlled() {
      const [open, setOpen] = React.useState(true)
      return (
        <>
          <span data-testid="state">{String(open)}</span>
          <Modal open={open} onOpenChange={setOpen} title="Controlled" closeButton={false}>
            <ModalClose asChild>
              <Button>Done</Button>
            </ModalClose>
          </Modal>
        </>
      )
    }
    renderWithOnu(<Controlled />)
    expect(screen.getByRole("dialog", { name: "Controlled" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Done" }))
    expect(screen.getByTestId("state")).toHaveTextContent("false")
  })

  it("supports defaultOpen, a hidden title and no description", () => {
    renderWithOnu(<Modal defaultOpen title="Hidden title" hideTitle />)
    const dialog = screen.getByRole("dialog", { name: "Hidden title" })
    expect(screen.getByText("Hidden title")).toHaveClass("sr-only")
    expect(dialog).not.toHaveAttribute("aria-describedby")
    expect(dialog.querySelector("[data-slot=modal-body]")).toBeNull()
  })

  it.each(["sm", "md", "lg", "xl", "full"] as const)("applies size %s", (size) => {
    renderWithOnu(<Modal defaultOpen title="Sized" size={size} />)
    expect(screen.getByRole("dialog")).toHaveAttribute("data-size", size)
  })

  it.each(["dialog", "sheet", "fullscreen"] as const)("applies the %s phone presentation", (mobile) => {
    renderWithOnu(<Modal defaultOpen title="Phone" mobile={mobile} />)
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveAttribute("data-mobile", mobile)
    expect(dialog.className).toContain(modalContentVariants({ mobile }).split(" ").at(-1))
  })

  it("accepts className and classNames for every part", () => {
    renderWithOnu(
      <Modal
        defaultOpen
        title="Styled"
        description="Desc"
        footer={<span>Footer</span>}
        className="content-x"
        classNames={{
          overlay: "overlay-x",
          header: "header-x",
          title: "title-x",
          description: "desc-x",
          body: "body-x",
          footer: "footer-x",
          close: "close-x",
        }}
      >
        Body
      </Modal>,
    )
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveClass("content-x")
    expect(document.querySelector(".overlay-x")).toBeInTheDocument()
    expect(dialog.querySelector("[data-slot=modal-header]")).toHaveClass("header-x")
    expect(screen.getByText("Styled")).toHaveClass("title-x")
    expect(screen.getByText("Desc")).toHaveClass("desc-x")
    expect(screen.getByText("Body")).toHaveClass("body-x")
    expect(screen.getByText("Footer").parentElement).toHaveClass("footer-x")
    expect(screen.getByRole("button", { name: "Close" })).toHaveClass("close-x")
  })

  it("forwards ref to the content element", () => {
    const ref = React.createRef<HTMLDivElement>()
    renderWithOnu(<Modal defaultOpen title="Ref" ref={ref} />)
    expect(ref.current).toBe(screen.getByRole("dialog"))
  })

  it("composes from parts", async () => {
    renderWithOnu(
      <ModalRoot>
        <ModalTrigger asChild>
          <Button>Transfer</Button>
        </ModalTrigger>
        <ModalContent size="sm" mobile="dialog">
          <ModalHeader closeButton={false}>
            <ModalTitle>Transfer MVR 1,250.00</ModalTitle>
            <ModalDescription>To Mohamed Naseem</ModalDescription>
          </ModalHeader>
          <ModalBody>Processed next working day.</ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button>Cancel</Button>
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </ModalRoot>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Transfer" }))
    expect(screen.getByRole("dialog", { name: "Transfer MVR 1,250.00" })).toHaveAttribute("data-size", "sm")
    await expectNoA11yViolations()
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<Modal defaultOpen title="މުވައްޒަފު" />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ބަންދުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
