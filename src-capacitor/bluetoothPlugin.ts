import { ESP32BLE } from "../src/services/domainControl/define";
export type { BleDevice } from "@capacitor-community/bluetooth-le";
import {
  BleClient,
  numberToUUID,
  dataViewToText,
  textToDataView,
  BleDevice,
} from "@capacitor-community/bluetooth-le";

import { BluetoothRawOption, Options } from "../src/utils/bluetooth";

export type ListenerItem = {
  listener: (balue: any) => void;
  serviceBluetoothServiceUUID: BluetoothServiceUUID;
  characteristicBluetoothServiceUUID: BluetoothServiceUUID;
};

const getUUID = (uuid: BluetoothServiceUUID) => {
  return typeof uuid === "number" ? numberToUUID(uuid) : uuid;
};

export class BluetoothPluginProxy {
  public isConnected = false;
  public bluetoothRawOptions = null as any as BluetoothRawOption[]; // 蓝牙配置
  public device = null as any as BleDevice; // 蓝牙设备实例
  constructor({ bluetoothRawOptions }: Options) {
    this.bluetoothRawOptions = bluetoothRawOptions;
  }

  request() {
    return BleClient.initialize({ androidNeverForLocation: true }).then(() =>
      BleClient.requestDevice({
        name: ESP32BLE.name,
        // services: ESP32BLE.services.map((s) => getUUID(s.uuid)),
        optionalServices: ESP32BLE.services.map((s) => getUUID(s.uuid)),
      }).then((device) => {
        this.device = device;
        return device;
      }),
    );
  }

  connect(onDisconnected?: () => void) {
    if (!this.device) {
      return Promise.reject("Device is not connected.");
    }
    return BleClient.connect(this.device.deviceId, () => {
      this.onDisconnected();
      onDisconnected?.();
    }).then(() => (this.isConnected = true));
  }

  // 获取所有特征
  getCharacteristics() {
    return BleClient.getServices(this.device.deviceId).then((services) => {
      const characteristics = [] as any[];
      services.map((service) =>
        service.characteristics.map((characteristic) =>
          characteristics.push({
            ...characteristic,
            service: service,
          }),
        ),
      );
      return characteristics;
    });
  }

  // 获取所有服务
  getServices() {
    return BleClient.getServices(this.device.deviceId);
  }

  readData(
    serviceBluetoothServiceUUID: BluetoothServiceUUID,
    characteristicBluetoothServiceUUID: BluetoothServiceUUID,
  ) {
    return BleClient.read(
      this.device.deviceId,
      getUUID(serviceBluetoothServiceUUID),
      getUUID(characteristicBluetoothServiceUUID),
    ).then((value) => dataViewToText(value));
  }

  writeData(
    data: string,
    serviceBluetoothServiceUUID: BluetoothServiceUUID,
    characteristicBluetoothServiceUUID: BluetoothServiceUUID,
  ) {
    console.log("[BOWEN_LOG] 🚀 ~~ BluetoothProxy ~~ writeData data:", data);

    return BleClient.write(
      this.device.deviceId,
      getUUID(serviceBluetoothServiceUUID),
      getUUID(characteristicBluetoothServiceUUID),
      textToDataView(data),
    );
  }

  startNotifications(
    listener: (value: string, event: Event) => void,
    serviceBluetoothServiceUUID: BluetoothServiceUUID,
    characteristicBluetoothServiceUUID: BluetoothServiceUUID,
  ) {
    console.log(
      "[BOWEN_LOG] 🚀 ~~ BluetoothPluginProxy ~~ characteristicBluetoothServiceUUID:",
      getUUID(characteristicBluetoothServiceUUID),
    );
    const curListener = (value: DataView) => {
      listener(dataViewToText(value), {
        target: {
          uuid: characteristicBluetoothServiceUUID,
        },
      } as any as Event);
    };

    return BleClient.startNotifications(
      this.device.deviceId,
      getUUID(serviceBluetoothServiceUUID),
      getUUID(characteristicBluetoothServiceUUID),
      curListener,
    );
  }

  stopNotifications(
    listener: (event: Event) => void,
    serviceBluetoothServiceUUID: BluetoothServiceUUID,
    characteristicBluetoothServiceUUID: BluetoothServiceUUID,
  ) {
    listener; // not used
    return BleClient.stopNotifications(
      this.device.deviceId,
      getUUID(serviceBluetoothServiceUUID),
      getUUID(characteristicBluetoothServiceUUID),
    );
  }

  disconnect() {
    console.log(
      "[BOWEN_LOG] 🚀 ~~ BluetoothProxy ~~ disconnect ~~ disconnect:",
      this.device,
    );
    if (!this.device) {
      return Promise.reject("Device is not connected.");
    }
    return BleClient.disconnect(this.device.deviceId);
  }

  onDisconnected(): void {
    console.log(
      `device [${this.device.name}] [${this.device.deviceId}] disconnected`,
    );
  }
}
