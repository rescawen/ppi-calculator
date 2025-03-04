import resolutions from "../data/example.json"

interface DisplayDataState {
  resolution: { horizontal: number; vertical: number }
  diagonal: number
  pixelPerInch: number
  aspectRatio: { main: string; portrait?: string }
  dimensions: { width: number; height: number }
}

let estimatedScreenSizes: number[] = []

// Define the interface for the resolution object
interface Resolution {
  horizontalResolution: number
  verticalResolution: number
  screenSizes: number[]
}

// get the most likely screen size based on resolution
const getScreenSize = (resolutions: Resolution[], horizontal: number, vertical: number): number[] => {
  const matchedResolution = resolutions.find(
    (resolution) => resolution["horizontalResolution"] === horizontal && resolution["verticalResolution"] === vertical,
  )

  return matchedResolution ? matchedResolution["screenSizes"] : [] // Return the first screen size or null if no match
}

export const roundToTwoDecimals = (value: number): number => parseFloat(value.toFixed(2))

// calculate ppi/dpi based on resolution and screen size
const calculatePixelDensity = (
  horizontalResolution: number,
  verticalResolution: number,
  diagonalInches: number,
): number => {
  // Calculate the diagonal resolution using the Pythagorean theorem
  const diagonalResolution = Math.sqrt(horizontalResolution ** 2 + verticalResolution ** 2)

  // Calculate pixel density (PPI)
  const pixelDensity = diagonalResolution / diagonalInches

  return roundToTwoDecimals(pixelDensity) // Return the calculated pixel density
}

// Calculate aspect ratio as a readable string
const findCommonRatio = (horizontal: number, vertical: number): string | null => {
  const commonRatios: Record<string, number> = {
    "3:4": 3 / 4,
    "16:18": 8 / 9,
    "1:1": 1,
    "5:4": 5 / 4,
    "4:3": 4 / 3,
    "IMAX 1.43:1": 1.43,
    "3:2": 3 / 2,
    "5:3": 5 / 3,
    "14:9": 14 / 9,
    "16:10": 16 / 10,
    "16:9": 16 / 9,
    "17:9": 17 / 9,
    "19.5:9": 39 / 18,
    "20:9": 20 / 9,
    "21:9": 21 / 9,
    "24:10": 24 / 10,
    "32:10": 32 / 10,
    "32:9": 32 / 9,
  }

  const aspectRatio = horizontal / vertical
  for (const [ratioName, value] of Object.entries(commonRatios)) {
    if (Math.abs(value / aspectRatio - 1) < 0.016) {
      // 1.6% error margin
      return ratioName
    }
  }
  return null
}

// Format a ratio as string when no common ratio is found
const formatRatio = (horizontal: number, vertical: number): string => {
  const aspectRatio = horizontal / vertical

  const isLandscape: boolean = horizontal > vertical

  if (isLandscape) {
    return `${roundToTwoDecimals(aspectRatio)}:1`
  } else {
    return `1:${roundToTwoDecimals(vertical / horizontal)}`
  }
}

const calculateAspectRatio = (horizontal: number, vertical: number): { main: string; portrait?: string } => {
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

// Calculate width and height based on diagonal and resolution
const calculateDimensions = (
  horizontal: number,
  vertical: number,
  diagonal: number,
): { width: number; height: number } => {
  const aspectRatio = horizontal / vertical

  // Using Pythagorean theorem: width² + height² = diagonal²
  // And aspect ratio: width = aspectRatio * height
  // Solve for height: height = √(diagonal² / (1 + aspectRatio²))
  const height = Math.sqrt((diagonal * diagonal) / (1 + aspectRatio * aspectRatio))
  const width = height * aspectRatio

  return { width, height }
}

const calculateInitialValues = () => {
  const devicePixelRatio = window.devicePixelRatio || 1

  const initialResolution = { horizontal: devicePixelRatio * screen.width, vertical: devicePixelRatio * screen.height }

  const diagonalInches = Math.sqrt((initialResolution.horizontal / 96) ** 2 + (initialResolution.vertical / 96) ** 2)
  estimatedScreenSizes = getScreenSize(resolutions, initialResolution.horizontal, initialResolution.vertical)
  const estimatedScreenSize = estimatedScreenSizes[0]

  const initialDiagonal = estimatedScreenSize || diagonalInches
  const initialPixelPerInch = estimatedScreenSize
    ? calculatePixelDensity(initialResolution.horizontal, initialResolution.vertical, estimatedScreenSize)
    : 96

  return { initialResolution, initialDiagonal, initialPixelPerInch }
}

const { initialResolution, initialDiagonal, initialPixelPerInch } = calculateInitialValues()

const initialDisplayDataState: DisplayDataState = {
  resolution: { horizontal: initialResolution.horizontal, vertical: initialResolution.vertical },
  diagonal: initialDiagonal,
  pixelPerInch: initialPixelPerInch,
  aspectRatio: calculateAspectRatio(initialResolution.horizontal, initialResolution.vertical),
  dimensions: calculateDimensions(initialResolution.horizontal, initialResolution.vertical, initialDiagonal),
}

// rename to something more descriptive?
type Action =
  | { type: "SET_RESOLUTION"; payload: DisplayDataState["resolution"] }
  | { type: "SET_DIAGONAL"; payload: DisplayDataState["diagonal"] }
  | { type: "SET_ALL"; payload: { resolution: DisplayDataState["resolution"]; diagonal: DisplayDataState["diagonal"] } }

const displayDataReducer = (state: DisplayDataState, action: Action): DisplayDataState => {
  switch (action.type) {
    case "SET_RESOLUTION":
      return {
        ...state,
        resolution: action.payload,
        pixelPerInch: calculatePixelDensity(action.payload.horizontal, action.payload.vertical, state.diagonal),
        aspectRatio: calculateAspectRatio(action.payload.horizontal, action.payload.vertical),
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
        aspectRatio: calculateAspectRatio(action.payload.resolution.horizontal, action.payload.resolution.vertical),
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

export { initialDisplayDataState, displayDataReducer, estimatedScreenSizes }
export type { DisplayDataState, Action }
