import { useState } from 'react'
import { borderClasses, getScreenSize, calculatePixelDensity } from '../utils/utils'
import resolutions from '../data/example.json'

function Inputs() {
  const ratio = window.devicePixelRatio || 1

  const calculateInitialValues = () => {
    const initialResolution = {
      horizontal: ratio * screen.width,
      vertical: ratio * screen.height,
    }

    const diagonalInches = Math.sqrt((initialResolution.horizontal / 96) ** 2 + (initialResolution.vertical / 96) ** 2)
    const estimatedScreenSize = getScreenSize(resolutions, initialResolution.horizontal, initialResolution.vertical)

    const initialDiagonal = estimatedScreenSize || diagonalInches
    const initialPixelPerInch = estimatedScreenSize ? calculatePixelDensity(initialResolution.horizontal, initialResolution.vertical, estimatedScreenSize) : 96

    return { initialResolution, initialDiagonal, initialPixelPerInch }
  }

  const { initialResolution, initialDiagonal, initialPixelPerInch } = calculateInitialValues()

  const [resolution, setResolution] = useState<{ horizontal: number, vertical: number }>(initialResolution)
  const [diagonal, setDiagonal] = useState<number>(initialDiagonal)
  const [pixelPerInch, setPixelPerInch] = useState<number>(initialPixelPerInch)

  // console.log(`screen ${screen.orientation.type}`)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, dimension: 'horizontal' | 'vertical' | 'diagonal') => {
    const value = Number(e.target.value);
    if (dimension === 'horizontal' || dimension === 'vertical') {
      setResolution(prev => {
        const newResolution = {
          ...prev,
          [dimension]: value // Update the specific dimension
        };
        setPixelPerInch(calculatePixelDensity(newResolution.horizontal, newResolution.vertical, diagonal));
        return newResolution;
      });
    } else {
      setDiagonal(value); // Set diagonal directly
      setPixelPerInch(calculatePixelDensity(resolution.horizontal, resolution.vertical, value));
    }
  }

  return (
    <div className={`${borderClasses} grid grid-cols-3 lg:max-w-3xl p-2 m-2`}>
      <div data-testid="inputs" className="col-span-2 grid grid-cols-1 sm:grid-cols-11 w-full sm:max-w-md">
        <div className="col-span-4">
          <label>Horizontal resolution:</label>
        </div>
        <div className="col-span-7">
          <input
            type="number"
            className="border-2 border-gray-300 rounded-md mr-2"
            value={resolution.horizontal}
            onChange={(e) => handleChange(e, 'horizontal')}
          />
          <span>pixels</span>
        </div>

        <div className="col-span-4">
          <label>Vertical resolution:</label>
        </div>
        <div className="col-span-7">
          <input
            type="number"
            className="border-2 border-gray-300 rounded-md mr-2"
            value={resolution.vertical}
            onChange={(e) => handleChange(e, 'vertical')}
          />
          <span>pixels</span>
        </div>

        <div className="col-span-4">
          <label>Diagonal:</label>
        </div>
        <div className="col-span-7">
          <input
            type="number"
            className="border-2 border-gray-300 rounded-md mr-2"
            value={diagonal}
            onChange={(e) => handleChange(e, 'diagonal')}
          />
          <span>inches</span>
        </div>
      </div>

      <div className="col-span-1 grid">
        <div>
          Total pixels: {resolution.horizontal * resolution.vertical}
        </div>
        <div>
          Pixel density: {pixelPerInch}
        </div>
        <div>
          Aspect ratio: tbd
        </div>
      </div>
    </div>
  )
}

export default Inputs