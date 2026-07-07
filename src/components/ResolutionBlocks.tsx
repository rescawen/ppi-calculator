import { useState, Dispatch, createContext, SetStateAction } from "react"
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
}

export const DevicesListContext = createContext<DevicesListContextType>({
  dispatch: () => {}, // Provide a no-op function or a real dispatch function if available, TODO: investigate this
  animatingItems: {},
  setAnimatingItems: () => {}, // Provide a no-op function, TODO: investigate this
})

function ResolutionBlocks({ dispatch }: { dispatch: Dispatch<Action> }) {
  const [animatingItems, setAnimatingItems] = useState<AnimatingItems>({})

  return (
    <DevicesListContext.Provider value={{ dispatch, animatingItems, setAnimatingItems }}>
      <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
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
        <div className="col-span-1">
          <DevicesList deviceList={sixteenByNineDevices} />
          <DevicesList deviceList={sixteenByTenDevices} />
        </div>
        <div className="col-span-1">
          <DevicesList deviceList={threeByTwoDevices} />
          <DevicesList deviceList={fourByThreeDevices} />
          <DevicesList deviceList={ultraWideDevices} />
        </div>
      </div>
    </DevicesListContext.Provider>
  )
}

export default ResolutionBlocks
