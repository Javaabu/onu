import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm } from "react-hook-form"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ConditionalDisplay, matchesCondition, resolveConditional } from "./conditional-display"
import { ConditionalLink } from "./conditional-link"

describe("matchesCondition", () => {
  it.each([
    ["company", "company", true],
    ["person", "company", false],
    [1, "1", true],
    ["2", [1, 2, 3], true],
    [["a", "b"], "b", true],
    [["a"], ["x", "y"], false],
    ["x", undefined, true],
    ["", undefined, false],
    ["0", undefined, false],
    [[], undefined, false],
    [false, undefined, false],
    [true, true, true],
  ] as const)("%j with %j → %s", (value, when, expected) => {
    expect(matchesCondition(value, when as never)).toBe(expected)
  })

  it("accepts a predicate", () => {
    expect(matchesCondition(5, (v) => Number(v) > 3)).toBe(true)
  })

  it("resolves actions", () => {
    expect(resolveConditional("show", false)).toEqual({ visible: false, enabled: false })
    expect(resolveConditional("hide", true)).toEqual({ visible: false, enabled: false })
    expect(resolveConditional("enable", false)).toEqual({ visible: true, enabled: false })
    expect(resolveConditional("disable", true)).toEqual({ visible: true, enabled: false })
  })
})

function Explicit({ action }: { action?: "show" | "hide" | "enable" | "disable" }) {
  const [type, setType] = React.useState("person")
  return (
    <form aria-label="Applicant">
      <label>
        Type
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="person">Person</option>
          <option value="company">Company</option>
        </select>
      </label>
      <ConditionalDisplay value={type} when="company" action={action}>
        <label>
          Company name
          <input name="company_name" />
        </label>
      </ConditionalDisplay>
    </form>
  )
}

describe("ConditionalDisplay", () => {
  it("shows children only when the value matches, and disables them while hidden", async () => {
    const user = userEvent.setup()
    const { container } = renderWithOnu(<Explicit />)
    const input = container.querySelector("input[name=company_name]") as HTMLInputElement
    const fieldset = container.querySelector("fieldset")!
    expect(fieldset).toHaveAttribute("hidden")
    expect(fieldset).toBeDisabled()
    expect(input).toBeDisabled()
    expect(new FormData(container.querySelector("form")!).has("company_name")).toBe(false)
    await user.selectOptions(screen.getByLabelText("Type"), "company")
    expect(fieldset).not.toHaveAttribute("hidden")
    expect(screen.getByLabelText("Company name")).toBeEnabled()
  })

  it("enable mode keeps children visible but disabled until it matches", async () => {
    const user = userEvent.setup()
    renderWithOnu(<Explicit action="enable" />)
    expect(screen.getByLabelText("Company name")).toBeDisabled()
    await user.selectOptions(screen.getByLabelText("Type"), "company")
    expect(screen.getByLabelText("Company name")).toBeEnabled()
  })

  it("hide and disable modes do the opposite", () => {
    renderWithOnu(
      <>
        <ConditionalDisplay value="yes" when="yes" action="hide" data-testid="hide">
          <input aria-label="A" />
        </ConditionalDisplay>
        <ConditionalDisplay value="yes" when="yes" action="disable">
          <input aria-label="B" />
        </ConditionalDisplay>
        <ConditionalDisplay value="no" when="yes" not>
          <input aria-label="C" />
        </ConditionalDisplay>
      </>,
    )
    expect(screen.getByTestId("hide")).toHaveAttribute("data-state", "hidden")
    expect(screen.getByLabelText("B")).toBeDisabled()
    expect(screen.getByLabelText("C")).toBeEnabled()
  })

  it("can unmount hidden content", () => {
    renderWithOnu(
      <ConditionalDisplay value="" unmount>
        <p>Gone</p>
      </ConditionalDisplay>,
    )
    expect(screen.queryByText("Gone")).toBeNull()
  })

  it("watches a react-hook-form field", async () => {
    function RHF() {
      const { register, control } = useForm<{ has_vehicle: boolean; plate: string }>({
        defaultValues: { has_vehicle: false, plate: "" },
      })
      return (
        <form>
          <label>
            <input type="checkbox" {...register("has_vehicle")} />
            Has vehicle
          </label>
          <ConditionalDisplay control={control} name="has_vehicle">
            <label>
              Plate
              <input {...register("plate")} />
            </label>
          </ConditionalDisplay>
        </form>
      )
    }
    const user = userEvent.setup()
    renderWithOnu(<RHF />)
    expect(screen.getByLabelText("Plate")).toBeDisabled()
    await user.click(screen.getByLabelText("Has vehicle"))
    expect(screen.getByLabelText("Plate")).toBeEnabled()
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(<Explicit />, { dir })
    await expectNoA11yViolations(container)
  })
})

describe("ConditionalLink", () => {
  it("renders a link when there is an href and the condition holds", () => {
    renderWithOnu(<ConditionalLink href="/users/1">Ahmed Ali</ConditionalLink>)
    expect(screen.getByRole("link", { name: "Ahmed Ali" })).toHaveAttribute("href", "/users/1")
  })

  it("renders plain text without an href or when not allowed", () => {
    const { container } = renderWithOnu(
      <>
        <ConditionalLink href={null}>No link</ConditionalLink>
        <ConditionalLink href="/x" when={false} fallbackAs="strong" className="c">
          Hidden link
        </ConditionalLink>
      </>,
    )
    expect(screen.queryByRole("link")).toBeNull()
    expect(container.querySelector("strong.c")).toHaveTextContent("Hidden link")
  })

  it("uses the provider link component and forwards refs", () => {
    const ref = React.createRef<HTMLAnchorElement>()
    const Link = ({ children, ...rest }: React.ComponentProps<"a">) => (
      <a data-inertia="" {...rest}>
        {children}
      </a>
    )
    renderWithOnu(
      <ConditionalLink href="/x" ref={ref} linkClassName="lk">
        Go
      </ConditionalLink>,
      { provider: { linkComponent: Link } },
    )
    expect(screen.getByRole("link")).toHaveAttribute("data-inertia")
    expect(screen.getByRole("link")).toHaveClass("lk")
    expect(ref.current).toBe(screen.getByRole("link"))
  })
})
