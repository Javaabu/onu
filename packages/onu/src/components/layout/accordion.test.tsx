import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion"
import { Accordion, accordionVariants, type AccordionItemData } from "./accordion"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const items: AccordionItemData[] = [
  { value: "fees", title: "What are the fees?", content: "MVR 50 per application.", icon: "credit-card" },
  { value: "time", title: "How long does it take?", content: "Up to 5 working days." },
  { value: "closed", title: "Closed topic", content: "Hidden", disabled: true },
]

describe("Accordion", () => {
  it("is single and collapsible by default", async () => {
    renderWithOnu(<Accordion items={items} className="extra" classNames={{ trigger: "trg", item: "itm" }} />)
    const fees = screen.getByRole("button", { name: "What are the fees?" })
    expect(fees).toHaveClass("trg")
    await userEvent.click(fees)
    expect(fees).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("MVR 50 per application.")).toBeVisible()
    await userEvent.click(screen.getByRole("button", { name: "How long does it take?" }))
    expect(fees).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(screen.getByRole("button", { name: "How long does it take?" }))
    expect(screen.getByRole("button", { name: "How long does it take?" })).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByRole("button", { name: "Closed topic" })).toBeDisabled()
    await expectNoA11yViolations()
  })

  it("opens several panels with type multiple (controlled)", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(
      <Accordion type="multiple" items={items} value={["fees"]} onValueChange={onValueChange} variant="separated" />,
    )
    expect(screen.getByRole("button", { name: "What are the fees?" })).toHaveAttribute("aria-expanded", "true")
    await userEvent.click(screen.getByRole("button", { name: "How long does it take?" }))
    expect(onValueChange).toHaveBeenCalledWith(["fees", "time"])
  })

  it("supports keyboard navigation and composition", async () => {
    renderWithOnu(
      <Accordion variant="bordered" defaultValue="b">
        <AccordionItem value="a">
          <AccordionTrigger>A</AccordionTrigger>
          <AccordionContent>Panel A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>B</AccordionTrigger>
          <AccordionContent>Panel B</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    expect(screen.getByText("Panel B")).toBeVisible()
    screen.getByRole("button", { name: "A" }).focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: "B" })).toHaveFocus()
    expect(accordionVariants({ variant: "bordered" })).toContain("border")
  })

  it.each(directions)("works in %s with Dhivehi", async (dir) => {
    renderWithOnu(<Accordion items={[{ value: "a", title: "ފީ", content: "50 ރުފިޔާ" }]} />, { locale: "dv", dir })
    await userEvent.click(screen.getByRole("button", { name: "ފީ" }))
    expect(screen.getByText("50 ރުފިޔާ")).toBeVisible()
    await expectNoA11yViolations()
  })
})
