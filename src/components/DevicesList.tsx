import { useContext } from "react"
import { DevicesListContext } from "../components/ResolutionBlocks"
import { borderClasses } from "../utils/utils"

type Device = { resolution: { horizontal: number; vertical: number }; diagonal: number; label: string }
type DevicesGroup = { brand: string; devices: Device[] }
type DevicesListProps = { deviceList: DevicesGroup[] }

export function DevicesList({ deviceList }: DevicesListProps) {
  const { dispatch, animatingItems, setAnimatingItems } = useContext(DevicesListContext)

  return (
    <>
      {deviceList.map((devices) => (
        <div key={devices.brand} className={`relative mx-1 mt-3.5 px-2 pt-3 pb-2 ${borderClasses}`}>
          <div className="absolute -top-3.5 left-1/4 -translate-x-1/2 transform bg-white px-1">{devices.brand}</div>
          {devices.devices.map(({ resolution: { horizontal, vertical }, diagonal, label }) => {
            const itemKey = `${horizontal}x${vertical}-${diagonal}-${label}`

            return (
              <div key={itemKey} className={animatingItems[itemKey] ? "animate-text-fade-out" : ""}>
                <button
                  type="button"
                  className={`cursor-pointer border-0 bg-transparent p-0 text-blue-600 underline hover:text-blue-400 ${
                    animatingItems[itemKey] ? "animate-bg-fade-out" : ""
                  }`}
                  onClick={() => {
                    dispatch({ type: "SET_ALL", payload: { resolution: { horizontal, vertical }, diagonal } })
                    setAnimatingItems((prev) => ({ ...prev, [itemKey]: true }))
                    setTimeout(() => {
                      setAnimatingItems((prev) => ({ ...prev, [itemKey]: false }))
                    }, 700)
                  }}
                >
                  {`${horizontal}x${vertical} @ ${diagonal}`}
                </button>
                &nbsp;{`${label}`}
              </div>
            )
          })}
        </div>
      ))}
    </>
  )
}

export default DevicesList
