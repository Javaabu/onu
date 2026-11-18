import { expect, test, waitForPage } from "./fixtures"

// Real-browser checks for behaviour jsdom can't show: focus after re-renders, inert
// modal backgrounds, IntersectionObserver, downloads and chart layout (#66). Each
// scenario lives in web/src/e2e/<name>.harness.tsx, served at #/e2e/<name>.
async function open(page: import("@playwright/test").Page, name: string) {
  await page.goto(`/#/e2e/${name}`)
  await waitForPage(page, `/#/e2e/${name}`)
}

test.describe("focus", () => {
  test("SortableList keeps focus on the moved item (Move down and Alt+ArrowDown)", async ({ page }) => {
    await open(page, "sortable-list")
    const items = page.getByRole("list", { name: "Islands" }).getByRole("listitem")

    await page.getByRole("button", { name: "Move Malé down" }).click()
    await expect(items.nth(1)).toContainText("Malé")
    await expect(page.getByRole("button", { name: "Move Malé down" })).toBeFocused()

    await page.getByRole("button", { name: "Drag to reorder Malé" }).focus()
    await page.keyboard.press("Alt+ArrowDown")
    await expect(items.nth(2)).toContainText("Malé")
    await expect(page.getByRole("button", { name: "Drag to reorder Malé" })).toBeFocused()
  })

  test("Form keeps focus in the field after an Enter submit", async ({ page }) => {
    await open(page, "form-enter")
    const name = page.getByLabel("Name")
    await name.click()
    await page.keyboard.press("Enter")
    await expect(page.locator("form")).toHaveAttribute("data-status", "success")
    await expect(name).toBeFocused()
  })

  test("the top-level comment composer keeps focus after posting", async ({ page }) => {
    await open(page, "composer")
    const box = page.getByRole("textbox", { name: "Write a comment…" })
    await box.fill("First!")
    await page.getByRole("button", { name: "Comment", exact: true }).click()
    await expect(page.getByText("First!")).toBeVisible()
    await expect(box).toHaveValue("")
    await expect(box).toBeFocused()
  })

  test("the slash menu works inside a modal dialog", async ({ page }) => {
    await open(page, "slash-menu-modal")
    const editor = page.getByRole("dialog").getByRole("textbox", { name: "Page content" })
    await editor.click()
    await page.keyboard.type("/head")
    const option = page.getByRole("option", { name: /Heading 1/ })
    await expect(option).toBeVisible()
    // Inside the dialog, and next to the editor rather than thrown off by the dialog's transform.
    await expect(page.getByRole("dialog").locator("[data-slot=slash-menu]")).toBeVisible()
    const menu = (await page.locator("[data-slot=slash-menu]").boundingBox())!
    const field = (await editor.boundingBox())!
    expect(menu.y).toBeGreaterThan(field.y)
    expect(menu.y).toBeLessThan(field.y + 120)
    await option.click()
    await expect(editor.locator("h1")).toHaveCount(1)
  })
})

test("LoadMore auto doesn't load again while a load is starting", async ({ page }) => {
  await open(page, "load-more-auto")
  // Each load adds 5 items after 600 ms; a second call before `loading` is set would be a duplicate request.
  await page.waitForTimeout(2500)
  const items = await page.getByRole("listitem").count()
  const calls = Number(await page.getByTestId("calls").textContent())
  expect(calls).toBeLessThanOrEqual((items - 5) / 5 + 1)
})

test("QrCode downloads PNG and SVG files", async ({ page }) => {
  await open(page, "qr-download")
  for (const name of [/PNG/, /SVG/]) {
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name }).click()])
    expect(await download.failure()).toBeNull()
    const chunks: Buffer[] = []
    for await (const chunk of await download.createReadStream()) chunks.push(chunk as Buffer)
    expect(Buffer.concat(chunks).length).toBeGreaterThan(100)
  }
})

test("TimeSeriesChart drops its zoom range when the data changes", async ({ page }) => {
  await open(page, "time-series-zoom")
  const status = page.locator("[data-slot=chart-zoom-status]")
  const traveller = page.locator(".recharts-brush-traveller").first()
  const box = (await traveller.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + 250, box.y + box.height / 2, { steps: 10 })
  await page.mouse.up()
  await expect(page.getByRole("button", { name: "Reset zoom" })).toBeVisible()

  await page.getByRole("button", { name: "Switch data" }).click()
  // The new data is 1–10 May: nothing from the old January–March range may remain.
  await expect(status).not.toContainText(/Jan|Feb|Mar/)
  await expect(page.getByRole("button", { name: "Reset zoom" })).toHaveCount(0)
})

test("InlineEdit: clicking Cancel doesn't save", async ({ page }) => {
  await open(page, "inline-edit")
  await page.getByRole("button", { name: /Edit Name/ }).click()
  await page.getByRole("textbox", { name: "Name" }).fill("Changed")
  await page.getByRole("button", { name: "Cancel" }).click()
  await expect(page.getByTestId("saves")).toHaveText("")
  await expect(page.getByRole("button", { name: /Edit Name/ })).toContainText("Aishath Shifa")
})
