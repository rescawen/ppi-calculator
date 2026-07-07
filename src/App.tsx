"use client"

import { useReducer, useEffect, useState } from "react"
import Inputs from "./components/Inputs"
import ResolutionBlocks from "./components/ResolutionBlocks"
import Header from "./components/Header"
import { displayDataReducer, DisplayDataState, getEstimatedScreenSizes, initialDisplayDataState } from "./reducers/displayDataReducer"
import { parseDisplayParams } from "./utils/displayParams"

const writeDisplayParamsToUrl = (displayData: DisplayDataState) => {
  const params = `horizontal=${displayData.resolution.horizontal ?? 0}/vertical=${displayData.resolution.vertical ?? 0}/diagonal=${displayData.diagonal ?? 0}`
  window.history.replaceState(null, "", `?${params}`)
}

function Calculator({ initialDisplayData }: { initialDisplayData: DisplayDataState }) {
  const [displayData, dispatch] = useReducer(displayDataReducer, initialDisplayData)
  const [defaultDisplayData] = useState(initialDisplayData)
  const [isDefaultDisplayDataChanged, setIsDefaultDisplayDataChanged] = useState<boolean>(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [estimatedScreenSizes] = useState<number[]>(
    getEstimatedScreenSizes(
      initialDisplayData.resolution.horizontal ?? 0,
      initialDisplayData.resolution.vertical ?? 0,
    ),
  )

  useEffect(() => {
    const urlDisplayParams = parseDisplayParams(window.location.search)

    if (urlDisplayParams) {
      setIsInitialized(true)
      return
    }

    setIsInitialized(true)
  }, [])

  // Sync internal state to URL whenever displayData changes
  useEffect(() => {
    if (isInitialized) {
      writeDisplayParamsToUrl(displayData)
    }

    // Check if values have changed from initial state
    const hasChanged =
      displayData.resolution.horizontal !== defaultDisplayData.resolution.horizontal ||
      displayData.resolution.vertical !== defaultDisplayData.resolution.vertical ||
      displayData.diagonal !== defaultDisplayData.diagonal

    setIsDefaultDisplayDataChanged(hasChanged)
  }, [defaultDisplayData, displayData, isInitialized])

  return (
    <>
      <Header dispatch={dispatch} defaultDisplayData={defaultDisplayData} />
      <Inputs
        displayData={displayData}
        dispatch={dispatch}
        estimatedScreenSizes={estimatedScreenSizes}
        isDefaultDisplayDataChanged={isDefaultDisplayDataChanged}
      />
      <ResolutionBlocks dispatch={dispatch} />
    </>
  )
}

function App({ initialDisplayData = initialDisplayDataState }: { initialDisplayData?: DisplayDataState }) {
  return <Calculator initialDisplayData={initialDisplayData} />
}

export default App
