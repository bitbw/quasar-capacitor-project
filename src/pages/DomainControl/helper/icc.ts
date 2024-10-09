import { EChartsOption } from "echarts";

export const getChartsDefaultOptions = (data: any[][]) => {
  const xAxisDate = data.map((item) => item[0]);
  return {
    // animation: true,
    //   legend: {
    //     show: true,
    //     // x: "4%",
    //     top: "20px",
    //     data: ["123"],
    //     // type: "scroll",
    //     textStyle: {
    //       color: "#cccccc",
    //       fontWeight: 700,
    //       fontSize: 12,
    //     },
    //     formatter: function (name) {
    //       return name;
    //     },
    //   },
    tooltip: {
      show: true,
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    grid: {
      top: 30,
      left: 30,
      right: 30,
      bottom: 30,
    },
    xAxis: {
      data: xAxisDate,
      type: "time",
      minorTick: {
        show: true,
      },
      minorSplitLine: {
        show: true,
      },
    },
    yAxis: {
      type: "value",
      minorTick: {
        show: true,
      },
      minorSplitLine: {
        show: true,
      },
    },
    dataZoom: [
      {
        show: true,
        type: "inside",
        filterMode: "none",
      },
    ],
    series: [
      {
        type: "line",
        showSymbol: false,
        clip: true,
        data: data,
        // label: {
        //   formatter: function (params) {
        //     return {
        //       // 使用 MathJax 的语法包裹公式
        //       text: "Value: $y = 2x + 3$",
        //       rich: {},
        //     };
        //   },
        // },
      },
    ],
  } as EChartsOption;
};

export const options = [
  {
    value: "wireControl",
    label: "线控制动",
  },
  {
    value: "lineControlSteering",
    label: "线控转向",
    
  },
  {
    value: "rearWheelSteering",
    label: "后轮转向",
  },
  {
    value: "activeSuspension",
    label: "主动悬架",
    disable: true,
  },
  {
    value: "torqueDistribution",
    label: "扭矩分配",
  },
];
