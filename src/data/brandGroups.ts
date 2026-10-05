import appleDevices from "./devices/apple.json"
import gameConsoleDevices from "./devices/gameConsole.json"
import razerDevices from "./devices/razer.json"
import sonyDevices from "./devices/sony.json"
import mobileDevices from "./devices/mobile.json"
import dellDevices from "./devices/dell.json"
import samsungDevices from "./devices/samsung.json"
import lgDevices from "./devices/lg.json"
import acerDevices from "./devices/acer.json"
import asusDevices from "./devices/asus.json"
import benqDevices from "./devices/benq.json"
import microsoftDevices from "./devices/microsoft.json"
import lenovoDevices from "./devices/lenovo.json"
import huaweiDevices from "./devices/huawei.json"
import miscDevices from "./devices/misc.json"
import type { CatalogGroup } from "../components/DevicesList"

export const brandGroups: CatalogGroup[] = [
  ...appleDevices,
  ...gameConsoleDevices,
  ...razerDevices,
  ...sonyDevices,
  ...mobileDevices,
  ...dellDevices,
  ...microsoftDevices,
  ...samsungDevices,
  ...lgDevices,
  ...acerDevices,
  ...asusDevices,
  ...benqDevices,
  ...lenovoDevices,
  ...huaweiDevices,
  ...miscDevices,
]
