import { useContext } from "react"
import { DevicesListContext } from "../components/ResolutionBlocks"
import { createDisplayDataState } from "../reducers/displayDataReducer"
import { borderClasses } from "../utils/utils"

export type CatalogEntry = {
  resolution: { horizontal: number; vertical: number }
  diagonal: number
  label: string
}
export type CatalogGroup = { brand: string; devices: CatalogEntry[] }
type DevicesListProps = { deviceList: CatalogGroup[] }

export const getResolutionKey = ({ horizontal, vertical }: CatalogEntry["resolution"]) => `${horizontal}x${vertical}`

const getItemKey = ({ resolution, diagonal, label }: CatalogEntry) =>
  `${getResolutionKey(resolution)}-${diagonal}-${label}`

export function CatalogEntryLink({ entry, showDiagonal = true }: { entry: CatalogEntry; showDiagonal?: boolean }) {
  const { dispatch, animatingItems, setAnimatingItems, onCompareSelection } = useContext(DevicesListContext)
  const {
    resolution: { horizontal, vertical },
    diagonal,
    label,
  } = entry
  const itemKey = getItemKey(entry)

  return (
    <div className={animatingItems[itemKey] ? "animate-text-fade-out" : ""}>
      <button
        type="button"
        className={`cursor-pointer border-0 bg-transparent p-0 text-blue-600 underline hover:text-blue-400 ${
          animatingItems[itemKey] ? "animate-bg-fade-out" : ""
        }`}
        onClick={() => {
          dispatch({ type: "SET_ALL", payload: { resolution: { horizontal, vertical }, diagonal } })
          onCompareSelection({ ...createDisplayDataState(horizontal, vertical, diagonal), label })
          setAnimatingItems((previousItems) => ({ ...previousItems, [itemKey]: true }))
          setTimeout(() => {
            setAnimatingItems((previousItems) => ({ ...previousItems, [itemKey]: false }))
          }, 700)
        }}
      >
        {`${horizontal}x${vertical}${showDiagonal ? ` @ ${diagonal}` : ""}`}
      </button>
      {label ? <>&nbsp;{label}</> : null}
    </div>
  )
}

export function DevicesList({ deviceList }: DevicesListProps) {
  return (
    <>
      {deviceList.map((devices) => (
        <div
          key={devices.brand}
          className={`relative mx-1 mt-3.5 inline-block w-[calc(100%-0.5rem)] break-inside-avoid px-2 pt-3 pb-2 ${borderClasses}`}
        >
          <div className="absolute -top-3.5 left-1/4 -translate-x-1/2 transform bg-white px-1">{devices.brand}</div>
          {devices.devices.map((entry) => (
            <CatalogEntryLink key={getItemKey(entry)} entry={entry} />
          ))}
        </div>
      ))}
    </>
  )
}

export default DevicesList
