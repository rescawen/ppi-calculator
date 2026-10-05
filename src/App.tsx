"use client"

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
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

import { detectCurrentDisplay } from "./utils/displayDetector"

const writeDisplayParamsToUrl = (displayData: DisplayDataState) => {
  const params = `horizontal=${displayData.resolution.horizontal ?? 0}/vertical=${displayData.resolution.vertical ?? 0}/diagonal=${displayData.diagonal ?? 0}`
  window.history.replaceState(null, "", `?${params}`)
}

function Calculator({ initialDisplayData }: { initialDisplayData: DisplayDataState }) {
  const [displayData, dispatch] = useReducer(displayDataReducer, initialDisplayData)
  const [defaultDisplayData, setDefaultDisplayData] = useState<DisplayDataState>(initialDisplayData)
  const [compareHistory, setCompareHistory] = useState<CompareHistoryItem[]>([])
  const estimatedScreenSizes = useMemo(
    () =>
      getEstimatedScreenSizes(
        displayData.resolution.horizontal ?? 0,
        displayData.resolution.vertical ?? 0,
      ),
    [displayData.resolution.horizontal, displayData.resolution.vertical],
  )

  // Auto-detect current display on mount if no URL parameters were provided
  useEffect(() => {
    const hasUrlParams = typeof window !== "undefined" && Boolean(window.location.search)
    if (!hasUrlParams) {
      detectCurrentDisplay({ requestPermission: false }).then((detected) => {
        if (detected) {
          const newDisplayState = {
            resolution: { horizontal: detected.horizontal, vertical: detected.vertical },
            diagonal: detected.diagonal,
          }
          dispatch({
            type: "SET_ALL",
            payload: newDisplayState,
          })
          setDefaultDisplayData(
            displayDataReducer(initialDisplayData, { type: "SET_ALL", payload: newDisplayState }),
          )
        }
      })
    }
  }, [initialDisplayData])

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

  const isMountedRef = useRef(false)

  // Sync internal state to URL whenever displayData changes
  useEffect(() => {
    if (isMountedRef.current) {
      writeDisplayParamsToUrl(displayData)
    } else {
      isMountedRef.current = true
    }
  }, [displayData])

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-6 xl:flex-nowrap">
        <div>
          <Header dispatch={dispatch} defaultDisplayData={defaultDisplayData} />
          <Inputs
            displayData={displayData}
            dispatch={dispatch}
            estimatedScreenSizes={estimatedScreenSizes}
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
