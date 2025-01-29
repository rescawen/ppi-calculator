export const borderClasses: string = "border rounded border-solid border-black"

// Define the interface for the resolution object
export interface Resolution {
    horizontalResolution: number
    verticalResolution: number
    screenSizes: number[]
}

// get the most likely screen size based on resolution
export const getScreenSize = (resolutions: Resolution[], horizontal: number, vertical: number): number | null => {
    const matchedResolution = resolutions.find(resolution => 
        resolution["horizontalResolution"] === horizontal && 
        resolution["verticalResolution"] === vertical
    )

    return matchedResolution ? matchedResolution["screenSizes"][0] : null // Return the first screen size or null if no match
}

export const roundToTwoDecimals = (value: number): number => parseFloat(value.toFixed(2))


// calculate ppi/dpi based on resolution and screen size

export const calculatePixelDensity = (horizontalResolution: number, verticalResolution: number, diagonalInches: number): number => {
    // Calculate the diagonal resolution using the Pythagorean theorem
    const diagonalResolution = Math.sqrt(horizontalResolution ** 2 + verticalResolution ** 2)
    
    // Calculate pixel density (PPI)
    const pixelDensity = diagonalResolution / diagonalInches
    
    return roundToTwoDecimals(pixelDensity) // Return the calculated pixel density
}