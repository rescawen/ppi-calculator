import type { Dispatch } from "react"
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
      {/* <div data-testid="inputs" className="col-span-2 grid grid-cols-1 sm:grid-cols-3 w-full sm:max-w-md"> TODO: Check for w-full sm:max-w-md use cases? */}
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
      <div className="col-span-3 mt-1.5">
        Display size:{" "}
        <Tooltip
          content={`${roundToTwoDecimals(displayData.dimensions.width)}" x ${roundToTwoDecimals(displayData.dimensions.height)}" = ${roundToTwoDecimals(displayData.dimensions.width * displayData.dimensions.height)}in²`}
        >
          <span className="font-semibold">
            {roundToTwoDecimals(displayData.dimensions.width * 2.54)}cm x{" "}
            {roundToTwoDecimals(displayData.dimensions.height * 2.54)}cm ={" "}
            {roundToTwoDecimals(displayData.dimensions.width * displayData.dimensions.height * 2.54 * 2.54)}cm²
          </span>
        </Tooltip>{" "}
        at <span className="font-bold text-rose-700">{displayData.pixelPerInch}</span>
        <span className="font-semibold"> PPI</span>,{" "}
        <span className="font-semibold">{(25.4 / displayData.pixelPerInch).toFixed(4)}mm </span>
        <a
          className="font-medium text-blue-600 cursor-pointer underline hover:text-purple-700"
          href="https://en.wikipedia.org/wiki/Dot_pitch"
        >
          dot pitch
        </a>
        , <span className="font-semibold">{(displayData.pixelPerInch * displayData.pixelPerInch).toFixed(0)} PPI²</span>
      </div>
    </div>
  )
}

export default Inputs
