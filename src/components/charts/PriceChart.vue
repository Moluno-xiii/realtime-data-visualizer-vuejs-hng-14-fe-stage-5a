<script setup lang="ts">
import { computed, markRaw } from 'vue'
import VChart from 'vue-echarts'
import {
  bootstrapECharts,
  baseAxisLine,
  baseGrid,
  baseTooltip,
  chartPalette,
} from '@/charts/echartsBootstrap'
import type { PricePoint, ChartKind } from '@/types/market'
import ChartLoading from './ChartLoading.vue'

bootstrapECharts()

const props = withDefaults(
  defineProps<{
    series: PricePoint[]
    kind?: Exclude<ChartKind, 'candle'>
    height?: number
    showVolume?: boolean
    volumes?: number[]
  }>(),
  { kind: 'area', height: 320, showVolume: false },
)

const option = computed(() => {
  const p = chartPalette()
  const data = props.series.map((d) => [d.t, d.v] as [number, number])
  const direction =
    (data[data.length - 1]?.[1] ?? 0) >= (data[0]?.[1] ?? 0) ? 'up' : 'down'
  const lineColor = direction === 'up' ? p.up : p.down
  const fillTop =
    direction === 'up'
      ? 'rgba(127,232,160,0.28)'
      : 'rgba(255,107,107,0.24)'

  const base: Record<string, unknown> = {
    animation: true,
    animationDuration: 240,
    tooltip: baseTooltip(),
    grid: baseGrid({ left: 56, right: 16, top: 18, bottom: props.showVolume ? 60 : 28 }),
    xAxis: {
      type: 'time',
      min: data[0]?.[0],
      max: data[data.length - 1]?.[0],
      ...baseAxisLine(),
    },
    yAxis: {
      type: 'value',
      scale: true,
      position: 'right',
      ...baseAxisLine(),
      axisLabel: {
        ...baseAxisLine().axisLabel,
        formatter: (v: number) =>
          v >= 1000
            ? v.toLocaleString('en-US', { maximumFractionDigits: 0 })
            : v.toFixed(2),
      },
    },
    series: [] as unknown[],
  }

  if (props.kind === 'bar') {
    base.series = [
      {
        type: 'bar',
        data,
        itemStyle: { color: lineColor, borderRadius: 0 },
        barMaxWidth: 6,
      },
    ]
  } else {
    base.series = [
      {
        type: 'line',
        showSymbol: false,
        smooth: 0.18,
        sampling: 'lttb',
        data,
        lineStyle: { color: lineColor, width: 1.5 },
        areaStyle:
          props.kind === 'area'
            ? {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: fillTop },
                    { offset: 1, color: 'rgba(0,0,0,0)' },
                  ],
                },
              }
            : undefined,
        emphasis: { disabled: true },
      },
    ]
  }

  if (props.showVolume && props.volumes?.length) {
    ;(base.series as unknown[]).push({
      type: 'bar',
      data: data.map((d, i) => [d[0], props.volumes![i] ?? 0]),
      xAxisIndex: 1,
      yAxisIndex: 1,
      itemStyle: { color: p.inkFaint, opacity: 0.7 },
      barMaxWidth: 4,
    })
    ;(base.xAxis as object[]) = [
      base.xAxis as object,
      { type: 'time', show: false, gridIndex: 1 },
    ]
    ;(base.yAxis as object[]) = [
      base.yAxis as object,
      { type: 'value', show: false, gridIndex: 1, scale: true },
    ]
    base.grid = [
      baseGrid({ left: 56, right: 16, top: 18, bottom: 80 }),
      { left: 56, right: 16, top: '78%', height: 44, containLabel: false },
    ]
  }

  return markRaw(base)
})
</script>

<template>
  <ChartLoading v-if="!series.length" :height="height" />
  <div v-else class="pc w-full" :style="{ height: `${height}px` }">
    <VChart :option="option" :autoresize="true" />
  </div>
</template>

<style scoped>
.pc :deep(canvas) {
  display: block;
}
</style>
