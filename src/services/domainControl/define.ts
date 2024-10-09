import { BluetoothRawOption } from "src/utils/bluetooth";
import { ICC_SERVICE } from "./icc";
/* 
service: 0x2024 ~ 0x2028
0x2024特征：0x6601~660A
0x2025特征：0x6701~670A
0x2026特征：0x6801~680A
0x2027特征：0x6901~690A
0x2028特征：0x6A01~6A0A

*/

// 蓝牙元数据
export const ESP32BLE = {
  name: "zbw_ble",
  services: [ICC_SERVICE],
} as BluetoothRawOption;

export const ESP32BLE_DEBUG = {
  name: "debug_fengyubiao_ble",
  services: [ICC_SERVICE],
} as BluetoothRawOption;
