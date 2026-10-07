import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { FormErrorsProvider, FormLayoutProvider } from "../components/form/form-context"
import { AddressInput, type AddressIsland, type MaldivesAddress } from "./address-input"
import { atollLabel, findAtoll, MALDIVES_ATOLLS } from "./maldives"

const islands: AddressIsland[] = [
  { value: "male", label: "Malé", dvLabel: "މާލެ", atoll: "MLE", position: { lat: 4.1755, lng: 73.5093 } },
  { value: "maafushi", label: "Maafushi", dvLabel: "މާފުށި", atoll: "K", position: { lat: 3.942, lng: 73.49 } },
  { value: "guraidhoo", label: "Guraidhoo", atoll: "K" },
]

describe("Maldives data", () => {
  it("lists the atolls with codes and labels", () => {
    expect(MALDIVES_ATOLLS).toHaveLength(21)
    expect(findAtoll("K")!.name).toBe("Kaafu")
    expect(findAtoll(undefined)).toBeUndefined()
    expect(atollLabel(findAtoll("S")!, "en")).toBe("S. Seenu")
    expect(atollLabel(findAtoll("S")!, "dv")).toBe("ސ. އައްޑޫ އަތޮޅު")
  })
})

describe("AddressInput", () => {
  it("renders labelled fields with names for form submission", async () => {
    const { container } = renderWithOnu(<AddressInput name="address" required />)
    expect(screen.getByRole("group", { name: "Address" })).toBeInTheDocument()
    expect(screen.getByLabelText(/Atoll/)).toHaveAttribute("name", "address[atoll]")
    expect(screen.getByLabelText(/Atoll/)).toBeRequired()
    expect(screen.getByLabelText(/Island/)).toHaveAttribute("name", "address[island]")
    expect(screen.getByLabelText("Road")).toHaveAttribute("name", "address[road]")
    expect(screen.getByLabelText("House or building")).toHaveAttribute("name", "address[house]")
    expect(container.querySelector("[data-slot=map-picker]")).toBeNull()
    await expectNoA11yViolations()
  })

  it("filters islands by atoll and clears an island from another atoll", async () => {
    const onChange = vi.fn()
    function Controlled() {
      const [value, setValue] = React.useState<MaldivesAddress>({})
      return (
        <AddressInput
          islands={islands}
          value={value}
          onChange={(v) => {
            onChange(v)
            setValue(v)
          }}
        />
      )
    }
    renderWithOnu(<Controlled />)
    const island = screen.getByLabelText("Island")
    expect(screen.getAllByRole("option", { name: "Malé" })).toHaveLength(1)
    // Picking an island sets its atoll.
    await userEvent.selectOptions(island, "maafushi")
    expect(onChange).toHaveBeenLastCalledWith({ island: "maafushi", atoll: "K" })
    expect(screen.queryByRole("option", { name: "Malé" })).not.toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText("Atoll"), "K")
    expect(onChange).toHaveBeenLastCalledWith({ island: "maafushi", atoll: "K" })
    await userEvent.selectOptions(screen.getByLabelText("Atoll"), "MLE")
    expect(onChange).toHaveBeenLastCalledWith({ atoll: "MLE", island: undefined })
    await userEvent.selectOptions(screen.getByLabelText("Island"), "")
    await userEvent.selectOptions(screen.getByLabelText("Atoll"), "")
    expect(onChange).toHaveBeenLastCalledWith({ atoll: undefined, island: undefined })
    await userEvent.type(screen.getByLabelText("Road"), "Majeedhee Magu")
    await userEvent.type(screen.getByLabelText("House or building"), "Rose")
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ road: "Majeedhee Magu", house: "Rose" }))
    await userEvent.clear(screen.getByLabelText("Road"))
    expect(onChange.mock.calls.at(-1)![0].road).toBeUndefined()
  })

  it("uses a text field for the island without a list, with Thaana", async () => {
    const onChange = vi.fn()
    renderWithOnu(<AddressInput thaana onChange={onChange} />)
    const island = screen.getByLabelText("Island")
    expect(island).toHaveAttribute("lang", "dv")
    await userEvent.type(island, "x")
    await userEvent.clear(island)
    expect(onChange).toHaveBeenLastCalledWith({ island: undefined })
  })

  it("adds a map pin centred on the island", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <AddressInput
        name="a"
        pin
        islands={islands}
        defaultValue={{ atoll: "K", island: "maafushi" }}
        onChange={onChange}
      />,
    )
    expect(container.querySelector("[data-slot=map-placeholder]")!.textContent).toContain("3.9420°")
    const lat = screen.getByLabelText("Latitude")
    await userEvent.type(lat, "3.94")
    await userEvent.type(screen.getByLabelText("Longitude"), "73.49")
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ location: { lat: 3.94, lng: 73.49 } }))
    expect(container.querySelector("input[name='a[location][lat]']")).toHaveValue("3.94")
  })

  it("shows errors from props and Laravel", () => {
    renderWithOnu(
      <FormErrorsProvider errors={{ "home.atoll": ["Select the atoll."] }}>
        <FormLayoutProvider disabled>
          <AddressInput name="home" errors={{ house: "Required" }} legend={null} />
        </FormLayoutProvider>
      </FormErrorsProvider>,
    )
    expect(screen.getByText("Select the atoll.")).toBeInTheDocument()
    expect(screen.getByText("Required")).toBeInTheDocument()
    expect(screen.getByLabelText("Atoll")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("group")).toBeDisabled()
    expect(screen.getByText("Address")).toHaveClass("sr-only")
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    renderWithOnu(<AddressInput islands={islands} defaultValue={{ atoll: "MLE" }} />, { locale: "dv", dir })
    expect(screen.getByRole("group", { name: "އެޑްރެސް" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "މާލެ" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "ކ. މާލޭ އަތޮޅު" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
