import resolutions from "../data/example.json"

interface DisplayDataState {
  resolution: { horizontal: number; vertical: number }
  diagonal: number
  pixelPerInch: number
  aspectRatio: { main: string; portrait?: string }
}

const ratio = window.devicePixelRatio || 1

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

  const ratio = horizontal / vertical
  for (const [ratioName, value] of Object.entries(commonRatios)) {
    if (Math.abs(value / ratio - 1) < 0.016) {
      // 1.6% error margin
      return ratioName
    }
  }
  return null
}

// Format a ratio as string when no common ratio is found
const formatRatio = (h: number, v: number): string => {
  const r = h / v
  if (h > v) {
    return `${roundToTwoDecimals(r)}:1`
  } else {
    return `1:${roundToTwoDecimals(v / h)}`
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

const calculateInitialValues = () => {
  const initialResolution = { horizontal: ratio * screen.width, vertical: ratio * screen.height }

  const diagonalInches = Math.sqrt((initialResolution.horizontal / 96) ** 2 + (initialResolution.vertical / 96) ** 2)
  estimatedScreenSizes = getScreenSize(resolutions, initialResolution.horizontal, initialResolution.vertical)
  const estimatedScreenSize = estimatedScreenSizes[0]

  const initialDiagonal = estimatedScreenSize || diagonalInches
  const initialPixelPerInch = estimatedScreenSize
    ? calculatePixelDensity(initialResolution.horizontal, initialResolution.vertical, estimatedScreenSize)
    : 96
  const initialAspectRatio = calculateAspectRatio(initialResolution.horizontal, initialResolution.vertical)

  return { initialResolution, initialDiagonal, initialPixelPerInch, initialAspectRatio }
}

const { initialResolution, initialDiagonal, initialPixelPerInch, initialAspectRatio } = calculateInitialValues()

const initialDisplayDataState: DisplayDataState = {
  resolution: { horizontal: initialResolution.horizontal, vertical: initialResolution.vertical },
  diagonal: initialDiagonal,
  pixelPerInch: initialPixelPerInch,
  aspectRatio: initialAspectRatio,
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
      }
    case "SET_DIAGONAL":
      return {
        ...state,
        diagonal: action.payload,
        pixelPerInch: calculatePixelDensity(state.resolution.horizontal, state.resolution.vertical, action.payload),
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
      }
    default:
      return state
  }
}

export { initialDisplayDataState, displayDataReducer, estimatedScreenSizes }
export type { DisplayDataState, Action }
