import { useState, Dispatch, createContext, SetStateAction, useEffect } from "react"
import { Action } from "../reducers/displayDataReducer"
import { DevicesList } from "../components/DevicesList"

import appleDevices from "../data/devices/apple.json"
import gameConsoleDevices from "../data/devices/gameConsole.json"
import razerDevices from "../data/devices/razer.json"
import sonyDevices from "../data/devices/sony.json"
import mobileDevices from "../data/devices/mobile.json"
import dellDevices from "../data/devices/dell.json"
import samsungDevices from "../data/devices/samsung.json"
import lgDevices from "../data/devices/lg.json"
import acerDevices from "../data/devices/acer.json"
import asusDevices from "../data/devices/asus.json"
import benqDevices from "../data/devices/benq.json"
import microsoftDevices from "../data/devices/microsoft.json"
import lenovoDevices from "../data/devices/lenovo.json"
import huaweiDevices from "../data/devices/huawei.json"
import miscDevices from "../data/devices/misc.json"

type AnimatingItems = { [key: string]: boolean }

type DevicesListContextType = {
  dispatch: Dispatch<Action>
  animatingItems: AnimatingItems
  setAnimatingItems: Dispatch<SetStateAction<AnimatingItems>>
}

export const DevicesListContext = createContext<DevicesListContextType>({
  dispatch: () => {}, // Provide a no-op function or a real dispatch function if available, TODO: investigate this
  animatingItems: {},
  setAnimatingItems: () => {}, // Provide a no-op function, TODO: investigate this
})

function ResolutionBlocks({ dispatch }: { dispatch: Dispatch<Action> }) {
  const [animatingItems, setAnimatingItems] = useState<AnimatingItems>({})
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)

  useEffect(() => {
    // Handle window resize
    const handleResize = () => setWindowWidth(window.innerWidth)

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Determine layout based on window width
  const getLayout = () => {
    if (windowWidth >= 1536) {
      // 8 columns for tailwind 2xl(96rem) screens
      return (
        <div className="grid grid-cols-8">
          <div className="col-span-1">
            <DevicesList deviceList={appleDevices} />
          </div>
          <div className="col-span-1">
            <DevicesList deviceList={gameConsoleDevices} />
            <DevicesList deviceList={razerDevices} />
            <DevicesList deviceList={sonyDevices} />
            <DevicesList deviceList={mobileDevices} />
          </div>
          <div className="col-span-1">
            <DevicesList deviceList={dellDevices} />
            <DevicesList deviceList={microsoftDevices} />
          </div>
          <div className="col-span-1">
            <DevicesList deviceList={samsungDevices} />
            <DevicesList deviceList={lgDevices} />
            <DevicesList deviceList={acerDevices} />
            <DevicesList deviceList={asusDevices} />
            <DevicesList deviceList={benqDevices} />
          </div>
          <div className="col-span-1">
            <DevicesList deviceList={lenovoDevices} />
            <DevicesList deviceList={huaweiDevices} />
            <DevicesList deviceList={miscDevices} />
          </div>
        </div>
      )
    } else if (windowWidth >= 1024) {
      // 4 columns for tailwind lg/xl (64/80 rem, 1024/1280) screens
      return (
        <div className="grid grid-cols-4">
          <div className="col-span-1">
            <DevicesList deviceList={appleDevices} />
          </div>
          <div className="col-span-1">
            <DevicesList deviceList={gameConsoleDevices} />
            <DevicesList deviceList={razerDevices} />
            <DevicesList deviceList={sonyDevices} />
            <DevicesList deviceList={mobileDevices} />
            <DevicesList deviceList={dellDevices} />
            <DevicesList deviceList={microsoftDevices} />
          </div>
          <div className="col-span-1">
            <DevicesList deviceList={samsungDevices} />
            <DevicesList deviceList={lgDevices} />
            <DevicesList deviceList={acerDevices} />
            <DevicesList deviceList={asusDevices} />
            <DevicesList deviceList={benqDevices} />
          </div>
          <div className="col-span-1">
            <DevicesList deviceList={lenovoDevices} />
            <DevicesList deviceList={huaweiDevices} />
            <DevicesList deviceList={miscDevices} />
          </div>
        </div>
      )
    } else {
      // 2 columns for sm/md (40/48 rem, 640/768) screens
      return (
        <div className="grid grid-cols-2">
          <div className="col-span-1">
            <DevicesList deviceList={appleDevices} />
            <DevicesList deviceList={gameConsoleDevices} />
            <DevicesList deviceList={razerDevices} />
            <DevicesList deviceList={sonyDevices} />
            <DevicesList deviceList={mobileDevices} />
          </div>
          <div className="col-span-1">
            <DevicesList deviceList={dellDevices} />
            <DevicesList deviceList={microsoftDevices} />
            <DevicesList deviceList={samsungDevices} />
            <DevicesList deviceList={lgDevices} />
            <DevicesList deviceList={acerDevices} />
            <DevicesList deviceList={asusDevices} />
            <DevicesList deviceList={benqDevices} />
            <DevicesList deviceList={lenovoDevices} />
            <DevicesList deviceList={huaweiDevices} />
            <DevicesList deviceList={miscDevices} />
          </div>
        </div>
      )
    }
  }

  return (
    <DevicesListContext.Provider value={{ dispatch, animatingItems, setAnimatingItems }}>
      {getLayout()}
    </DevicesListContext.Provider>
  )
}

export default ResolutionBlocks
