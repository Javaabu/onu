import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ErrorPage, ForbiddenPage, MaintenancePage, NotFoundPage, ServerErrorPage } from "./error-page"

describe("Error pages", () => {
  afterEach(() => vi.restoreAllMocks())

  it.each([
    [ForbiddenPage, "Access denied", "lock", false],
    [NotFoundPage, "Page not found", "search", false],
    [ServerErrorPage, "Something went wrong", "error", true],
    [MaintenancePage, "Down for maintenance", "wrench", true],
  ] as const)("%o shows its title, icon and actions", (Page, title, icon, retry) => {
    const { container } = renderWithOnu(<Page />)
    expect(screen.getByRole("main", { name: title })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument()
    expect(container.querySelector(`[data-icon-name=${icon}]`)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute("href", "/")
    expect(screen.getByRole("button", { name: "Go back" })).toBeInTheDocument()
    expect(!!screen.queryByRole("button", { name: "Try again" })).toBe(retry)
  })

  it.each([
    [403, "ހުއްދައެއް ނެތް"],
    [404, "ސަފްހާ ނުފެނުނު"],
    [500, "މައްސަލައެއް ދިމާވެއްޖެ"],
    [503, "މެއިންޓެނަންސް ކުރަނީ"],
  ] as const)("translates %s into Dhivehi", (code, title) => {
    renderWithOnu(<ErrorPage code={code} />, { locale: "dv" })
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument()
    expect(screen.getByText(`އެރަރ ${code}`)).toBeInTheDocument()
  })

  it("runs retry and back actions", async () => {
    const onRetry = vi.fn()
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {})
    renderWithOnu(<ServerErrorPage onRetry={onRetry} homeHref={null} />)
    expect(screen.queryByRole("link")).toBeNull()
    await userEvent.click(screen.getByRole("button", { name: "Try again" }))
    await userEvent.click(screen.getByRole("button", { name: "Go back" }))
    expect(onRetry).toHaveBeenCalled()
    expect(back).toHaveBeenCalled()
  })

  it("reloads by default on retry", async () => {
    const reload = vi.fn()
    vi.spyOn(window, "location", "get").mockReturnValue({ ...window.location, reload })
    renderWithOnu(<MaintenancePage showBack={false} />)
    await userEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(reload).toHaveBeenCalled()
  })

  it("accepts custom text, illustration, actions and a div wrapper", () => {
    const { container } = renderWithOnu(
      <>
        <ErrorPage
          code={418}
          as="div"
          title="I'm a teapot"
          message="Short and stout"
          illustration={<img src="/teapot.svg" alt="" />}
          extraActions={<button type="button">Contact</button>}
          homeHref="/dashboard"
        />
        <NotFoundPage as="div" actions={<button type="button">Only this</button>} />
      </>,
    )
    expect(screen.queryByRole("main")).toBeNull()
    expect(screen.getByRole("heading", { name: "I'm a teapot" })).toBeInTheDocument()
    expect(screen.getByText("Short and stout")).toBeInTheDocument()
    expect(container.querySelector("img")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Contact" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute("href", "/dashboard")
    expect(screen.getByRole("button", { name: "Only this" })).toBeInTheDocument()
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(<NotFoundPage />, { dir })
    await expectNoA11yViolations(container)
  })
})
