<template>
  <div class="chart">
    <!-- <q-resize-observer @resize="onResize" /> -->
    <v-chart class="chart" :option="option" ref="chartRef" />
  </div>
</template>

<script setup lang="ts">
import { registerTheme, use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart, LineChart, BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { ref, provide, computed, onMounted, onUnmounted } from "vue";
import theme from "./theme.json";
// echarts config
use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
]);

registerTheme("ovilia-green", theme);

provide(THEME_KEY, "ovilia-green");

const props = defineProps({
  options: {
    type: Object,
    default: () => ({
      title: {
        text: "Traffic Sources",
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "left",
        data: ["Direct", "Email", "Ad Networks", "Video Ads", "Search Engines"],
      },
      series: [
        {
          name: "Traffic Sources",
          type: "line",
          radius: "55%",
          center: ["50%", "60%"],
          data: [
            { value: 335, name: "Direct" },
            { value: 310, name: "Email" },
            { value: 234, name: "Ad Networks" },
            { value: 135, name: "Video Ads" },
            { value: 1548, name: "Search Engines" },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    }),
  },
});
const chartRef = ref();

const option = computed(() => props.options);

const onResize = () => {
  if (!chartRef.value) return;
  chartRef.value?.resize?.();
};

onMounted(() => {
  setTimeout(() => {
    onResize();
  }, 500);
  window.addEventListener("resize", onResize);
  // chartRef.value?.on?.("finished", function () {
  //   MathJax.typeset();
  // });
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  // chartRef.value?.off?.("finished");
});
</script>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
}
</style>
