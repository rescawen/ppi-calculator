import resolutions from '../data/example.json'


interface DisplayDataState {
    resolution: { horizontal: number; vertical: number }
    diagonal: number
    pixelPerInch: number
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
  const matchedResolution = resolutions.find(resolution => 
      resolution["horizontalResolution"] === horizontal && 
      resolution["verticalResolution"] === vertical
  )

  return matchedResolution ? matchedResolution["screenSizes"] : [] // Return the first screen size or null if no match
}

const roundToTwoDecimals = (value: number): number => parseFloat(value.toFixed(2))

// calculate ppi/dpi based on resolution and screen size
const calculatePixelDensity = (horizontalResolution: number, verticalResolution: number, diagonalInches: number): number => {
    // Calculate the diagonal resolution using the Pythagorean theorem
    const diagonalResolution = Math.sqrt(horizontalResolution ** 2 + verticalResolution ** 2)
    
    // Calculate pixel density (PPI)
    const pixelDensity = diagonalResolution / diagonalInches
    
    return roundToTwoDecimals(pixelDensity) // Return the calculated pixel density
}

const calculateInitialValues = () => {
  const initialResolution = {
    horizontal: ratio * screen.width,
    vertical: ratio * screen.height,
  }

  const diagonalInches = Math.sqrt((initialResolution.horizontal / 96) ** 2 + (initialResolution.vertical / 96) ** 2)
  estimatedScreenSizes = getScreenSize(resolutions, initialResolution.horizontal, initialResolution.vertical)
  const estimatedScreenSize = estimatedScreenSizes[0]

  const initialDiagonal = estimatedScreenSize || diagonalInches
  const initialPixelPerInch = estimatedScreenSize ? calculatePixelDensity(initialResolution.horizontal, initialResolution.vertical, estimatedScreenSize) : 96

  return { initialResolution, initialDiagonal, initialPixelPerInch }
}

const { initialResolution, initialDiagonal, initialPixelPerInch } = calculateInitialValues()

const initialDisplayDataState: DisplayDataState = {
    resolution: { 
      horizontal: initialResolution.horizontal,
      vertical: initialResolution.vertical
    },
    diagonal: initialDiagonal,
    pixelPerInch: initialPixelPerInch,
}

// rename to something more descriptive?
type Action =
  | { type: 'SET_RESOLUTION'; payload: DisplayDataState['resolution'] }
  | { type: 'SET_DIAGONAL'; payload: DisplayDataState['diagonal'] }
  | { type: 'SET_ALL'; payload: { resolution: DisplayDataState['resolution'], diagonal: DisplayDataState['diagonal'] } }

const displayDataReducer = (state: DisplayDataState, action: Action): DisplayDataState => {
  switch (action.type) {
      case 'SET_RESOLUTION':
          return {
              ...state,
              resolution: action.payload,
              pixelPerInch: calculatePixelDensity(action.payload.horizontal, action.payload.vertical, state.diagonal),
          }
      case 'SET_DIAGONAL':
          return {
              ...state,
              diagonal: action.payload,
              pixelPerInch: calculatePixelDensity(state.resolution.horizontal, state.resolution.vertical, action.payload),
          }
      case 'SET_ALL':
          return {
              ...state,
              resolution: action.payload.resolution,
              diagonal: action.payload.diagonal,
              pixelPerInch: calculatePixelDensity(action.payload.resolution.horizontal, action.payload.resolution.vertical, action.payload.diagonal),
          }
      default:
          return state
  }
}
  
export { initialDisplayDataState, displayDataReducer, estimatedScreenSizes }
export type { DisplayDataState, Action }