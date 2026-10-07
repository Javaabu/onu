import { act, fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { highlightCode, normalizeLanguage } from "./_highlight"
import { CodeBlock } from "./code-block"

const code = `const island = "Malé"\n\nconsole.log(island)\n`

afterEach(() => {
  vi.useRealTimers()
})

// Loading Shiki is slow under jsdom on busy machines.
vi.setConfig({ testTimeout: 30_000 })

describe("CodeBlock", () => {
  it("renders plain code as LTR with a label and copy button", async () => {
    const { container } = renderWithOnu(<CodeBlock code={code} className="root-x" />)
    const figure = container.querySelector("[data-slot=code-block]")!
    expect(figure).toHaveClass("root-x")
    expect(figure).toHaveAttribute("data-language", "text")
    const pre = screen.getByRole("region", { name: "Plain text" })
    expect(pre).toHaveAttribute("dir", "ltr")
    expect(pre).toHaveAttribute("tabindex", "0")
    // Trailing newline is dropped; the empty middle line is kept.
    expect(container.querySelectorAll("[data-line]")).toHaveLength(3)
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("highlights with Shiki after loading it lazily", async () => {
    const { container } = renderWithOnu(<CodeBlock code={code} language="ts" />)
    expect(screen.getByText("TypeScript")).toBeInTheDocument()
    await waitFor(() => expect(container.querySelector("[data-slot=code-block]")).toHaveAttribute("data-highlighted"), {
      timeout: 20_000,
    })
    const token = container.querySelector<HTMLElement>("[data-line='1'] span span")!
    expect(token.getAttribute("style")).toContain("--shiki-light")
    expect(token).toHaveClass("text-(--shiki-light)")
  })

  it("shows line numbers, highlighted lines, a title and wraps", () => {
    const { container } = renderWithOnu(
      <CodeBlock
        code={"a\nb\nc"}
        language="unknown-lang"
        title="routes/web.php"
        lineNumbers
        startLine={10}
        highlightLines={[11]}
        wrap
        classNames={{ header: "head-x", pre: "pre-x", line: "line-x", lineNumber: "num-x", copy: "copy-x" }}
      />,
    )
    expect(screen.getByText("routes/web.php")).toHaveClass("truncate")
    expect(screen.getByRole("region", { name: "routes/web.php" })).toHaveClass("pre-x", "whitespace-pre-wrap")
    expect(container.querySelector("[data-line='11']")).toHaveAttribute("data-highlighted", "true")
    expect(container.querySelector("[data-line='10']")).not.toHaveAttribute("data-highlighted")
    expect(container.querySelector(".num-x")).toHaveTextContent("10")
    expect(container.querySelector(".num-x")).toHaveAttribute("aria-hidden", "true")
    expect(container.querySelector(".head-x")).toBeInTheDocument()
    expect(container.querySelector(".line-x")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Copy code" })).toHaveClass("copy-x")
  })

  it("can hide the header or the copy button", () => {
    const { rerender } = renderWithOnu(<CodeBlock code="x" hideHeader />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    rerender(<CodeBlock code="x" copyable={false} language="bash" />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.getByText("Bash")).toBeInTheDocument()
  })

  it("copies the code and announces it", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const writeText = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("denied"))
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    renderWithOnu(<CodeBlock code={code} />)
    const copy = screen.getByRole("button", { name: "Copy code" })
    await act(async () => {
      fireEvent.click(copy)
    })
    expect(writeText).toHaveBeenCalledWith(code.trimEnd())
    expect(screen.getByText("Code copied")).toBeInTheDocument()
    expect(copy.querySelector("[data-icon-name=check]")).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(2100)
    })
    expect(screen.queryByText("Code copied")).not.toBeInTheDocument()
    await act(async () => {
      fireEvent.click(copy)
    })
    expect(screen.queryByText("Code copied")).not.toBeInTheDocument()
  })

  it.each(directions)("stays LTR on %s pages with Dhivehi labels", async (dir) => {
    renderWithOnu(<CodeBlock code="echo 'ސަލާމް'" />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: "ކޯޑު ކޮޕީކުރޭ" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "ސާދާ ލިޔުން" })).toHaveAttribute("dir", "ltr")
    await expectNoA11yViolations()
  })
})

describe("highlightCode", () => {
  it("normalises aliases and skips plain text and unknown languages", async () => {
    expect(normalizeLanguage("language-SH")).toBe("bash")
    expect(normalizeLanguage(null)).toBeNull()
    expect(await highlightCode("x", "text")).toBeNull()
    expect(await highlightCode("x", "not-a-language")).toBeNull()
    const tokens = await highlightCode("echo hi", "sh", { light: "github-light", dark: "github-dark" })
    expect(tokens?.[0]?.map((t) => t.content).join("")).toBe("echo hi")
  })
})
