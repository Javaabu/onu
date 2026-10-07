import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Wizard, useWizard, type WizardStep } from "./wizard"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

function steps(validate?: () => boolean | Promise<boolean>): WizardStep[] {
  return [
    { id: "applicant", title: "Applicant", description: "Who is applying", content: <p>Applicant form</p>, validate },
    { id: "documents", title: "Documents", optional: true, content: <p>Upload files</p> },
    { id: "review", title: "Review", content: <p>Check and submit</p> },
  ]
}

function stepList() {
  return screen.getByRole("navigation", { name: "Steps" })
}

describe("Wizard", () => {
  it("shows the step list with status and the current step", async () => {
    renderWithOnu(<Wizard steps={steps()} className="extra" />)
    const items = within(stepList()).getAllByRole("listitem")
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveAttribute("aria-current", "step")
    expect(items[0]).toHaveTextContent("Current step")
    expect(items[1]).toHaveTextContent("Optional")
    expect(items[2]).toHaveTextContent("Not started")
    expect(screen.getByRole("region", { name: "Applicant" })).toHaveTextContent("Applicant form")
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled()
    expect(document.querySelector("[data-slot=wizard]")).toHaveClass("extra")
    await expectNoA11yViolations()
  })

  it("moves next and back, announces the step and focuses its heading", async () => {
    const onStepChange = vi.fn()
    renderWithOnu(<Wizard steps={steps()} onStepChange={onStepChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(onStepChange).toHaveBeenCalledWith(1)
    expect(screen.getByRole("heading", { name: "Documents" })).toHaveFocus()
    expect(screen.getByRole("status")).toHaveTextContent("Step 2 of 3: Documents")
    expect(within(stepList()).getAllByRole("listitem")[0]).toHaveTextContent("Completed")
    await userEvent.click(screen.getByRole("button", { name: "Back" }))
    expect(screen.getByRole("heading", { name: "Applicant" })).toHaveFocus()
  })

  it("blocks Next when per-step validation fails and marks the step", async () => {
    let valid = false
    const validate = vi.fn(async () => valid)
    renderWithOnu(<Wizard steps={steps(validate)} />)
    await userEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(validate).toHaveBeenCalled()
    expect(screen.getByRole("heading", { name: "Applicant" })).toBeInTheDocument()
    expect(within(stepList()).getAllByRole("listitem")[0]).toHaveTextContent("Has errors")
    valid = true
    await userEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(await screen.findByRole("heading", { name: "Documents" })).toBeInTheDocument()
  })

  it("runs the onValidateStep hook and finishes on the last step", async () => {
    const onValidateStep = vi.fn(() => true)
    const onComplete = vi.fn()
    renderWithOnu(
      <Wizard steps={steps()} onValidateStep={onValidateStep} onComplete={onComplete} finishLabel="Submit" />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Next" }))
    await userEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(onValidateStep).toHaveBeenCalledWith(1, expect.objectContaining({ id: "documents" }))
    await userEvent.click(screen.getByRole("button", { name: "Submit" }))
    expect(onComplete).toHaveBeenCalled()
  })

  it("jumps back to completed steps only (linear)", async () => {
    renderWithOnu(<Wizard steps={steps()} />)
    expect(within(stepList()).queryByRole("button")).toBeNull()
    await userEvent.click(screen.getByRole("button", { name: "Next" }))
    await userEvent.click(screen.getByRole("button", { name: "Next" }))
    const jump = within(stepList()).getByRole("button", { name: /Applicant/ })
    await userEvent.click(jump)
    expect(screen.getByRole("heading", { name: "Applicant" })).toHaveFocus()
    // The furthest unlocked step stays reachable.
    expect(within(stepList()).getByRole("button", { name: /Review/ })).toBeInTheDocument()
  })

  it("allows any step when not linear, is controllable and shows server errors", async () => {
    const onStepChange = vi.fn()
    const { rerender } = renderWithOnu(
      <Wizard steps={steps()} linear={false} step={0} onStepChange={onStepChange} errorSteps={["review"]} />,
    )
    expect(within(stepList()).getAllByRole("listitem")[2]).toHaveTextContent("Has errors")
    await userEvent.click(within(stepList()).getByRole("button", { name: /Review/ }))
    expect(onStepChange).toHaveBeenCalledWith(2)
    expect(screen.getByRole("heading", { name: "Applicant" })).toBeInTheDocument()
    rerender(<Wizard steps={steps()} linear={false} step={2} onStepChange={onStepChange} orientation="vertical" />)
    expect(screen.getByRole("heading", { name: "Review" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Finish" })).toBeInTheDocument()
  })

  it("exposes useWizard for custom footers", async () => {
    function Footer() {
      const w = useWizard()
      return (
        <button type="button" onClick={() => void w.next()}>
          Custom next {w.index + 1}/{w.total} {w.statusOf(0)}
        </button>
      )
    }
    renderWithOnu(
      <Wizard steps={steps()} hideFooter footerExtra="x">
        <Footer />
      </Wizard>,
    )
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull()
    await userEvent.click(screen.getByRole("button", { name: /Custom next 1\/3 current/ }))
    await waitFor(() => expect(screen.getByRole("button", { name: /Custom next 2\/3 complete/ })).toBeInTheDocument())
    expect(() => renderWithOnu(<Footer />)).toThrow(/inside <Wizard>/)
  })

  it("shows a spinner and blocks double clicks while validating", async () => {
    let resolve: (v: boolean) => void = () => {}
    const validate = vi.fn(() => new Promise<boolean>((r) => (resolve = r)))
    renderWithOnu(<Wizard steps={steps(validate)} />)
    await userEvent.click(screen.getByRole("button", { name: "Next" }))
    const next = screen.getByRole("button", { name: "Next" })
    expect(next).toBeDisabled()
    expect(next).toHaveAttribute("aria-busy", "true")
    resolve(true)
    expect(await screen.findByRole("heading", { name: "Documents" })).toBeInTheDocument()
    expect(validate).toHaveBeenCalledTimes(1)
  })

  it.each(directions)("translates in %s", async (dir) => {
    renderWithOnu(
      <Wizard
        steps={[
          { id: "a", title: "މަޢުލޫމާތު", content: "a" },
          { id: "b", title: "ތަކެތި", content: "b" },
        ]}
      />,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("navigation", { name: "ފިޔަވަޅުތައް" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "ކުރިއަށް" }))
    expect(screen.getByRole("status")).toHaveTextContent("2 ފިޔަވަޅުގެ ތެރެއިން 2 ވަނަ ފިޔަވަޅު: ތަކެތި")
    await expectNoA11yViolations()
  })
})
