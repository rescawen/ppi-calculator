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
        <div key={devices.brand} className={`relative pt-3 px-2 pb-2 mt-3.5 mx-1 ${borderClasses}`}>
          <div className="absolute -top-3.5 left-1/4 transform -translate-x-1/2 bg-white px-1">{devices.brand}</div>
          {devices.devices.map(({ resolution: { horizontal, vertical }, diagonal, label }, index) => (
            <div key={index} className={animatingItems[label] ? "animate-text-fade-out" : ""}>
              <span
                className={`text-blue-600 cursor-pointer underline hover:text-blue-400 ${
                  animatingItems[label] ? "animate-bg-fade-out" : ""
                }`}
                onClick={() => {
                  dispatch({ type: "SET_ALL", payload: { resolution: { horizontal, vertical }, diagonal } })
                  setAnimatingItems((prev) => ({ ...prev, [label]: true }))
                  setTimeout(() => {
                    setAnimatingItems((prev) => ({ ...prev, [label]: false }))
                  }, 700)
                }}
              >
                {`${horizontal}x${vertical} @ ${diagonal}`}
              </span>
              &nbsp;{`${label}`}
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

export default DevicesList
