"use client"

import { useCallback, useEffect, useReducer, useState } from "react"
import Inputs from "./components/Inputs"
import ResolutionBlocks from "./components/ResolutionBlocks"
import Header from "./components/Header"
import CompareBox, { type CompareHistoryItem } from "./components/CompareBox"
import {
  displayDataReducer,
  DisplayDataState,
  getEstimatedScreenSizes,
  initialDisplayDataState,
} from "./reducers/displayDataReducer"
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
  const [compareHistory, setCompareHistory] = useState<CompareHistoryItem[]>([])
  const [estimatedScreenSizes] = useState<number[]>(
    getEstimatedScreenSizes(initialDisplayData.resolution.horizontal ?? 0, initialDisplayData.resolution.vertical ?? 0),
  )

  const handleCompareSelection = useCallback((item: CompareHistoryItem) => {
    setCompareHistory((previousHistory) => {
      const itemKey = `${item.resolution.horizontal}x${item.resolution.vertical}-${item.diagonal}-${item.label}`
      const dedupedHistory = previousHistory.filter(
        (historyItem) =>
          `${historyItem.resolution.horizontal}x${historyItem.resolution.vertical}-${historyItem.diagonal}-${historyItem.label}` !==
          itemKey,
      )

      return [item, ...dedupedHistory].slice(0, 4)
    })
  }, [])

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
      <div className="flex flex-wrap items-start justify-between gap-6 xl:flex-nowrap">
        <div>
          <Header dispatch={dispatch} defaultDisplayData={defaultDisplayData} />
          <Inputs
            displayData={displayData}
            dispatch={dispatch}
            estimatedScreenSizes={estimatedScreenSizes}
            isDefaultDisplayDataChanged={isDefaultDisplayDataChanged}
          />
        </div>
        <CompareBox compareHistory={compareHistory} />
      </div>
      <ResolutionBlocks dispatch={dispatch} onCompareSelection={handleCompareSelection} />
    </>
  )
}

function App({ initialDisplayData = initialDisplayDataState }: { initialDisplayData?: DisplayDataState }) {
  return <Calculator initialDisplayData={initialDisplayData} />
}

export default App
