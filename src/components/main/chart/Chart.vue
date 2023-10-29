<script setup>
import { useModelStore } from "../../../stores/model"
import { useStatusStore } from "../../../stores/status"
import { useConfigStore } from "../../../stores/config"
import { onMounted, watch } from "vue"
import * as echarts from "echarts/core"
import { LineChart, BarChart } from "echarts/charts"
import {
    TitleComponent,
    ToolboxComponent,
    LegendComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    MarkPointComponent,
} from "echarts/components"
import { LabelLayout, UniversalTransition } from "echarts/features"
import { CanvasRenderer } from "echarts/renderers"

let chart
const elProgressHeight = 6
const model = useModelStore()
const status = useStatusStore()
const config = useConfigStore()
const props = defineProps({
    width: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
})
const tolerance = config.task.loadStep[0].subStep[0].rsdl
const option = {
    title: {},
    toolbox: {
        show: true,
        feature: {
            dataView: { show: true, readOnly: false },
            saveAsImage: { show: true },
        },
    },
    tooltip: {
        trigger: "axis",
    },
    legend: {
        top: 40,
    },
    grid: [
        {
            show: true,
            top: 70,
            bottom: 120,
            borderWidth: 0,
        },
        {
            show: true,
            height: 40,
            bottom: 20,
            borderWidth: 0,
        },
    ],
    xAxis: [
        {
            gridIndex: 0,
            type: "value",
            min: 1,
            name: "迭代步",
            nameLocation: "center",
            nameGap: -30,
            nameTextStyle: {
                fontFamily: "Microsoft YaHei",
                fontSize: 12,
            },
        },
        {
            gridIndex: 1,
            type: "value",
            show: false,
            max: 100,
        },
    ],
    yAxis: [
        {
            gridIndex: 0,
            min: tolerance / 10,
            type: "log",
            axisLabel: {
                formatter: function (value) {
                    return value.toExponential(2)
                },
            },
        },
        {
            gridIndex: 1,
            type: "category",
            show: false,
            data: [""],
        },
    ],
}
const series = [
    {
        xAxisIndex: 0,
        yAxisIndex: 0,
        name: "误差",
        type: "line",
        showSymbol: false,
        smooth: true,
        data: [],
        color: "blue",
        tooltip: {
            valueFormatter: function (value) {
                return value.toExponential(2)
            },
        },
    },
    {
        xAxisIndex: 0,
        yAxisIndex: 0,
        name: "误差限值",
        type: "line",
        showSymbol: false,
        smooth: true,
        data: [],
        color: "red",
        tooltip: {
            valueFormatter: function (value) {
                return value.toExponential(2)
            },
        },
    },
    {
        xAxisIndex: 1,
        yAxisIndex: 1,
        name: "计算进度",
        type: "bar",
        barWidth: 20,
        data: [],
        color: "green",
        showBackground: true,
        backgroundStyle: {
            color: "rgba(180, 180, 180, 0.2)",
        },
        markPoint: {
            symbol: "pin",
            symbolSize: 50,
            symbolOffset: [0, -10],
            data: [
                {
                    name: "maximum",
                    type: "max",
                },
            ],
            label: {
                formatter: function (component) {
                    return Math.round(component.value) + "%"
                },
            },
        },
        tooltip: {
            valueFormatter: function (value) {
                return Math.round(value) + "%"
            },
        },
    },
]
let start = 0
onMounted(() => {
    echarts.use([
        TitleComponent,
        ToolboxComponent,
        TooltipComponent,
        LegendComponent,
        GridComponent,
        DatasetComponent,
        TransformComponent,
        LineChart,
        BarChart,
        MarkPointComponent,
        LabelLayout,
        UniversalTransition,
        CanvasRenderer,
    ])
    const canvas = document.getElementById("chart")
    chart = echarts.init(canvas, null, { width: 0, height: 0 })
    chart.setOption(option)
    model.result.forEach(res => {
        series[0].data.push([res.step, res.rsdl])
        series[1].data.push([res.step, tolerance])
    })
    series[2].data.pop()
    series[2].data.push(status.taskQueryProgress * 100)
    chart.setOption({ series })
    start = model.result.length - 1
})
watch(
    () => model.result.length,
    (now, pre) => {
        if (now == 0) {
            series.forEach((item) => (item.data = []))
            series[2].data.push(0)
        } else {
            if (start != 0) {
                start = pre
            }
            for (let i = start; i < now; i++) {
                let result = model.result[i]
                series[0].data.push([result.step, result.rsdl])
                series[1].data.push([result.step, tolerance])
            }
            start = now
        }
        series[2].data.pop()
        series[2].data.push(status.taskQueryProgress * 100)
        chart.setOption({ series })
    }
)
watch(
    () => [props.height, props.width],
    ([height, width]) => {
        chart.resize({ height, width })
    }
);
</script>
<template>
    <div id="chart"></div>
</template>

<style></style>