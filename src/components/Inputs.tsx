import type { Dispatch, ChangeEvent } from "react"
import { borderClasses, formatNumberWithThousandsSeparator } from "../utils/utils"
import { DisplayDataState, Action, estimatedScreenSizes, roundToTwoDecimals } from "../reducers/displayDataReducer"
import { Tooltip } from "./Tooltip"

function Inputs({
  displayData,
  dispatch,
  isDefaultDisplayDataChanged,
}: {
  displayData: DisplayDataState
  dispatch: Dispatch<Action>
  isDefaultDisplayDataChanged: boolean
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>, dimension: "horizontal" | "vertical" | "diagonal") => {
    const value = e.target.value // This is always a string

    // If the input is empty, set it to an empty string
    if (value === "") {
      if (dimension === "horizontal" || dimension === "vertical") {
        const newResolution = { ...displayData.resolution, [dimension]: null }
        dispatch({ type: "SET_RESOLUTION", payload: newResolution })
      } else if (dimension === "diagonal") {
        dispatch({ type: "SET_DIAGONAL", payload: null })
      }
    } else {
      // Empty string ("") would be parsed as 0.
      // It cannot be parsed before conditional since manually entering 0 would set value as empty.
      const parsedValue = Number(value)
      if (dimension === "horizontal" || dimension === "vertical") {
        const newResolution = { ...displayData.resolution, [dimension]: parsedValue }
        dispatch({ type: "SET_RESOLUTION", payload: newResolution })
      } else {
        dispatch({ type: "SET_DIAGONAL", payload: parsedValue })
      }
    }
  }

  return (
    <div className={`${borderClasses} grid grid-cols-3 lg:max-w-3xl p-2 m-2`}>
      {/* <div data-testid="inputs" className="col-span-2 grid grid-cols-1 sm:grid-cols-3 w-full sm:max-w-md"> TODO: Check for w-full sm:max-w-md use cases? */}
      <div data-testid="inputs-container" className="col-span-2 grid grid-cols-1 sm:grid-cols-3">
        <div className="col-span-1">
          <label>Horizontal resolution:</label>
        </div>
        <div className="col-span-2">
          <input
            type="number"
            min="0"
            className="border-2 border-gray-300 rounded-md mr-2 text-right"
            value={displayData.resolution.horizontal ?? ""}
            onChange={(e) => handleChange(e, "horizontal")}
            data-testid="horizontal-resolution-input"
          />
          <span>pixels</span>
        </div>

        <div className="col-span-1">
          <label>Vertical resolution:</label>
        </div>
        <div className="col-span-2">
          <input
            type="number"
            min="0"
            className="border-2 border-gray-300 rounded-md mr-2 text-right"
            value={displayData.resolution.vertical ?? ""}
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
            min="0"
            step="0.1"
            className="border-2 border-gray-300 rounded-md mr-2 text-right"
            value={displayData.diagonal ?? ""}
            onChange={(e) => handleChange(e, "diagonal")}
          />
          <span>inches ({roundToTwoDecimals(displayData.diagonal ? displayData.diagonal * 2.54 : 0)}cm)</span>
        </div>
      </div>

      <div className="col-span-1 grid">
        <div>
          Megapixels:
          <Tooltip
            content={`${formatNumberWithThousandsSeparator((displayData.resolution.horizontal ?? 0) * (displayData.resolution.vertical ?? 0))} pixels`}
          >
            <span className="font-semibold">
              {" "}
              {roundToTwoDecimals(
                ((displayData.resolution.horizontal ?? 0) * (displayData.resolution.vertical ?? 0)) / 1000000,
              )}
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
        <div className="min-h-6">
          {!isDefaultDisplayDataChanged ? (
            estimatedScreenSizes.length > 1 ? (
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
            )
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="col-span-3 mt-1.5 font-semibold" data-testid="calculation-results">
        <span className="font-normal">Display size: </span>
        <Tooltip
          content={`${roundToTwoDecimals(displayData.dimensions.width)}" x ${roundToTwoDecimals(displayData.dimensions.height)}" = ${roundToTwoDecimals(displayData.dimensions.width * displayData.dimensions.height)}in²`}
        >
          <span data-testid="width-dimension">{roundToTwoDecimals(displayData.dimensions.width * 2.54)}cm </span>x
          <span data-testid="height-dimension"> {roundToTwoDecimals(displayData.dimensions.height * 2.54)}cm = </span>
          <span data-testid="area-dimension">
            {roundToTwoDecimals(displayData.dimensions.width * displayData.dimensions.height * 2.54 * 2.54)}cm²
          </span>
        </Tooltip>
        <span> at </span>
        <span data-testid="ppi-result">
          <span className="font-bold text-rose-700">{displayData.pixelPerInch}</span> PPI
        </span>
        <span>
          , {displayData.pixelPerInch !== 0 ? <span>{(25.4 / displayData.pixelPerInch).toFixed(4)}mm </span> : "∞mm "}
        </span>
        <a
          className="font-medium text-blue-600 cursor-pointer underline hover:text-purple-700"
          href="https://en.wikipedia.org/wiki/Dot_pitch"
        >
          dot pitch
        </a>
        , <span>{(displayData.pixelPerInch * displayData.pixelPerInch).toFixed(0)} PPI²</span>
      </div>
    </div>
  )
}

export default Inputs
