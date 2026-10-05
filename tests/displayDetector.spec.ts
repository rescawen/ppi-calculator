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

  test("LG UltraFine 24MD4KL 23.7 exists in catalog", () => {
    const estimates = getEstimatedScreenSizes(3840, 2160)
    expect(estimates).toContain(23.7)
  })
})

test.describe("UI Header & Detection Modals", () => {
  test("Detect Screen button exists and is clickable", async ({ page }) => {
    await page.goto("http://localhost:5173/")
    const detectButton = page.getByRole("button", { name: "Detect Screen" })
    await expect(detectButton).toBeVisible()

    await detectButton.click()
    // Should not crash and should remain visible (or finish detecting)
    await expect(detectButton).toBeVisible()
  })

  test("Info modal opens and explains Window Management permission", async ({ page }) => {
    await page.goto("http://localhost:5173/")
    const infoButton = page.getByRole("button", { name: "How screen auto-detection works" })
    await expect(infoButton).toBeVisible()
    await infoButton.click()

    const modal = page.locator("dialog[open]")
    await expect(modal).toBeVisible()
    await expect(modal).toContainText("How Screen Auto-Detection Works")
    await expect(modal).toContainText("Manage windows on all your displays")
    await expect(modal).toContainText("LG UltraFine")

    // Close button works
    const gotItBtn = modal.getByRole("button", { name: "Got it" })
    await gotItBtn.click()
    await expect(page.locator("dialog[open]")).toHaveCount(0)
  })

  test("Permission explainer modal appears when window-management is in prompt state", async ({
    page,
  }) => {
    // Inject mock getScreenDetails and permissions query returning 'prompt'
    await page.addInitScript(() => {
      // @ts-expect-error Mocking for test
      window.getScreenDetails = () => new Promise(() => {})
      const originalQuery = navigator.permissions.query.bind(navigator.permissions)
      navigator.permissions.query = async (desc) => {
        if (String(desc.name) === "window-management") {
          return { state: "prompt" } as PermissionStatus
        }
        return originalQuery(desc)
      }
    })

    await page.goto("http://localhost:5173/")
    const detectBtn = page.getByRole("button", { name: "Detect Screen" })
    await detectBtn.click()

    // The Display Identification Permission modal should now appear!
    const permDialog = page.locator("dialog[open]")
    await expect(permDialog).toBeVisible()
    await expect(permDialog).toContainText("Display Identification Permission")
    await expect(permDialog).toContainText("Manage windows on all your displays")
    await expect(permDialog).toContainText("What we query:")
    await expect(permDialog).toContainText("What we never do:")

    // Can dismiss via "Detect without Permission"
    const skipBtn = permDialog.getByRole("button", { name: "Detect without Permission" })
    await skipBtn.click()
    await expect(page.locator("dialog[open]")).toHaveCount(0)
  })

  test("Disable Permission button appears when permission is granted and opens guidance modal", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // @ts-expect-error Mocking for test
      window.getScreenDetails = () => new Promise(() => {})
      const originalQuery = navigator.permissions.query.bind(navigator.permissions)
      navigator.permissions.query = async (desc) => {
        if (String(desc.name) === "window-management") {
          return {
            state: "granted",
            addEventListener: () => {},
            removeEventListener: () => {},
          } as unknown as PermissionStatus
        }
        return originalQuery(desc)
      }
    })

    await page.goto("http://localhost:5173/")
    const disableBtn = page.getByRole("button", { name: "Disable Permission" })
    await expect(disableBtn).toBeVisible()
    await disableBtn.click()

    const modal = page.locator("dialog[open]")
    await expect(modal).toBeVisible()
    await expect(modal).toContainText("How to Disable Display Permission")
    await expect(modal).toContainText("Manage windows on all your displays")

    const gotItBtn = modal.getByRole("button", { name: "Got it" })
    await gotItBtn.click()
    await expect(page.locator("dialog[open]")).toHaveCount(0)
  })
})
