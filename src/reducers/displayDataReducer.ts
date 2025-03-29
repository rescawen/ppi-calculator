import resolutions from "../data/resolutionScreenSizeEstimates.json"

export type DisplayDataState = {
  resolution: { horizontal: number | null; vertical: number | null }
  diagonal: number | null
  pixelPerInch: number
  aspectRatio: { main: string; portrait?: string }
  dimensions: { width: number; height: number }
}

// Define the type for the resolution object
type Resolution = { horizontalResolution: number; verticalResolution: number; screenSizes: number[] }

// get the most likely screen size based on resolution
const getScreenSize = (resolutions: Resolution[], horizontal: number, vertical: number): number[] => {
  const matchedResolution = resolutions.find(
    (resolution: Resolution) =>
      resolution.horizontalResolution === horizontal && resolution.verticalResolution === vertical,
  )
  return matchedResolution ? matchedResolution.screenSizes : []
}

export const roundToTwoDecimals = (value: number): number => parseFloat(value.toFixed(2))

// calculate ppi/dpi based on resolution and screen size
const calculatePixelDensity = (horizontal: number | null, vertical: number | null, diagonal: number | null): number => {
  // Null coalesce null into 0
  const horizontalValue = horizontal ?? 0
  const verticalValue = vertical ?? 0
  const diagonalValue = diagonal ?? 0

  // Check if either resolution is 0
  if (horizontalValue === 0 || verticalValue === 0) {
    return 0
  }
  // Calculate the diagonal resolution using the Pythagorean theorem
  const diagonalResolution = Math.sqrt(horizontalValue ** 2 + verticalValue ** 2)

  // Calculate pixel density (PPI)
  const pixelDensity = diagonalResolution / diagonalValue

  return roundToTwoDecimals(pixelDensity) // Return the calculated pixel density
}

// Calculate aspect ratio as a readable string
const findCommonRatio = (horizontal: number, vertical: number): string | null => {
  const commonRatios: Record<string, number> = {
    "3:4": 3 / 4,
    "16:18": 8 / 9,
    "1:1": 1,
    "23:20": 23 / 20,
    "5:4": 5 / 4,
    "4:3": 4 / 3,
    "IMAX 1.43:1": 1.43,
    "3:2": 3 / 2,
    "5:3": 5 / 3,
    "14:9": 14 / 9,
    "16:10": 16 / 10,
    "16:9": 16 / 9,
    "17:9": 17 / 9,
    "18:9": 2 / 1,
    "19:9": 19 / 9,
    "19.5:9": 39 / 18,
    "20:9": 20 / 9,
    "21:9": 21 / 9,
    "24:10": 24 / 10,
    "32:10": 32 / 10,
    "32:9": 32 / 9,
  }

  const aspectRatio = horizontal / vertical
  const errorMargin = 0.019 // 1.9% error margin

  for (const [ratioName, value] of Object.entries(commonRatios)) {
    if (Math.abs(value / aspectRatio - 1) < errorMargin) {
      return ratioName
    }
  }
  return null
}

// Format a ratio as string when no common ratio is found, TODO: investigate if both values 0.
const formatRatio = (horizontal: number, vertical: number): string => {
  const aspectRatio = horizontal / vertical
  const isLandscape: boolean = horizontal > vertical

  if (isLandscape) {
    return `${roundToTwoDecimals(aspectRatio)}:1`
  } else {
    return `1:${roundToTwoDecimals(vertical / horizontal)}`
  }
}

// TODO: investigate if both values 0.
const calculateAspectRatio = (horizontal: number, vertical: number): { main: string; portrait?: string } => {
  // console.log(`screen ${screen.orientation.type}`) TODO: use this api instead of manually checking for pixels?
  // Check if we're in portrait mode
  const isPortrait: boolean = vertical > horizontal

  // For portrait mode, check if landscape orientation has a common ratio
  if (isPortrait) {
    const landscapeRatio = findCommonRatio(vertical, horizontal)
    const portraitRatio = findCommonRatio(horizontal, vertical)

    if (landscapeRatio) {
      // If landscape has a common ratio, prioritize it
      return { main: landscapeRatio, portrait: formatRatio(horizontal, vertical) }
    } else if (portraitRatio) {
      // If only portrait has a common ratio
      return { main: portraitRatio }
    }
  } else {
    // In landscape mode, just find the ratio normally
    const ratio = findCommonRatio(horizontal, vertical)
    if (ratio) return { main: ratio }
  }

  // No common ratios found, just format the current ratio
  return { main: formatRatio(horizontal, vertical) }
}

// Calculate width and height based on diagonal and resolution, TODO: investigate if both values 0.
const calculateDimensions = (
  horizontal: number | null,
  vertical: number | null,
  diagonal: number | null,
): { width: number; height: number } => {
  // Null coalesce null into 0
  const horizontalValue = horizontal ?? 0
  const verticalValue = vertical ?? 0
  const diagonalValue = diagonal ?? 0

  // Using Pythagorean theorem: width² + height² = diagonal²
  const aspectRatio = horizontalValue / verticalValue
  // Solve for height = √(diagonal² / (1 + aspectRatio²))
  const height = Math.sqrt((diagonalValue * diagonalValue) / (1 + aspectRatio * aspectRatio))
  // Solve for width = aspectRatio * height
  const width = height * aspectRatio

  return { width, height }
}

const calculateInitialValues = () => {
  const devicePixelRatio = window.devicePixelRatio || 1
  const REFERENCE_PPI = 96

  const initialResolution = { horizontal: devicePixelRatio * screen.width, vertical: devicePixelRatio * screen.height }

  const diagonalInches = Math.sqrt(
    (initialResolution.horizontal / REFERENCE_PPI) ** 2 + (initialResolution.vertical / REFERENCE_PPI) ** 2,
  )
  const estimatedScreenSizes = getScreenSize(resolutions, initialResolution.horizontal, initialResolution.vertical)
  const estimatedScreenSize = estimatedScreenSizes[0]

  const initialDiagonal = estimatedScreenSize || diagonalInches
  const initialPixelPerInch = estimatedScreenSize
    ? calculatePixelDensity(initialResolution.horizontal, initialResolution.vertical, estimatedScreenSize)
    : REFERENCE_PPI

  return { initialResolution, initialDiagonal, initialPixelPerInch, estimatedScreenSizes }
}

const { initialResolution, initialDiagonal, initialPixelPerInch, estimatedScreenSizes } = calculateInitialValues()

export { estimatedScreenSizes }

export const initialDisplayDataState: DisplayDataState = {
  resolution: initialResolution,
  diagonal: initialDiagonal,
  pixelPerInch: initialPixelPerInch,
  aspectRatio: calculateAspectRatio(initialResolution.horizontal, initialResolution.vertical),
  dimensions: calculateDimensions(initialResolution.horizontal, initialResolution.vertical, initialDiagonal),
}

// rename to something more descriptive?
export type Action =
  | { type: "SET_RESOLUTION"; payload: DisplayDataState["resolution"] }
  | { type: "SET_DIAGONAL"; payload: DisplayDataState["diagonal"] }
  | { type: "SET_ALL"; payload: { resolution: DisplayDataState["resolution"]; diagonal: DisplayDataState["diagonal"] } }

export const displayDataReducer = (state: DisplayDataState, action: Action): DisplayDataState => {
  switch (action.type) {
    case "SET_RESOLUTION":
      return {
        ...state,
        resolution: action.payload,
        pixelPerInch: calculatePixelDensity(action.payload.horizontal, action.payload.vertical, state.diagonal),
        aspectRatio: calculateAspectRatio(action.payload.horizontal ?? 0, action.payload.vertical ?? 0),
        dimensions: calculateDimensions(action.payload.horizontal, action.payload.vertical, state.diagonal),
      }
    case "SET_DIAGONAL":
      return {
        ...state,
        diagonal: action.payload,
        pixelPerInch: calculatePixelDensity(state.resolution.horizontal, state.resolution.vertical, action.payload),
        dimensions: calculateDimensions(state.resolution.horizontal, state.resolution.vertical, action.payload),
      }
    case "SET_ALL":
      return {
        ...state,
        resolution: action.payload.resolution,
        diagonal: action.payload.diagonal,
        pixelPerInch: calculatePixelDensity(
          action.payload.resolution.horizontal,
          action.payload.resolution.vertical,
          action.payload.diagonal,
        ),
        aspectRatio: calculateAspectRatio(
          action.payload.resolution.horizontal ?? 0,
          action.payload.resolution.vertical ?? 0,
        ),
        dimensions: calculateDimensions(
          action.payload.resolution.horizontal,
          action.payload.resolution.vertical,
          action.payload.diagonal,
        ),
      }
    default:
      return state
  }
}
