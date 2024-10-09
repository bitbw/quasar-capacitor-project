<template>
  <q-layout view="lHh lpr lFf" container style="height: 100%" class="bg-teal-6">
    <q-header elevated>
      <q-toolbar class="bg-teal-10">
        <q-toolbar-title class="row q-gutter-md items-center">
          <div>执行器选择：</div>

          <q-option-group
            v-model="selection"
            :options="options"
            color="green"
            type="checkbox"
            inline
          />
          <!-- <q-checkbox
            v-model="selection"
            val="wireControl"
            label="线控制动"
            color="teal"
          />
          <q-checkbox
            v-model="selection"
            val="lineControlSteering"
            label="线控转向"
            color="orange"
          />
          <q-checkbox
            v-model="selection"
            val="rearWheelSteering"
            label="后轮转向"
            color="red"
          />
          <q-checkbox
            v-model="selection"
            val="activeSuspension"
            disable
            label="主动悬架"
          />
          <q-checkbox
            v-model="selection"
            val="torqueDistribution"
            label="扭矩分配"
            color="cyan"
          /> -->
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md row">
        <div class="row q-col-gutter-md" style="flex: 1">
          <div
            class="col-3 col-xs-12 col-sm-2 full-height column justify-around q-pa-md"
          >
            <div>
              <div class="text-h6">稳定性</div>
              <div class="row justify-between">
                <span> 稳定</span>
                <span> 灵动</span>
              </div>
              <q-slider
                color="orange"
                v-model="stability"
                @change="(value) => handleSliderChange('stability', value)"
              />
            </div>
            <div>
              <div class="text-h6">稳态特性</div>
              <div class="row justify-between">
                <span> 不足转向</span>
                <span> 过度转向 </span>
              </div>
              <q-slider
                color="orange"
                v-model="steadyStateCharacteristic"
                @change="
                  (value) =>
                    handleSliderChange('steadyStateCharacteristic', value)
                "
              />
            </div>
            <div>
              <div class="text-h6">横摆响应</div>
              <div class="row justify-between">
                <span> 沉稳</span>
                <span> 敏捷</span>
              </div>
              <q-slider
                color="orange"
                v-model="yawResponse"
                @change="(value) => handleSliderChange('yawResponse', value)"
              />
            </div>
            <div class="row justify-end">
              <q-icon
                key="pause"
                :name="playStatus === 'play' ? 'pause_circle' : 'play_circle'"
                size="4.4em"
                @click="handlePlayStatusChange"
              />
            </div>
          </div>
          <div class="col-9 col-xs-12 col-sm-10 full-height column">
            <div class="col-3">
              <div class="absolute z-top">
                <q-badge color="orange" text-color="black">
                  $\delta_{FA}\dot\psi$
                </q-badge>
              </div>

              <Charts :options="chartsOptions" />
            </div>
            <div class="col-3">
              <div class="absolute z-top">
                <q-badge color="orange" text-color="black">
                  $Mb_{FL/FR/RL/RR}$
                </q-badge>
              </div>

              <Charts :options="chartsOptions" />
            </div>
            <div class="col-3">
              <div class="absolute z-top">
                <q-badge color="orange" text-color="black">
                  $\delta_{offs,FA}$
                </q-badge>
              </div>

              <Charts :options="chartsOptions" />
            </div>
            <div class="col-3">
              <div class="absolute z-top">
                <q-badge color="orange" text-color="black">$a_y$</q-badge>
              </div>
              <Charts :options="chartsOptions" />
            </div>
          </div>
        </div>
        <q-inner-loading :showing="!!loading[0]">
          <q-spinner-radio color="red" size="3em" />
        </q-inner-loading>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import Charts from "src/components/Charts";
import { ESP32BLEBluetooth } from "src/services/domainControl";
import {
  ICC_SERVICE,
  NOTIFY,
  WIRE_CONTROL,
  LINE_CONTROL_STEERING,
  REAR_WHEEL_STEERING,
  ACTIVE_SUSPENSION,
  TORQUE_DISTRIBUTION,
  STABILITY,
  STEADY_STATE_CHARACTERISTIC,
  YAW_RESPONSE,
  REST,
} from "@/services/domainControl/icc";
import { getChartsDefaultOptions, options } from "./helper/icc";
import { isWeb } from "app/src-capacitor";

type PlayStatus = "play" | "pause" | "stop";
const SECOND = 1000; // 1 m
const LIMIT = 200 * SECOND; // 屏幕内一共展示多少秒
const STEPSIZE = 200; // 每 200 ms 接收一回通知
const INTERVAL = LIMIT / STEPSIZE; // 屏幕内一共展示多少个数据
const isNotifyed = { current: false };

const getDefaultSeriesData = () => {
  // 每 STEPSIZE 毫秒生成一个 数据点
  const timestamp = Date.now();
  const data = Array.from({ length: INTERVAL }, (_, i) => [
    timestamp - i * STEPSIZE,
  ]);
  return data;
};

const props = defineProps({
  isConnected: {
    type: Boolean,
    default: true,
  },
});
// function func(x) {
//   x /= 10;
//   return Math.sin(x) * Math.cos(x * 2 + 1) * Math.sin(x * 3 + 2) * 50;
// }
// function generateData() {
//   let data = [];
//   for (let i = -200; i <= 200; i += 0.1) {
//     data.push([i, func(i)]);
//   }
//   console.log("[BOWEN_LOG] 🚀 ~~ generateData ~~ data:", data);
//   return data;
// }

const loading = ref([] as boolean[]);

const selection = ref(["wireControl"]);
const playStatus = ref<PlayStatus>(isWeb ? "play" : "pause");
const stability = ref(0);
const steadyStateCharacteristic = ref(0);
const yawResponse = ref(0);

const seriesData = ref(getDefaultSeriesData() as any[][]);

const chartsOptions = computed(() => {
  return getChartsDefaultOptions(JSON.parse(JSON.stringify(seriesData.value)));
});

const handleSliderChange = (type: string, value: string) => {
  console.log("[BOWEN_LOG] 🚀 ~~ handleSliderChange ~~ value:", value);
  switch (type) {
    case "stability":
      write(value, STABILITY.uuid);
      break;
    case "steadyStateCharacteristic":
      write(value, STEADY_STATE_CHARACTERISTIC.uuid);
      break;
    case "yawResponse":
      write(value, YAW_RESPONSE.uuid);
      break;
  }
};
const handleSelectionChange = (type: string, value: string) => {
  console.log("[BOWEN_LOG] 🚀 ~~ handleSelectionChange ~~ value:", type, value);
  switch (type) {
    case "wireControl":
      write(value, WIRE_CONTROL.uuid);
      break;
    case "lineControlSteering":
      write(value, LINE_CONTROL_STEERING.uuid);
      break;
    case "rearWheelSteering":
      write(value, REAR_WHEEL_STEERING.uuid);
      break;
    case "activeSuspension":
      write(value, ACTIVE_SUSPENSION.uuid);
      break;
    case "torqueDistribution":
      write(value, TORQUE_DISTRIBUTION.uuid);
      break;
  }
};

// 数字转化为 16进制
const toHex = (num: number) => {
  return num.toString(16);
};

async function write(data: string, uuid: any) {
  try {
    await ESP32BLEBluetooth.writeData(data + "", ICC_SERVICE.uuid, uuid);
    const value = await ESP32BLEBluetooth.readData(ICC_SERVICE.uuid, uuid);
    console.log("[BOWEN_LOG] 🚀 ~~ write ~~ value:", value, toHex(uuid));
  } catch (error) {
    console.error(
      "[write] Error getting services and write characteristics:",
      error,
    );
  }
}

onMounted(() => {
  console.log(
    "[BOWEN_LOG] 🚀 ~~ onMounted ~~ chartsOptions:",
    chartsOptions.value,
  );
  if (props.isConnected) {
    if (isWeb) startNotifications();
  }
  MathJax.typeset();
});
onUnmounted(() => {
  MathJax.typeset();
  isNotifyed.current = true;
});

const handleNotify = (value: string) => {
  if (playStatus.value !== "play") return;
  if (seriesData.value.length >= INTERVAL) seriesData.value.shift();
  seriesData.value.push([Date.now(), parseInt(value)]);
  // console.log(
  //   "[BOWEN_LOG] 🚀 ~~ handleNotify ~~ event:",
  //   event.target.service.uuid,
  //   // seriesData.value,
  //   Date.now()
  // );
};
const startNotifications = async () => {
  loading.value[0] = true;
  console.log("[BOWEN_LOG] 🚀 ~~ startNotifications ~~ loading:", loading);
  await ESP32BLEBluetooth.startNotifications(
    handleNotify,
    ICC_SERVICE.uuid,
    NOTIFY.uuid,
  )?.finally(() => (loading.value[0] = false));
  isNotifyed.current = true;
};

const handlePlayStatusChange = () => {
  playStatus.value = playStatus.value === "play" ? "pause" : "play";
  if (playStatus.value === "play") {
    seriesData.value = getDefaultSeriesData();
    if (!isNotifyed.current) startNotifications();
  }
};
// 监听 isConnected 变化
watch(
  () => props.isConnected,
  (newValue) => {
    if (newValue) {
      // ESP32BLEBluetooth.startNotifications(
      //   handleNotify,
      //   ESP32BLE.services[0].uuid,
      //   ESP32BLE.services?.[0]?.characteristics?.[0]?.uuid || ""
      // );
    }
  },
);
//  watch section
watch(
  () => selection.value,
  (newValue, oldValue) => {
    // 判断新加了的值
    if (newValue.length > oldValue.length) {
      const newAdded = newValue.filter((item) => !oldValue.includes(item));

      handleSelectionChange(newAdded[0], "1");
    }
    if (newValue.length < oldValue.length) {
      const removed = oldValue.filter((item) => !newValue.includes(item));
      handleSelectionChange(removed[0], "0");
    }
  },
);
</script>

<style scoped></style>
