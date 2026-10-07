import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { DescriptionList, DescriptionListItem, isEmptyValue } from "./description-list"

describe("DescriptionList", () => {
  it("renders label–value pairs as dt/dd", () => {
    renderWithOnu(
      <DescriptionList
        items={[
          { label: "Name", value: "Aishath Shiuna" },
          { label: "Island", value: "Fuvahmulah" },
        ]}
      />,
    )
    expect(screen.getByText("Name").tagName).toBe("DT")
    expect(screen.getByText("Aishath Shiuna").closest("dd")).toBeInTheDocument()
  })

  it("shows “—” for missing values (§25.8)", () => {
    const { container } = renderWithOnu(
      <DescriptionList
        items={[
          { label: "Phone", value: null },
          { label: "Email", value: "" },
          { label: "Tags", value: [] as unknown as React.ReactNode },
          { label: "Fax" },
        ]}
      />,
    )
    const values = container.querySelectorAll("dd")
    values.forEach((dd) => expect(dd).toHaveTextContent("—Not set"))
    expect(screen.getAllByText("Not set")[0]).toHaveClass("sr-only")
  })

  it("isEmptyValue", () => {
    expect(isEmptyValue(0)).toBe(false)
    expect(isEmptyValue(undefined)).toBe(true)
  })

  it("stacks on narrow containers and goes inline on wide ones (auto), or is fixed", () => {
    const { container } = renderWithOnu(
      <>
        <DescriptionList items={[{ label: "A", value: "1" }]} />
        <DescriptionList layout="inline" items={[{ label: "B", value: "2" }]} />
        <DescriptionList
          layout="stacked"
          striped
          divided={false}
          items={[{ label: "C", value: "3", fullWidth: true }]}
        />
      </>,
    )
    const items = container.querySelectorAll("[data-slot=description-list-item]")
    expect(items[0]!.className).toMatch(/@md:grid-cols-/)
    expect(items[1]!.className).toMatch(/(^| )grid-cols-/)
    expect(items[2]!.className).not.toMatch(/grid-cols-/)
    expect(container.querySelectorAll("[data-slot=description-list-container]")[0]).toHaveClass("@container")
  })

  it("copies values", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
    renderWithOnu(
      <DescriptionList>
        <DescriptionListItem label="ID card" copyable>
          A123456
        </DescriptionListItem>
        <DescriptionListItem label={<span>Account</span>} copyable copyValue="7730000123456">
          <b>7730 0001 23456</b>
        </DescriptionListItem>
      </DescriptionList>,
    )
    await user.click(screen.getByRole("button", { name: "Copy ID card" }))
    expect(writeText).toHaveBeenCalledWith("A123456")
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Copy 7730000123456" }))
    expect(writeText).toHaveBeenLastCalledWith("7730000123456")
  })

  it("does not offer copy for empty or non-text values, and handles clipboard failure", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"))
    renderWithOnu(
      <DescriptionList>
        <DescriptionListItem label="Empty" copyable />
        <DescriptionListItem label="Node" copyable>
          <i>x</i>
        </DescriptionListItem>
        <DescriptionListItem label="Num" copyable classNames={{ copy: "cp" }}>
          {42}
        </DescriptionListItem>
      </DescriptionList>,
    )
    expect(screen.getAllByRole("button")).toHaveLength(1)
    await userEvent.click(screen.getByRole("button", { name: "Copy Num" }))
    expect(screen.getByRole("button", { name: "Copy Num" })).toHaveClass("cp")
  })

  it.each(directions)("is accessible in %s (dv)", async (dir) => {
    const { container } = renderWithOnu(
      <DescriptionList
        items={[
          { label: "ނަން", value: "އަޙްމަދު", copyable: true },
          { label: "ފޯނު", value: null },
        ]}
      />,
      { dir, locale: "dv" },
    )
    expect(screen.getByRole("button", { name: "ނަން ކޮޕީކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
