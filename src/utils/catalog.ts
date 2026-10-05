import { brandGroups } from "../data/brandGroups"
import curatedResolutions from "../data/resolutionScreenSizeEstimates.json"

export type ResolutionEstimate = {
  horizontalResolution: number
  verticalResolution: number
  screenSizes: number[]
}

// Build a lookup map of all real-world device diagonals grouped by resolution
const catalogDiagonalsMap = new Map<string, number[]>()

for (const group of brandGroups) {
  for (const device of group.devices) {
    if (device.resolution && device.diagonal) {
      const key = `${device.resolution.horizontal}x${device.resolution.vertical}`
      if (!catalogDiagonalsMap.has(key)) {
        catalogDiagonalsMap.set(key, [])
      }
      const list = catalogDiagonalsMap.get(key)!
      if (!list.includes(device.diagonal)) {
        list.push(device.diagonal)
      }
    }
  }
}

/**
 * Returns estimated screen sizes for a given resolution.
 * Checks curated list first, then falls back to catalog devices.
 */
export const getEstimatedScreenSizes = (horizontal: number, vertical: number): number[] => {
  // 1. Check curated overrides first (preserves explicit priorities like 1920x1080 -> [24.5, 25, 23.7])
  const curatedMatch = (curatedResolutions as ResolutionEstimate[]).find(
    (item: ResolutionEstimate) =>
      item.horizontalResolution === horizontal && item.verticalResolution === vertical,
  )
  if (curatedMatch && curatedMatch.screenSizes.length > 0) {
    return curatedMatch.screenSizes
  }

  // 2. Fall back to real-world device diagonals from catalog
  const key = `${horizontal}x${vertical}`
  const catalogSizes = catalogDiagonalsMap.get(key)
  if (catalogSizes && catalogSizes.length > 0) {
    return catalogSizes
  }

  return []
}
