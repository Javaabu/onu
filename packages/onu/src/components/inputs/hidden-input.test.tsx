import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { HiddenInput } from "./hidden-input"

// userEvent-driven tests can be slow when the whole suite runs in parallel with coverage.
vi.setConfig({ testTimeout: 30_000 })

describe("HiddenInput", () => {
  it("serializes values", () => {
    const { container } = renderWithOnu(
      <form>
        <HiddenInput name="a" value="x" />
        <HiddenInput name="b" value={3} />
        <HiddenInput name="c" value={true} />
        <HiddenInput name="d" value={false} />
        <HiddenInput name="e" value={null} />
        <HiddenInput name="tags" value={["one", "two"]} />
      </form>,
    )
    const data = new FormData(container.querySelector("form")!)
    expect(data.get("a")).toBe("x")
    expect(data.get("b")).toBe("3")
    expect(data.get("c")).toBe("1")
    expect(data.get("d")).toBe("0")
    expect(data.get("e")).toBe("")
    expect(data.getAll("tags[]")).toEqual(["one", "two"])
  })

  it("takes id and name from a FormField", () => {
    const ref = React.createRef<HTMLInputElement>()
    const { container } = renderWithOnu(
      <FormField label="Record" name="record_id" id="rec">
        <HiddenInput value={42} ref={ref} />
      </FormField>,
    )
    const input = container.querySelector("input[type=hidden]")!
    expect(input).toHaveAttribute("name", "record_id")
    expect(input).toHaveAttribute("id", "rec")
    expect(ref.current).toBe(input)
  })

  it("names array values from a FormField", () => {
    const { container } = renderWithOnu(
      <FormField label="Ids" name="ids[]">
        <HiddenInput value={["1"]} />
      </FormField>,
    )
    expect(container.querySelector("input[type=hidden]")).toHaveAttribute("name", "ids[]")
  })
})
