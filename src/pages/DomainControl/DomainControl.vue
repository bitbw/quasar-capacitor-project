<template>
  <q-layout>
    <q-header>
      <q-toolbar class="shadow-5 bg-grey-9">
        <q-toolbar-title>域控</q-toolbar-title>
        <q-btn @click="openBluetoothConnect = true"> 蓝牙</q-btn>
      </q-toolbar>
      <q-dialog v-model="openBluetoothConnect">
        <div class="q-pa-md row items-center q-gutter-md">
          <q-card class="my-card">
            <q-card-section>
              <div
                style="text-align: start"
                class="flex-column q-gutter-md items-center"
              >
                <q-btn
                  push
                  :loading="!!loading[0]"
                  color="primary"
                  @click="connectToDevice"
                  style="min-width: 200px"
                >
                  {{ isConnected ? "已连接" : "获取设备列表并配对" }}
                  <template v-slot:loading>
                    <q-spinner-hourglass class="on-left" />
                    Loading...
                  </template>
                </q-btn>
                <br />

                <div class="row">
                  <q-input
                    v-model.number="ping"
                    filled
                    style="max-width: 200px; margin-right: 20px"
                  />
                  <q-btn
                    v-if="isConnected"
                    push
                    color="primary"
                    label="发送"
                    @click="write"
                  />
                </div>

                <q-btn
                  push
                  color="primary"
                  v-if="isConnected"
                  @click="disconnectDevice"
                  >断开连接</q-btn
                >

                <p>设备状态: {{ isConnected ? "已连接" : "未连接" }}</p>
                <p>设备信息: {{ device?.name }}</p>
                <p>接收信息: {{ pong }}</p>

                <q-btn
                  v-if="isConnected"
                  push
                  color="primary"
                  label="读取数据"
                  @click="read"
                />
                <q-btn
                  v-if="isConnected"
                  push
                  color="primary"
                  label="获取所有特征"
                  @click="getCharacteristics"
                />
                <q-btn
                  v-if="isConnected"
                  push
                  color="primary"
                  label="读取所有可写特征"
                  @click="getCharacteristicsAndRead"
                />
                <q-btn
                  v-if="isConnected"
                  push
                  color="primary"
                  label="写入所有可写特征"
                  @click="getCharacteristicsAndWrite"
                />
                <q-btn
                  v-if="isConnected"
                  push
                  color="primary"
                  label="获取所有服务"
                  @click="getAllServices"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-dialog>
    </q-header>
    <q-page-container>
      <q-page class="row">
        <template v-if="!isConnected">
          <div
            class="column justify-center items-center content-center text-secondary q-gutter-md"
            style="flex: 1"
          >
            <template v-if="!isSupportBluetooth">
              <q-icon name="mobile_off" color="teal" size="4.4em" />
              <span class="text-h6">当前设备不支持蓝牙 </span>
            </template>
            <template v-else>
              <q-icon name="bluetooth_disabled" color="teal" size="4.4em" />
              <span class="text-h6">蓝牙未连接 </span>
              <span class="text-weight-bold">
                <q-btn
                  outline
                  rounded
                  size="lg"
                  :loading="!!loading[0]"
                  @click="connectToDevice"
                  style="min-width: 200px"
                >
                  {{ isConnected ? "已连接" : "链接蓝牙" }}
                  <template v-slot:loading>
                    <q-spinner-hourglass class="on-left" />
                    Loading...
                  </template>
                </q-btn>
              </span>
            </template>
          </div>
        </template>
        <template v-else>
          <div class="row" style="flex: 1">
            <q-tabs
              v-model="tab"
              vertical
              class="bg-grey-9"
              active-class="bg-teal"
              switch-indicator
            >
              <q-tab name="ICC" icon="display_settings" label="ICC" />
              <q-tab name="TAA" icon="movie" label="TAA" />
              <q-tab name="dTCS" icon="movie" label="dTCS" />
              <q-tab name="SBW" icon="movie" label="SBW" />
              <q-tab name="RWS" icon="movie" label="RWS" />
            </q-tabs>
            <q-tab-panels
              style="height: 100%; flex: 1"
              class="col-auto"
              v-model="tab"
              animated
              keep-alive
              vertical
              transition-prev="jump-up"
              transition-next="jump-up"
            >
              <q-tab-panel name="ICC" class="q-pa-none"> <ICC /></q-tab-panel>
              <q-tab-panel name="TAA"> TAA </q-tab-panel>
              <q-tab-panel name="dTCS"> dTCS </q-tab-panel>
              <q-tab-panel name="SBW"> SBW </q-tab-panel>
              <q-tab-panel name="RWS"> RWS </q-tab-panel>
            </q-tab-panels>
          </div>
        </template>

        <!-- <q-splitter v-model="splitterModel">
          <template v-slot:before> -->

        <!-- </template> -->

        <!-- <template v-slot:after> -->

        <!-- </template>
        </q-splitter> -->
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { isSupportBluetooth } from "src/utils/bluetooth";
import { ref, onMounted, onUnmounted } from "vue";
import ICC from "./ICC.vue";
import { useQuasar } from "quasar";
import { ESP32BLEBluetooth } from "src/services/domainControl";
import { ESP32BLE } from "src/services/domainControl/define";
import { BleDevice } from "app/src-capacitor/bluetoothPlugin";
import { checkEnvironment } from "app/src-capacitor";
checkEnvironment();
const $q = useQuasar();
$q.dark.set(true);

// bluetooth
const openBluetoothConnect = ref(false);
const loading = ref([] as boolean[]);
const isConnected = ref(false);
const device = ref<BluetoothDevice | BleDevice | null>(null);
const ping = ref(Array.from({ length: 10 }, () => "A").join(""));
console.log("[BOWEN_LOG] 🚀 ~~ ping:", ping.value);
const pong = ref();

//  tab
const tab = ref("ICC");
const handleDisconnected = async () => {
  isConnected.value = false;
};
// 链接蓝牙
const connectToDevice = async () => {
  loading.value[0] = true;
  try {
    const newDevice = await ESP32BLEBluetooth.request();
    console.log("[BOWEN_LOG] 🚀 ~~ connectToDevice ~~ newDevice:", newDevice);
    device.value = newDevice;
    await ESP32BLEBluetooth.connect(handleDisconnected);
    isConnected.value = true;
  } catch (error) {
    console.error("连接设备失败:", error);
  }
  loading.value[0] = false;
};

// async function connectGATT(device: BluetoothDevice) {
//   try {
//     console.log("Connected to GATT server.");
//     const newServer = await device?.gatt?.connect?.();
//     console.log("[BOWEN_LOG] 🚀 ~~ connectGATT ~~ newServer:", newServer);
//     server.value = newServer || null;
//     return newServer;
//   } catch (error) {
//     console.error("Error connecting to GATT server:", error);
//   }
// }

async function getCharacteristics() {
  try {
    const characteristics = await ESP32BLEBluetooth.getCharacteristics();
    console.log(
      "[BOWEN_LOG] 🚀 ~~ getCharacteristics ~~ characteristics:",
      characteristics,
    );
    return characteristics;
  } catch (error) {
    console.error("[getCharacteristics] Error getting services", error);
  }
}

async function getCharacteristicsAndWrite() {
  try {
    const characteristics = await ESP32BLEBluetooth.getCharacteristics();
    console.log(
      "[BOWEN_LOG] 🚀 ~~ getCharacteristics ~~ characteristics:",
      characteristics,
    );
    characteristics?.map((item) => {
      if (item.properties.write) {
        console.time("write" + item.uuid);
        ESP32BLEBluetooth.writeData(
          ping.value + "",
          item.service.uuid,
          item.uuid,
        );
      }
      if (item.properties.notify) {
        ESP32BLEBluetooth.startNotifications(
          handleNotyfy,
          item.service.uuid,
          item.uuid,
        );
      }
    });
    return characteristics;
  } catch (error) {
    console.error("[getCharacteristics] Error getting services", error);
  }
}
async function getCharacteristicsAndRead() {
  try {
    const characteristics = await ESP32BLEBluetooth.getCharacteristics();
    Promise.all(
      characteristics?.map(async (item) => {
        if (item.properties.read) {
          console.time("read" + item.uuid);
          const value = await ESP32BLEBluetooth.readData(
            item.service.uuid,
            item.uuid,
          );
          console.log(
            "[BOWEN_LOG] 🚀 ~~ getCharacteristicsAndRead?.map ~~ value:",
            value,
          );
          console.timeEnd("read" + item.uuid);
          return value;
        }
      }) || [],
    );

    return characteristics;
  } catch (error) {
    console.error("[getCharacteristics] Error getting services", error);
  }
}
async function getAllServices() {
  try {
    const services = await ESP32BLEBluetooth.getServices();
    console.log("[getCharacteristics] Error getAllServices services", services);
    return services;
  } catch (error) {
    console.error("[getAllServices] Error getting services", error);
  }
}

async function write() {
  try {
    ESP32BLEBluetooth.writeData(
      ping.value + "",
      ESP32BLE.services[0].uuid,
      ESP32BLE.services?.[0]?.characteristics?.[0]?.uuid || "",
    );
    console.time("write" + ESP32BLE.services?.[0]?.characteristics?.[0]?.uuid);
  } catch (error) {
    console.error(
      "[write] Error getting services and write characteristics:",
      error,
    );
  }
}
async function read() {
  try {
    console.time("read");
    const data = await ESP32BLEBluetooth.readData(
      ESP32BLE.services[0].uuid,
      ESP32BLE.services?.[0]?.characteristics?.[0]?.uuid || "",
    );
    console.timeEnd("read");
    console.log("[BOWEN_LOG] 🚀 ~~ read ~~ data:", data);
  } catch (error) {
    console.error("[read]Error getting services and  characteristics:", error);
  }
}

const disconnectDevice = async () => {
  if (ESP32BLEBluetooth.device) {
    device.value = ESP32BLEBluetooth.device;
    isConnected.value = false;
    ESP32BLEBluetooth.disconnect();
    console.log("[BOWEN_LOG] 🚀 ~ disconnectDevice ~ disconnected");
  }
};

const handleNotyfy = (value: string, event: any) => {
  console.log(
    "[BOWEN_LOG] 🚀 ~~ handleNotyfy ~~ event:",
    event.target.service.uuid,
  );
  pong.value = value;
  console.timeEnd("write" + event.target.uuid);
};

onMounted(() => {
  device.value = ESP32BLEBluetooth.device;
  if (device.value && ESP32BLEBluetooth.isConnected) {
    isConnected.value = true;
  }

  document.title = "域控UI";
});
onUnmounted(() => {
  ESP32BLEBluetooth.disconnect();
});
</script>

<style>
::-webkit-scrollbar {
  height: 12px;
  width: 14px;
  background: transparent;
  z-index: 12;
  overflow: visible;
}

::-webkit-scrollbar-thumb {
  width: 10px;
  background-color: #00b4ff;
  border-radius: 10px;
  z-index: 12;
  border: 4px solid rgba(0, 0, 0, 0);
  background-clip: padding-box;
  -webkit-transition: background-color 0.28s ease-in-out;
  transition: background-color 0.28s ease-in-out;
  margin: 4px;
  min-height: 32px;
  min-width: 32px;
}

::-webkit-scrollbar-thumb:hover {
  background: #00b4ff;
}
</style>
