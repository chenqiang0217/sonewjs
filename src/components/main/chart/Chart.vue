<script setup>
import { useModelStore } from '../../../stores/model'
import { useStatusStore } from '../../../stores/status'
import { useConfigStore } from '../../../stores/config'
import { CONSTANT } from '../../../stores/constant'
import { onMounted, watch, computed } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import {
    TitleComponent,
    ToolboxComponent,
    LegendComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    MarkPointComponent,
    MarkLineComponent,
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

let chart
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
        trigger: 'axis',
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
            type: 'value',
            min: 1,
            max: 'dataMax',
            name: '迭代步',
            nameLocation: 'center',
            nameGap: 25,
            nameTextStyle: {
                fontFamily: 'Microsoft YaHei',
                fontSize: 12,
            },
            splitLine: {
                show: false
            },
            data: []
        },
        {
            gridIndex: 1,
            type: 'value',
            show: false,
            max: 100,
        },
    ],
    yAxis: [
        {
            gridIndex: 0,
            min: 'dataMin',
            type: 'log',
            splitNumber: 10,
            axisLabel: {
                formatter: function (value) {
                    return value.toExponential(2)
                },
            },
        },
        {
            gridIndex: 1,
            type: 'category',
            show: false,
            data: [''],
        },
    ],
}
const series = [
    {
        xAxisIndex: 0,
        yAxisIndex: 0,
        name: '误差',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: [],
        itemStyle: {
            color: 'rgb(0, 0, 255)',
        },
        tooltip: {
            valueFormatter: function (value) {
                return value.toExponential(2)
            },
        },
        markLine: {
            silent: true,
            symbol: ['none', 'none'],
            label: { show: false },
            lineStyle: {
                width: 1,
                color: 'rgb(220, 223, 230)',
                type: 'solid'
            },
            data: []
        }

    },
    {
        xAxisIndex: 0,
        yAxisIndex: 0,
        name: '梯度因子',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: [],
        itemStyle: {
            color: 'rgb(110, 110, 110)',
        },
        lineStyle: {
            width: 1,
        },
        tooltip: {
            valueFormatter: function (value) {
                return value.toExponential(2)
            },
        },
    },
    {
        xAxisIndex: 0,
        yAxisIndex: 0,
        name: '误差限值',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: [],
        itemStyle: {
            color: 'rgb(255, 0, 0)',
        },
        tooltip: {
            valueFormatter: function (value) {
                return value.toExponential(2)
            },
        },
    },
    {
        xAxisIndex: 1,
        yAxisIndex: 1,
        name: '计算进度',
        type: 'bar',
        barWidth: 20,
        data: [],
        color: 'green',
        showBackground: true,
        backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)',
        },
        markPoint: {
            symbol: 'pin',
            symbolSize: 50,
            symbolOffset: [0, -10],
            data: [
                {
                    name: 'maximum',
                    type: 'max',
                },
            ],
            label: {
                formatter: function (component) {
                    return Math.round(component.value) + '%'
                },
            },
        },
        tooltip: {
            valueFormatter: function (value) {
                return Math.round(value) + '%'
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
        MarkLineComponent,
        LabelLayout,
        UniversalTransition,
        CanvasRenderer,
    ])
    const canvas = document.getElementById('chart')
    chart = echarts.init(canvas, null, { width: 0, height: 0 })
    chart.setOption(option)
    model.result.forEach(result => {
        series[0].data.push([result.step, result.rsdl])
        series[1].data.push([result.step, result.mu])
        series[2].data.push([result.step, config.task.loadStep
            .find(ls => ls.no == result.loadStep).subStep
            .find(ss => ss.no == result.subStep).rsdl
        ])
    })
    series[3].data.pop()
    series[3].data.push(progress.value * 100)
    chart.setOption({ series })
    start = model.result.length - 1
})
const progress = computed(() => {
    let totalStep = 0
    config.task.loadStep.forEach((loadStep) => {
        loadStep.subStep.forEach(subStep => totalStep += subStep.nIterativeStep)
    })
    switch (status.task.run) {
        case CONSTANT.TASK.RUN.NONE:
            return 0.0
        case CONSTANT.TASK.RUN.ABORT:
            return 0.0
        case CONSTANT.TASK.RUN.PROGRESS:
            return totalStep ? (status.task.query.step / totalStep) : 0.0
        case CONSTANT.TASK.RUN.SUCCESS:
            return 1.0
        default:
            return 0.0
    }
})
watch(
    () => model.result.length,
    (now, pre) => {
        if (now == 0) {
            series.forEach((item) => (item.data = []))
            series[3].data.push(0)
        } else {
            if (start != 0) {
                start = pre
            }
            for (let i = start; i < now; i++) {
                let result = model.result[i]
                series[0].data.push([result.step, result.rsdl])
                series[1].data.push([result.step, result.mu])
                series[2].data.push([result.step, config.task.loadStep
                    .find(ls => ls.no == result.loadStep).subStep
                    .find(ss => ss.no == result.subStep).rsdl])
            }
            start = now
            const subSteps = model.result.filter((item, index, self) =>
                index === self.findIndex(obj => obj.loadStep === item.loadStep && obj.subStep === item.subStep)
            )
            series[0].markLine.data = subSteps.map(item => (
                { xAxis: model.result.findLast(res => res.loadStep == item.loadStep && res.subStep == item.subStep).step }
            ))
        }
        series[3].data.pop()
        series[3].data.push(progress.value * 100)
        chart.setOption({ series })
    }
)
watch(
    () => [props.height, props.width],
    ([height, width]) => {
        chart.resize({ height, width })
    }
)

</script>
<template>
    <div id='chart'></div>
</template>

<style></style>