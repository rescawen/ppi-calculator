import type { Dispatch } from "react"
import { borderClasses, formatNumberWithThousandsSeparator } from "../utils/utils"
import { DisplayDataState, Action, estimatedScreenSizes, roundToTwoDecimals } from "../reducers/displayDataReducer"
import { Tooltip } from "./Tooltip"

function Inputs({ displayData, dispatch }: { displayData: DisplayDataState; dispatch: Dispatch<Action> }) {
  // console.log(`screen ${screen.orientation.type}`)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, dimension: "horizontal" | "vertical" | "diagonal") => {
    const value = Number(e.target.value)
    if (dimension === "horizontal" || dimension === "vertical") {
      const newResolution = { ...displayData.resolution, [dimension]: value }
      dispatch({ type: "SET_RESOLUTION", payload: newResolution })
    } else {
      dispatch({ type: "SET_DIAGONAL", payload: value })
    }
  }

  return (
    <div className={`${borderClasses} grid grid-cols-3 lg:max-w-3xl p-2 m-2`}>
      {/* <div data-testid="inputs" className="col-span-2 grid grid-cols-1 sm:grid-cols-3 w-full sm:max-w-md"> */}
      <div data-testid="inputs" className="col-span-2 grid grid-cols-1 sm:grid-cols-3">
        <div className="col-span-1">
          <label>Horizontal resolution:</label>
        </div>
        <div className="col-span-2">
          <input
            type="number"
            className="border-2 border-gray-300 rounded-md mr-2"
            value={displayData.resolution.horizontal}
            onChange={(e) => handleChange(e, "horizontal")}
          />
          <span>pixels</span>
        </div>

        <div className="col-span-1">
          <label>Vertical resolution:</label>
        </div>
        <div className="col-span-2">
          <input
            type="number"
            className="border-2 border-gray-300 rounded-md mr-2"
            value={displayData.resolution.vertical}
            onChange={(e) => handleChange(e, "vertical")}
          />
          <span>pixels</span>
        </div>

        <div className="col-span-1">
          <label>Diagonal:</label>
        </div>
        <div className="col-span-2">
          <input
            type="number"
            className="border-2 border-gray-300 rounded-md mr-2"
            value={displayData.diagonal}
            onChange={(e) => handleChange(e, "diagonal")}
          />
          <span>inches ({roundToTwoDecimals(displayData.diagonal * 2.54)}cm)</span>
        </div>
      </div>

      <div className="col-span-1 grid">
        <div>
          Megapixels:
          <Tooltip
            content={`${formatNumberWithThousandsSeparator(displayData.resolution.horizontal * displayData.resolution.vertical)} pixels`}
          >
            <span className="font-semibold">
              {" "}
              {roundToTwoDecimals((displayData.resolution.horizontal * displayData.resolution.vertical) / 1000000)}
            </span>
          </Tooltip>
        </div>
        <div>
          Aspect ratio:
          {displayData.aspectRatio.portrait ? (
            <Tooltip content={`${displayData.aspectRatio.portrait} in portrait`}>
              <span className="font-semibold"> {displayData.aspectRatio.main}</span>
            </Tooltip>
          ) : (
            <span className="font-semibold"> {displayData.aspectRatio.main}</span>
          )}
        </div>
        <div>
          {estimatedScreenSizes.length > 1 ? (
            <>
              Is your screen size{" "}
              {estimatedScreenSizes.slice(1).map((alternateScreenSize, index) => (
                <span key={index}>
                  <span
                    onClick={() => {
                      dispatch({ type: "SET_DIAGONAL", payload: alternateScreenSize })
                    }}
                    className="text-blue-600 cursor-pointer underline"
                  >
                    {alternateScreenSize}
                  </span>
                  {index < estimatedScreenSizes.length - 2 ? ", " : ""}
                </span>
              ))}
              ?
            </>
          ) : (
            <>Your resolution is unique.</>
          )}
        </div>
      </div>
      <div>
        Pixel density: <span className="font-semibold text-rose-700">{displayData.pixelPerInch}</span>
      </div>
    </div>
  )
}

export default Inputs
