import { useReducer, useEffect, useState } from "react"
import Inputs from "./components/Inputs"
import ResolutionBlocks from "./components/ResolutionBlocks"
import { displayDataReducer, initialDisplayDataState } from "../src/reducers/displayDataReducer"

function App() {
  const [displayData, dispatch] = useReducer(displayDataReducer, initialDisplayDataState)

  const [isDefaultDisplayDataChanged, setIsDefaultDisplayDataChanged] = useState<boolean>(false)

  useEffect(() => {
    // Check if displayData has changed from the initial state
    const hasChanged: boolean =
      displayData.resolution.horizontal !== initialDisplayDataState.resolution.horizontal ||
      displayData.resolution.vertical !== initialDisplayDataState.resolution.vertical ||
      displayData.diagonal !== initialDisplayDataState.diagonal

    setIsDefaultDisplayDataChanged(hasChanged)
  }, [displayData])

  return (
    <>
      <Inputs displayData={displayData} dispatch={dispatch} isDefaultDisplayDataChanged={isDefaultDisplayDataChanged} />
      <ResolutionBlocks dispatch={dispatch} />
    </>
  )
}

export default App
