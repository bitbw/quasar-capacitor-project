import { platform } from "app/src-capacitor";

export type ListenerItem = {
  listener: (event: Event) => void;
  serviceBluetoothServiceUUID: BluetoothServiceUUID;
  characteristicBluetoothServiceUUID: BluetoothServiceUUID;
};

export type BluetoothRawOption = {
  name: string;
  services: {
    name: string;
    uuid: BluetoothServiceUUID;
    characteristics?: {
      name: string;
      uuid: BluetoothServiceUUID;
      properties: string[];
    }[];
  }[];
};

export type Options = {
  bluetoothRawOptions: BluetoothRawOption[];
};

// 是否支持蓝牙
export const supportBluetoothValidate = () => {
  if (platform === "web") {
    if ("bluetooth" in navigator) {
      console.log("Web Bluetooth API is supported!");
    } else {
      console.log("Web Bluetooth API is not supported.");
    }
    return "bluetooth" in navigator;
  }
  if (platform === "android" || platform === "ios") return true;
  return false;
};

export const isSupportBluetooth = supportBluetoothValidate();

export const convertToBuffer = (input: string | number): ArrayBuffer => {
  if (typeof input === "string") {
    const encoder = new TextEncoder();
    return encoder.encode(input).buffer;
  }
  // else if (typeof input === "number") {
  //   const buffer = new ArrayBuffer(4); // 假设数字以 4 字节存储
  //   const view = new DataView(buffer);
  //   view.setFloat32(0, input); // 或者使用 setInt32 根据具体需求
  //   return buffer;
  // }
  else {
    throw new TypeError("[convertToBuffer] Input must be a string or a number");
  }
};

export const convertToString = (value: DataView): string => {
  if (value instanceof DataView) {
    const uint8Array = new Uint8Array(value.buffer);
    const textDecoder = new TextDecoder("utf-8");
    const stringValue = textDecoder.decode(uint8Array);
    return stringValue;
  } else {
    throw new TypeError("[convertToString] value must be a DataView");
  }
};
export const getAllServicesBluetoothServiceUUID = (
  bluetoothRawOptions: BluetoothRawOption[],
) => {
  const list = new Set<BluetoothServiceUUID>();
  bluetoothRawOptions.map((item) => {
    const { services } = item;
    services.map((item) => list.add(item.uuid));
  });
  const uuids = [...list];
  return uuids;
};

// type BluetoothServiceUUID = number | string | any;

export class BluetoothProxy {
  public isConnected = false;
  public device = null as any as BluetoothDevice; // 蓝牙设备实例
  public bluetoothRawOptions = null as any as BluetoothRawOption[]; // 蓝牙配置
  private notificationListeners = [] as ListenerItem[]; // 所有订阅的通知
  constructor({ bluetoothRawOptions }: Options) {
    this.onDisconnected = this.onDisconnected.bind(this);
    this.bluetoothRawOptions = bluetoothRawOptions;
  }

  request() {
    const options = {
      filters: this.bluetoothRawOptions.map((item) => ({ name: item.name })),
      optionalServices: getAllServicesBluetoothServiceUUID(
        this.bluetoothRawOptions,
      ),
    };
    return navigator.bluetooth.requestDevice(options).then((device) => {
      this.device = device;
      this.device.addEventListener(
        "gattserverdisconnected",
        this.onDisconnected,
      );
      return device;
    });
  }

  connect(onDisconnected = () => {}) {
    if (!this.device) {
      return Promise.reject("Device is not connected.");
    }
    this.device?.addEventListener?.("gattserverdisconnected", onDisconnected);
    return this.device?.gatt?.connect().then(() => (this.isConnected = true));
  }

  // 获取所有特征
  getCharacteristics() {
    return this.device?.gatt
      ?.getPrimaryServices()
      .then((services) =>
        Promise.all(services.map((service) => service.getCharacteristics())),
      )
      .then((characteristics) => characteristics.flat());
  }

  // 获取所有服务
  getServices() {
    return this.device?.gatt?.getPrimaryServices();
  }

  readData(
    serviceBluetoothServiceUUID: BluetoothServiceUUID,
    characteristicBluetoothServiceUUID: BluetoothServiceUUID,
  ) {
    return this.device?.gatt
      ?.getPrimaryService(serviceBluetoothServiceUUID)
      .then((service) =>
        service?.getCharacteristic(characteristicBluetoothServiceUUID),
      )
      .then((characteristic) =>
        characteristic?.readValue().then((value) => convertToString(value)),
      );
  }

  writeData(
    data: string | number | ArrayBuffer,
    serviceBluetoothServiceUUID: BluetoothServiceUUID,
    characteristicBluetoothServiceUUID: BluetoothServiceUUID,
  ) {
    console.log("[BOWEN_LOG] 🚀 ~~ BluetoothProxy ~~ writeData data:", data);
    const bufferData =
      typeof data === "string" || typeof data === "number"
        ? convertToBuffer(data)
        : data;
    return this.device?.gatt
      ?.getPrimaryService(serviceBluetoothServiceUUID)
      .then((service) =>
        service.getCharacteristic(characteristicBluetoothServiceUUID),
      )
      .then((characteristic) => characteristic.writeValue(bufferData));
  }

  startNotifications(
    listener: (value: string, event: Event) => void,
    serviceBluetoothServiceUUID: BluetoothServiceUUID,
    characteristicBluetoothServiceUUID: BluetoothServiceUUID,
  ) {
    return this.device?.gatt
      ?.connect()
      .then((server) => server?.getPrimaryService(serviceBluetoothServiceUUID))
      .then((service) =>
        service.getCharacteristic(characteristicBluetoothServiceUUID),
      )
      .then((characteristic) => characteristic.startNotifications())
      .then((characteristic) => {
        const curListener = (event: Event) => {
          const value = (event?.target as any)?.value;
          listener(convertToString(value), event);
        };
        characteristic.addEventListener(
          "characteristicvaluechanged",
          curListener,
        );

        // record
        this.notificationListeners.push({
          serviceBluetoothServiceUUID,
          characteristicBluetoothServiceUUID,
          listener: curListener,
        });
        return characteristic;
      })
      .catch((error) => {
        console.error("Error in startNotifications:", error);
        // 可以在这里添加更多的错误处理逻辑，例如提示用户
        throw error;
      });
  }

  stopNotifications(
    listener: (event: Event) => void,
    serviceBluetoothServiceUUID: BluetoothServiceUUID,
    characteristicBluetoothServiceUUID: BluetoothServiceUUID,
  ) {
    return this.device.gatt
      ?.getPrimaryService(serviceBluetoothServiceUUID)
      .then((service) =>
        service.getCharacteristic(characteristicBluetoothServiceUUID),
      )
      .then((characteristic) => characteristic.stopNotifications())
      .then((characteristic) =>
        characteristic.removeEventListener(
          "characteristicvaluechanged",
          listener,
        ),
      );
  }

  disconnect() {
    console.log(
      "[BOWEN_LOG] 🚀 ~~ BluetoothProxy ~~ disconnect ~~ disconnect:",
      this.device,
    );
    // removeEventListener
    this.notificationListeners.map((item) =>
      this.stopNotifications(
        item.listener,
        item.serviceBluetoothServiceUUID,
        item.characteristicBluetoothServiceUUID,
      ),
    );
    if (!this.device) {
      return Promise.reject("Device is not connected.");
    }
    return this.device?.gatt?.disconnect();
  }

  onDisconnected() {
    this.isConnected = false;
    console.log("Device is disconnected.");
  }
}
