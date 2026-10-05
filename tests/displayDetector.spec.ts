import { test, expect } from "@playwright/test"
import { getEstimatedScreenSizes } from "../src/utils/catalog"

test.describe("Catalog & Display Estimation Logic", () => {
  test("Curated resolutions preserve explicit priorities", () => {
    expect(getEstimatedScreenSizes(1920, 1080)).toEqual([24.5, 25, 23.7])
    expect(getEstimatedScreenSizes(2560, 1440)).toEqual([27, 26.5, 16])
    expect(getEstimatedScreenSizes(2560, 1600)).toEqual([13.3, 30, 16])
  })

  test("Catalog extracts unique hardware resolutions correctly", () => {
    expect(getEstimatedScreenSizes(3024, 1964)).toEqual([14.2])
    expect(getEstimatedScreenSizes(3456, 2234)).toEqual([16.2])
    expect(getEstimatedScreenSizes(2560, 1664)).toEqual([13.6])
    expect(getEstimatedScreenSizes(2880, 1864)).toEqual([15.3])
    expect(getEstimatedScreenSizes(4480, 2520)).toEqual([23.5])
  })

  test("Unknown resolution returns empty array for 96 PPI fallback", () => {
    expect(getEstimatedScreenSizes(1234, 567)).toEqual([])
  })
})

test.describe("UI Header & Detection Button", () => {
  test("Detect Screen button exists and is clickable", async ({ page }) => {
    await page.goto("http://localhost:5173/")
    const detectButton = page.getByRole("button", { name: "Detect Screen" })
    await expect(detectButton).toBeVisible()

    await detectButton.click()
    // Should not crash and should remain visible (or finish detecting)
    await expect(detectButton).toBeVisible()
  })
})
