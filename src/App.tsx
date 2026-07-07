"use client"

import { useReducer, useEffect, useState } from "react"
import Inputs from "./components/Inputs"
import ResolutionBlocks from "./components/ResolutionBlocks"
import Header from "./components/Header"
import {
  createDisplayDataStateForScreen,
  displayDataReducer,
  getEstimatedScreenSizes,
  initialDisplayDataState,
} from "./reducers/displayDataReducer"

const displayParamsPattern = /horizontal=(\d+)\/vertical=(\d+)\/diagonal=([0-9.]+)/

const getDisplayParamsFromUrl = () => {
  const decodedSearch = decodeURIComponent(window.location.search)
  const match = decodedSearch.match(displayParamsPattern)

  if (!match) {
    return null
  }

  const [, horizontal, vertical, diagonal] = match
  const displayParams = {
    horizontal: Number(horizontal),
    vertical: Number(vertical),
    diagonal: Number(diagonal),
  }

  return Object.values(displayParams).every(Number.isFinite) ? displayParams : null
}

const writeDisplayParamsToUrl = (displayData: typeof initialDisplayDataState) => {
  const params = `horizontal=${displayData.resolution.horizontal ?? 0}/vertical=${displayData.resolution.vertical ?? 0}/diagonal=${displayData.diagonal ?? 0}`
  window.history.replaceState(null, "", `?${params}`)
}

function Calculator() {
  const [displayData, dispatch] = useReducer(displayDataReducer, initialDisplayDataState)
  const [defaultDisplayData, setDefaultDisplayData] = useState(initialDisplayDataState)
  const [isDefaultDisplayDataChanged, setIsDefaultDisplayDataChanged] = useState<boolean>(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [estimatedScreenSizes, setEstimatedScreenSizes] = useState<number[]>(
    getEstimatedScreenSizes(
      initialDisplayDataState.resolution.horizontal ?? 0,
      initialDisplayDataState.resolution.vertical ?? 0,
    ),
  )

  useEffect(() => {
    const urlDisplayParams = getDisplayParamsFromUrl()

    if (urlDisplayParams) {
      dispatch({
        type: "SET_ALL",
        payload: {
          resolution: { horizontal: urlDisplayParams.horizontal, vertical: urlDisplayParams.vertical },
          diagonal: urlDisplayParams.diagonal,
        },
      })
      setIsInitialized(true)
      return
    }

    const browserDisplayData = createDisplayDataStateForScreen(window.screen)
    setDefaultDisplayData(browserDisplayData)
    setEstimatedScreenSizes(
      getEstimatedScreenSizes(
        browserDisplayData.resolution.horizontal ?? 0,
        browserDisplayData.resolution.vertical ?? 0,
      ),
    )
    dispatch({
      type: "SET_ALL",
      payload: { resolution: browserDisplayData.resolution, diagonal: browserDisplayData.diagonal },
    })
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

function App() {
  return <Calculator />
}

export default App
