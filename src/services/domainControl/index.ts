import { BluetoothProxy } from "src/utils/bluetooth";
import { ESP32BLE, ESP32BLE_DEBUG } from "./define";
import { isNative } from "app/src-capacitor";
import { BluetoothPluginProxy } from "app/src-capacitor/bluetoothPlugin";
const options = {
  bluetoothRawOptions: [ESP32BLE, ESP32BLE_DEBUG],
};
export const ESP32BLEBluetooth = isNative
  ? new BluetoothPluginProxy(options)
  : new BluetoothProxy(options);

(window as any).ESP32BLEBluetooth = ESP32BLEBluetooth;
