import { useReducer, useEffect, useState } from "react"
import { useQueryState } from "nuqs"
import Inputs from "./components/Inputs"
import ResolutionBlocks from "./components/ResolutionBlocks"
import Header from "./components/Header"
import CompareBox from "./components/CompareBox"
import { displayDataReducer, initialDisplayDataState, DisplayDataState } from "../src/reducers/displayDataReducer"

function App() {
  const [displayData, dispatch] = useReducer(displayDataReducer, initialDisplayDataState)
  const [isDefaultDisplayDataChanged, setIsDefaultDisplayDataChanged] = useState<boolean>(false)
  const [compareHistory, setCompareHistory] = useState<DisplayDataState[]>([])

  console.log(displayData)

  // URL state management with a single query parameter
  const [, setDisplayParams] = useQueryState("", {
    defaultValue: {
      horizontal: initialDisplayDataState.resolution.horizontal ?? 0,
      vertical: initialDisplayDataState.resolution.vertical ?? 0,
      diagonal: initialDisplayDataState.diagonal ?? 0,
    },
    parse: (value) => {
      // Check if we have all three parameters in the correct format
      const parts = value.split("/")
      if (
        parts.length === 3 &&
        parts[0].startsWith("horizontal=") &&
        parts[1].startsWith("vertical=") &&
        parts[2].startsWith("diagonal=")
      ) {
        // Check if each part has a valid number after =
        const [horizontal, vertical, diagonal] = parts.map((param) => {
          const [, val] = param.split("=")
          const num = parseInt(val, 10)
          return isNaN(num) ? null : num
        })

        // Only proceed if all values are valid numbers
        if (horizontal !== null && vertical !== null && diagonal !== null) {
          // On initial load, update internal state with URL values
          dispatch({ type: "SET_ALL", payload: { resolution: { horizontal, vertical }, diagonal } })
          return { horizontal, vertical, diagonal }
        }
      }
      // Fallback to default if format doesn't match or numbers are invalid
      return {
        horizontal: initialDisplayDataState.resolution.horizontal ?? 0,
        vertical: initialDisplayDataState.resolution.vertical ?? 0,
        diagonal: initialDisplayDataState.diagonal ?? 0,
      }
    },
    serialize: (value) => `horizontal=${value.horizontal}/vertical=${value.vertical}/diagonal=${value.diagonal}`,
    history: "replace",
  })

  // Sync internal state to URL whenever displayData changes
  useEffect(() => {
    setDisplayParams({
      horizontal: displayData.resolution.horizontal ?? 0,
      vertical: displayData.resolution.vertical ?? 0,
      diagonal: displayData.diagonal ?? 0,
    })

    // Check if values have changed from initial state
    const hasChanged =
      displayData.resolution.horizontal !== initialDisplayDataState.resolution.horizontal ||
      displayData.resolution.vertical !== initialDisplayDataState.resolution.vertical ||
      displayData.diagonal !== initialDisplayDataState.diagonal

    setIsDefaultDisplayDataChanged(hasChanged)

    // Add to compare history if it's a valid selection
    if (hasChanged) {
      setCompareHistory((prev) => {
        const newHistory = [displayData, ...prev].slice(0, 4)
        return newHistory
      })
    }
  }, [displayData])

  return (
    <>
      <div className="flex">
        <div>
          <Header dispatch={dispatch} />
          <Inputs
            displayData={displayData}
            dispatch={dispatch}
            isDefaultDisplayDataChanged={isDefaultDisplayDataChanged}
          />
        </div>
        <CompareBox compareHistory={compareHistory} />
      </div>
      <ResolutionBlocks dispatch={dispatch} />
    </>
  )
}

export default App
