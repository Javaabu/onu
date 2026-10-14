import * as React from "react"
import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { TextInput } from "../inputs/text-input"
import { FormField } from "./form-field"
import { HelpText } from "./help-text"

describe("HelpText", () => {
  it("renders a muted paragraph with its slot", () => {
    renderWithOnu(<HelpText>As shown on your ID card.</HelpText>)
    const help = screen.getByText("As shown on your ID card.")
    expect(help.tagName).toBe("P")
    expect(help).toHaveAttribute("data-slot", "help-text")
    expect(help).toHaveClass("text-sm", "text-muted-foreground")
  })

  it("merges classes and passes paragraph props through", () => {
    const ref = React.createRef<HTMLParagraphElement>()
    renderWithOnu(
      <HelpText ref={ref} id="name-help" className="mt-4 text-foreground" lang="dv">
        ނަން
      </HelpText>,
    )
    const help = screen.getByText("ނަން")
    expect(ref.current).toBe(help)
    expect(help).toHaveAttribute("id", "name-help")
    expect(help).toHaveAttribute("lang", "dv")
    expect(help).toHaveClass("mt-4", "text-foreground")
    // tailwind-merge drops the default colour in favour of the override
    expect(help).not.toHaveClass("text-muted-foreground")
  })

  it("describes a control it is linked to with aria-describedby", async () => {
    renderWithOnu(
      <>
        <label htmlFor="name">Name</label>
        <input id="name" aria-describedby="name-help" />
        <HelpText id="name-help">As shown on your ID card.</HelpText>
      </>,
    )
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveAccessibleDescription("As shown on your ID card.")
    await expectNoA11yViolations()
  })

  it.each(directions)("is the help text FormField renders and links (%s)", async (dir) => {
    renderWithOnu(
      <FormField label="Name" help="As shown on your ID card.">
        <TextInput />
      </FormField>,
      { dir },
    )
    const help = screen.getByText("As shown on your ID card.")
    expect(help).toHaveAttribute("data-slot", "help-text")
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveAccessibleDescription("As shown on your ID card.")
    await expectNoA11yViolations()
  })
})
