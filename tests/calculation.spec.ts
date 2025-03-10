import { test, expect } from "@playwright/test"

test.describe("Empty or zero value calculates correctly", () => {
  test.beforeEach("Placeholder", async ({ page }) => {
    await page.goto("http://localhost:5173/")
  })

  test("Calculate manually filling horizontal in", async ({ page }) => {
    const inputsContainer = page.getByTestId("inputs-container")
    await expect(inputsContainer).toBeVisible()

    const horizontalResolutionInput = inputsContainer.getByTestId("horizontal-resolution-input")

    await horizontalResolutionInput.fill("0")
    await expect(horizontalResolutionInput).toHaveValue("0")
  })

  test("Delete default value until input is empty", async ({ page }) => {
    const inputsContainer = page.getByTestId("inputs-container")
    await expect(inputsContainer).toBeVisible()

    const horizontalResolutionInput = inputsContainer.getByTestId("horizontal-resolution-input")

    const horizontalResolutionInputValue = await horizontalResolutionInput.inputValue()

    for (let toBeDeletedChars = horizontalResolutionInputValue.length; toBeDeletedChars > 0; toBeDeletedChars--) {
      horizontalResolutionInput.press("Backspace")
    }
  })

  test.afterEach("Check that ppi is zero", async ({ page }) => {
    const calculationResults = page.getByTestId("calculation-results")
    await expect(calculationResults).toBeVisible()

    const widthDimension = calculationResults.getByTestId("width-dimension")
    await expect(widthDimension).toContainText("0cm")

    const areaDimension = calculationResults.getByTestId("area-dimension")
    await expect(areaDimension).toContainText("0cm²")

    const ppiResult = calculationResults.getByTestId("ppi-result")
    await expect(ppiResult).toContainText("0 PPI")
  })
})
