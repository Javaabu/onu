import { fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { TextInput } from "../inputs/text-input"
import { Fieldset, FormSection } from "./fieldset"
import { FormLayoutProvider } from "./form-context"
import { FormField } from "./form-field"
import { FormGroup } from "./form-group"
import { Label } from "./label"
import { FormContainer } from "./form-container"
import { revealField } from "./validation"

describe("Fieldset", () => {
  it("groups fields under a legend with a description", async () => {
    renderWithOnu(
      <Fieldset legend="Address" description="Where you live now.">
        <FormField label="Island">
          <TextInput />
        </FormField>
      </Fieldset>,
    )
    const group = screen.getByRole("group", { name: "Address" })
    expect(group).toHaveAccessibleDescription("Where you live now.")
    expect(screen.getByLabelText("Island")).toBeVisible()
    await expectNoA11yViolations()
  })

  it("collapses and expands with the legend button (keyboard too)", async () => {
    const onOpenChange = vi.fn()
    renderWithOnu(
      <Fieldset legend="Advanced" collapsible defaultOpen={false} onOpenChange={onOpenChange}>
        <FormField label="Notes">
          <TextInput />
        </FormField>
      </Fieldset>,
    )
    const trigger = screen.getByRole("button", { name: "Advanced" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByLabelText("Notes", { selector: "input" })).not.toBeVisible()
    trigger.focus()
    await userEvent.keyboard("{Enter}")
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByLabelText("Notes")).toBeVisible()
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    await userEvent.keyboard(" ")
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    await expectNoA11yViolations()
  })

  it("supports controlled open and opens for native invalid events and reveal requests", () => {
    const onOpenChange = vi.fn()
    const { rerender } = renderWithOnu(
      <Fieldset legend="Sec" collapsible open={false} onOpenChange={onOpenChange}>
        <input aria-label="x" required />
      </Fieldset>,
    )
    fireEvent.invalid(screen.getByLabelText("x"))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    revealField(screen.getByLabelText("x"))
    expect(onOpenChange).toHaveBeenCalledTimes(2)
    rerender(
      <Fieldset legend="Sec" collapsible open onOpenChange={onOpenChange}>
        <input aria-label="x" required />
      </Fieldset>,
    )
    revealField(screen.getByLabelText("x"))
    expect(onOpenChange).toHaveBeenCalledTimes(2)
  })

  it("disables fields natively and through context, and sets the label layout", () => {
    const { container } = renderWithOnu(
      <FormLayoutProvider disabled>
        <FormSection legend="Locked" labelLayout="inline" variant="card" hideLegend classNames={{ content: "cx" }}>
          <FormField label="A">
            <TextInput />
          </FormField>
        </FormSection>
      </FormLayoutProvider>,
    )
    expect(screen.getByRole("group")).toBeDisabled()
    expect(screen.getByLabelText("A")).toBeDisabled()
    expect(container.querySelector("[data-slot=form-field]")).toHaveAttribute("data-label-layout", "inline")
    expect(container.querySelector("legend")).toHaveClass("sr-only")
    expect(container.querySelector(".cx")).toBeInTheDocument()
  })

  it.each(directions)("renders in %s with Dhivehi", async (dir) => {
    renderWithOnu(
      <Fieldset legend="އެޑްރެސް" collapsible>
        <FormField label="ރަށް">
          <TextInput />
        </FormField>
      </Fieldset>,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("button", { name: "އެޑްރެސް" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("FormGroup", () => {
  it("lays fields out in responsive columns and sets their layout", () => {
    const { container } = renderWithOnu(
      <FormGroup columns={2} labelLayout="inline" disabled className="root" classNames={{ grid: "grid-x" }}>
        <FormField label="First">
          <TextInput />
        </FormField>
      </FormGroup>,
    )
    const root = container.querySelector("[data-slot=form-group]")!
    expect(root).toHaveClass("root", "@container/form-group")
    expect(root.firstElementChild).toHaveClass("@xl/form-group:grid-cols-2", "grid-x")
    expect(screen.getByLabelText("First")).toBeDisabled()
    expect(container.querySelector("[data-slot=form-field]")).toHaveAttribute("data-label-layout", "inline")
  })

  it.each([1, 3, 4] as const)("supports %s columns", (columns) => {
    const { container } = renderWithOnu(<FormGroup columns={columns} />)
    expect(container.querySelector("[data-slot=form-group]")).toHaveAttribute("data-columns", String(columns))
  })
})

describe("Label", () => {
  it("adds required and optional markers", async () => {
    renderWithOnu(
      <>
        <Label htmlFor="a" required>
          Name
        </Label>
        <input id="a" />
        <Label htmlFor="b" optional invalid>
          Nickname
        </Label>
        <input id="b" />
      </>,
    )
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByText("(optional)")).toBeInTheDocument()
    expect(screen.getByText("Nickname")).toHaveAttribute("data-invalid", "true")
    await expectNoA11yViolations()
  })

  it("translates the optional marker", () => {
    renderWithOnu(<Label optional>ނަން</Label>, { locale: "dv" })
    expect(screen.getByText("(އިޚްތިޔާރީ)")).toBeInTheDocument()
  })
})

describe("FormContainer", () => {
  it("renders a titled section with header actions, content and footer", async () => {
    const { container } = renderWithOnu(
      <FormContainer
        title="New user"
        description="Invite a staff member."
        actions={<span>Draft</span>}
        footer={<button type="button">Save</button>}
        media={<span>logo</span>}
        classNames={{ footer: "foot" }}
        className="root"
      >
        <p>Body</p>
      </FormContainer>,
    )
    const region = screen.getByRole("region", { name: "New user" })
    expect(region).toHaveClass("root")
    expect(screen.getByRole("heading", { level: 2, name: "New user" })).toBeInTheDocument()
    expect(screen.getByText("Draft")).toBeInTheDocument()
    expect(container.querySelector(".foot")).toContainElement(screen.getByRole("button"))
    await expectNoA11yViolations()
  })

  it("supports plain variant, widths, heading levels and centring", () => {
    const { container } = renderWithOnu(
      <FormContainer variant="plain" width="full" headingLevel={1} title="Sign in" centered footer="f">
        x
      </FormContainer>,
    )
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
    expect(container.firstElementChild).toHaveAttribute("data-variant", "plain")
    expect(container.firstElementChild).toHaveClass("max-w-none")
  })

  it("renders without a header", () => {
    const { container } = renderWithOnu(<FormContainer>Only body</FormContainer>)
    expect(container.querySelector("header")).toBeNull()
  })
})
