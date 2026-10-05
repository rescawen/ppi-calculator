import { createContext, useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { type Action } from "../reducers/displayDataReducer"
import { type CompareHistoryItem } from "./CompareBox"
import {
  CatalogEntryLink,
  DevicesList,
  getResolutionKey,
  type CatalogEntry,
  type CatalogGroup,
} from "../components/DevicesList"

import { brandGroups } from "../data/brandGroups"
import sixteenByNineDevices from "../data/devices/16-by-9.json"
import threeByTwoDevices from "../data/devices/3-by-2.json"
import fourByThreeDevices from "../data/devices/4-by-3.json"
import sixteenByTenDevices from "../data/devices/16-by-10.json"
import ultraWideDevices from "../data/devices/ultrawide.json"

type AnimatingItems = { [key: string]: boolean }

type DevicesListContextType = {
  dispatch: Dispatch<Action>
  animatingItems: AnimatingItems
  setAnimatingItems: Dispatch<SetStateAction<AnimatingItems>>
  onCompareSelection: (item: CompareHistoryItem) => void
}

export const DevicesListContext = createContext<DevicesListContextType>({
  dispatch: () => {}, // Provide a no-op function or a real dispatch function if available, TODO: investigate this
  animatingItems: {},
  setAnimatingItems: () => {}, // Provide a no-op function, TODO: investigate this
  onCompareSelection: () => {},
})

const aspectRatioGroups: CatalogGroup[] = [
  ...sixteenByNineDevices,
  ...sixteenByTenDevices,
  ...threeByTwoDevices,
  ...fourByThreeDevices,
  ...ultraWideDevices,
]

// Deliberately small and easy to tune: these presets seed the generic overview
// while the aspect-ratio groups remain the complete source of truth.
const overviewResolutionKeys = new Set([
  "320x240",
  "640x480",
  "800x600",
  "960x540",
  "1024x768",
  "1280x720",
  "1280x800",
  "1280x960",
  "1366x768",
  "1400x1050",
  "1440x900",
  "1600x900",
  "1600x1200",
  "1680x1050",
  "1920x1080",
  "1920x1200",
  "2048x1152",
  "2048x1536",
  "2560x1080",
  "2560x1440",
  "2560x1600",
  "2880x1800",
  "3200x2400",
  "3440x1440",
  "3840x1600",
  "3840x2160",
  "3840x2400",
  "4096x2304",
  "5120x2160",
  "5120x2880",
  "7680x4320",
])

const overviewResolutions = Array.from(
  new Map(
    aspectRatioGroups
      .flatMap(({ devices }) => devices)
      .filter(({ resolution }) => overviewResolutionKeys.has(getResolutionKey(resolution)))
      .map((entry) => [getResolutionKey(entry.resolution), entry]),
  ).values(),
).toSorted((first, second) => {
  const firstPixels = first.resolution.horizontal * first.resolution.vertical
  const secondPixels = second.resolution.horizontal * second.resolution.vertical

  return (
    firstPixels - secondPixels ||
    first.resolution.horizontal - second.resolution.horizontal ||
    first.resolution.vertical - second.resolution.vertical
  )
})

const sectionButtonClasses = (isActive: boolean) =>
  `border-x-0 border-t-0 border-b-2 bg-transparent px-1 py-2 text-sm font-medium ${
    isActive
      ? "cursor-default border-black text-black"
      : "cursor-pointer border-transparent text-blue-600 hover:border-blue-400 hover:text-blue-400"
  }`

function ResolutionOverview({ resolutions }: { resolutions: CatalogEntry[] }) {
  return (
    <section aria-labelledby="resolution-overview-heading" className="mt-4">
      <h2 id="resolution-overview-heading" className="sr-only">
        Resolutions
      </h2>
      <div className="columns-2 gap-x-5 sm:columns-3 lg:columns-4 2xl:columns-5">
        {resolutions.map((entry) => (
          <div key={getResolutionKey(entry.resolution)} className="mb-1 break-inside-avoid">
            <CatalogEntryLink entry={entry} showDiagonal={false} />
          </div>
        ))}
      </div>
    </section>
  )
}

function SectionButton({ children, isActive, onClick }: { children: string; isActive: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={isActive} className={sectionButtonClasses(isActive)} onClick={onClick}>
      {children}
    </button>
  )
}

function ResolutionBlocks({
  dispatch,
  onCompareSelection,
}: {
  dispatch: Dispatch<Action>
  onCompareSelection: (item: CompareHistoryItem) => void
}) {
  const [animatingItems, setAnimatingItems] = useState<AnimatingItems>({})
  const [showBrands, setShowBrands] = useState(false)
  const [showAspectRatios, setShowAspectRatios] = useState(false)
  const contextValue = useMemo(
    () => ({ dispatch, animatingItems, setAnimatingItems, onCompareSelection }),
    [dispatch, animatingItems, setAnimatingItems, onCompareSelection],
  )
  const showResolutions = !showBrands && !showAspectRatios
  const visibleGroups = [...(showBrands ? brandGroups : []), ...(showAspectRatios ? aspectRatioGroups : [])]
  const groupColumnClasses =
    showBrands && showAspectRatios
      ? "columns-1 gap-x-0 sm:columns-2 lg:columns-4 2xl:columns-7"
      : "columns-1 gap-x-0 sm:columns-2 lg:columns-3 2xl:columns-5"

  return (
    <DevicesListContext.Provider value={contextValue}>
      <nav aria-label="Display catalog sections" className="mt-6 flex items-center gap-5 border-y border-gray-300">
        <SectionButton
          isActive={showResolutions}
          onClick={() => {
            setShowBrands(false)
            setShowAspectRatios(false)
          }}
        >
          Resolutions
        </SectionButton>
        <SectionButton isActive={showBrands} onClick={() => setShowBrands((isVisible) => !isVisible)}>
          Brands
        </SectionButton>
        <SectionButton isActive={showAspectRatios} onClick={() => setShowAspectRatios((isVisible) => !isVisible)}>
          Aspect Ratios
        </SectionButton>
      </nav>

      {showResolutions ? (
        <ResolutionOverview resolutions={overviewResolutions} />
      ) : (
        <section aria-label="Display groups" className={`mt-1 ${groupColumnClasses}`}>
          <DevicesList deviceList={visibleGroups} />
        </section>
      )}
    </DevicesListContext.Provider>
  )
}

export default ResolutionBlocks
