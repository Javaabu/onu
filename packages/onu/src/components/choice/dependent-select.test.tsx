import * as React from "react"
import { QueryClient } from "@tanstack/react-query"
import { screen, waitFor, configure } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { DependentSelect, type DependentSelectProps } from "./dependent-select"
import { Select } from "./select"

// Interaction-heavy tests: allow for slow, shared CI machines.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

const islandsByAtoll = {
  K: [
    { value: "male", label: "Malé" },
    { value: "hulhumale", label: "Hulhumalé" },
  ],
  S: [
    { value: "hithadhoo", label: "Hithadhoo" },
    { value: "feydhoo", label: "Feydhoo" },
  ],
}

afterEach(() => vi.unstubAllGlobals())

function Form(props: Partial<DependentSelectProps> & { initialAtoll?: string }) {
  const { initialAtoll = "", ...rest } = props
  const [atoll, setAtoll] = React.useState(initialAtoll)
  return (
    <>
      <Select
        aria-label="Atoll"
        options={[
          { value: "K", label: "Kaafu" },
          { value: "S", label: "Seenu" },
        ]}
        value={atoll}
        onValueChange={setAtoll}
      />
      <button type="button" onClick={() => setAtoll("S")}>
        Pick Seenu
      </button>
      <DependentSelect
        aria-label="Island"
        parentValue={atoll}
        parentLabel="atoll"
        options={islandsByAtoll}
        {...(rest as object)}
      />
    </>
  )
}

describe("DependentSelect", () => {
  it("is disabled with a hint until the parent has a value", () => {
    renderWithOnu(<Form />)
    const island = screen.getByRole("combobox", { name: "Island" })
    expect(island).toBeDisabled()
    expect(island).toHaveTextContent("Select atoll first")
  })

  it("shows options for the parent and clears when the parent changes", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<Form initialAtoll="K" onValueChange={onValueChange} />)
    const island = screen.getByRole("combobox", { name: "Island" })
    await userEvent.click(island)
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Malé", "Hulhumalé"])
    await userEvent.click(screen.getByRole("option", { name: "Malé" }))
    expect(island).toHaveTextContent("Malé")
    await userEvent.click(screen.getByRole("button", { name: "Pick Seenu" }))
    expect(onValueChange).toHaveBeenLastCalledWith(null, null)
    expect(island).toHaveTextContent("Select an option")
    await userEvent.click(island)
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Hithadhoo", "Feydhoo"])
  })

  it("accepts an options function and controlled multiple values", async () => {
    const onValueChange = vi.fn()
    function Controlled() {
      const [value, setValue] = React.useState<string[]>(["male"])
      const [atoll, setAtoll] = React.useState("K")
      return (
        <>
          <button type="button" onClick={() => setAtoll("S")}>
            Change
          </button>
          <DependentSelect
            aria-label="Islands"
            parentValue={atoll}
            options={(a) => islandsByAtoll[a as "K" | "S"]}
            multiple
            value={value}
            onValueChange={(v) => {
              setValue(v)
              onValueChange(v)
            }}
          />
        </>
      )
    }
    renderWithOnu(<Controlled />)
    expect(screen.getByRole("button", { name: "Remove Malé" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Change" }))
    expect(onValueChange).toHaveBeenCalledWith([])
    expect(screen.queryByRole("button", { name: "Remove Malé" })).not.toBeInTheDocument()
  })

  it("loads options with loadOptions per parent (shared data layer)", async () => {
    const loadOptions = vi.fn(async (atoll: string) => islandsByAtoll[atoll as "K" | "S"])
    renderWithOnu(
      <Form
        initialAtoll="K"
        options={undefined}
        loadOptions={loadOptions}
        debounce={0}
        queryClient={new QueryClient()}
      />,
    )
    await userEvent.click(screen.getByRole("combobox", { name: "Island" }))
    expect(await screen.findByRole("option", { name: "Malé" })).toBeInTheDocument()
    expect(loadOptions).toHaveBeenCalledWith("K", expect.objectContaining({ query: "", page: 1 }))
  })

  it("loads options from a url with the parent param", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: [{ id: 9, name: "Thinadhoo" }] })))
    vi.stubGlobal("fetch", fetchMock)
    renderWithOnu(
      <Form
        initialAtoll="S"
        options={undefined}
        url="/api/islands"
        parentParam="atoll"
        params={{ active: 1 }}
        debounce={0}
        queryClient={new QueryClient()}
      />,
    )
    await userEvent.click(screen.getByRole("combobox", { name: "Island" }))
    expect(await screen.findByRole("option", { name: "Thinadhoo" })).toBeInTheDocument()
    await waitFor(() => expect(String(fetchMock.mock.calls[0]![0 as never])).toContain("atoll=S"))
    expect(String(fetchMock.mock.calls[0]![0 as never])).toContain("active=1")
  })

  it.each(directions)("passes axe in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<DependentSelect aria-label="ރަށް" parentValue={null} parentLabel="އަތޮޅު" />, { locale: "dv", dir })
    expect(screen.getByRole("combobox")).toHaveTextContent("ފުރަތަމަ އަތޮޅު އިޚްތިޔާރު ކުރައްވާ")
    await expectNoA11yViolations()
  })
})
