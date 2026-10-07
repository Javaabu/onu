import { expect, test } from "./fixtures"

// Real-browser check of the Thaana keyboard (beforeinput + execCommand undo), on desktop and mobile.
test("types Thaana and keeps undo working", async ({ page }) => {
  await page.goto("/#/components/text-inputs/thaana-input")
  const input = page.getByLabel("ނަން", { exact: true })
  await input.click()
  await input.pressSequentially("dhivehi")
  await expect(input).toHaveValue("ދހިވެހި")
  await expect(input).toHaveAttribute("dir", "rtl")

  // Inserted through execCommand, so the browser's undo stack still works.
  await page.keyboard.press("ControlOrMeta+Z")
  await expect(input).not.toHaveValue("ދހިވެހި")
  await page.keyboard.press("ControlOrMeta+Shift+Z")
  await expect(input).toHaveValue("ދހިވެހި")

  await page.keyboard.press("Alt+Shift+T")
  await input.pressSequentially(" abc")
  await expect(input).toHaveValue("ދހިވެހި abc")
})
