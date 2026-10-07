import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { normalizeUrl, UrlInput } from "./url-input"

// userEvent-driven tests can be slow when the whole suite runs in parallel with coverage.
vi.setConfig({ testTimeout: 30_000 })

describe("UrlInput", () => {
  it("normalizes URLs", () => {
    expect(normalizeUrl("example.mv")).toBe("https://example.mv")
    expect(normalizeUrl("  //cdn.example.mv/a ")).toBe("https://cdn.example.mv/a")
    expect(normalizeUrl("http://x.mv")).toBe("http://x.mv")
    expect(normalizeUrl("mailto:a@b.mv")).toBe("mailto:a@b.mv")
    expect(normalizeUrl("")).toBe("")
    expect(normalizeUrl("x.mv", "http://")).toBe("http://x.mv")
  })

  it("adds https:// on blur when missing (uncontrolled)", async () => {
    const onBlur = vi.fn()
    renderWithOnu(<UrlInput aria-label="Website" onBlur={onBlur} showIcon />)
    const input = screen.getByRole("textbox", { name: "Website" })
    expect(input).toHaveAttribute("type", "url")
    expect(input).toHaveAttribute("inputmode", "url")
    expect(input).toHaveAttribute("dir", "ltr")
    await userEvent.type(input, "gov.mv")
    await userEvent.tab()
    expect(input).toHaveValue("https://gov.mv")
    expect(onBlur).toHaveBeenCalled()
    await expectNoA11yViolations()
  })

  it("updates a controlled value through onChange", async () => {
    function Controlled() {
      const [v, setV] = React.useState("")
      return (
        <>
          <UrlInput aria-label="Website" value={v} onChange={(e) => setV(e.target.value)} />
          <output>{v}</output>
        </>
      )
    }
    renderWithOnu(<Controlled />)
    await userEvent.type(screen.getByRole("textbox"), "javaabu.com")
    await userEvent.tab()
    expect(screen.getByText("https://javaabu.com")).toBeInTheDocument()
  })

  it("can keep the value as typed", async () => {
    renderWithOnu(<UrlInput aria-label="Path" defaultProtocol={false} />)
    await userEvent.type(screen.getByRole("textbox"), "/about")
    await userEvent.tab()
    expect(screen.getByRole("textbox")).toHaveValue("/about")
  })

  it.each(directions)("stays LTR in %s", (dir) => {
    renderWithOnu(<UrlInput aria-label="ވެބްސައިޓް" />, { dir, locale: "dv" })
    expect(screen.getByRole("textbox")).toHaveAttribute("dir", "ltr")
  })
})
