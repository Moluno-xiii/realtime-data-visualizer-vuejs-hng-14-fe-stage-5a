<script setup lang="ts">
import { computed, markRaw } from 'vue'
import VChart from 'vue-echarts'
import {
  bootstrapECharts,
  baseAxisLine,
  baseGrid,
  baseTooltip,
  chartPalette,
  compareColor,
} from '@/charts/echartsBootstrap'
import type { PricePoint, ChartKind } from '@/types/market'
import ChartLoading from './ChartLoading.vue'

bootstrapECharts()

export interface OverlaySeries {
  symbol: string
  label: string
  series: PricePoint[]
}

const props = withDefaults(
  defineProps<{
    series: PricePoint[]
    primaryLabel?: string
    overlays?: OverlaySeries[]
    kind?: Exclude<ChartKind, 'candle'>
    height?: number
    showVolume?: boolean
    volumes?: number[]
  }>(),
  { kind: 'area', height: 320, showVolume: false, overlays: () => [] },
)

const isCompare = computed(
  () => props.overlays.length > 0 && props.kind !== 'bar',
)

function toPct(points: PricePoint[]): [number, number][] {
  const base = points[0]?.v
  if (!base || base === 0) return points.map((d) => [d.t, 0])
  return points.map((d) => [d.t, ((d.v - base) / base) * 100])
}

const option = computed(() => {
  const p = chartPalette()
  const primaryData = props.series.map((d) => [d.t, d.v] as [number, number])
  const direction =
    (primaryData[primaryData.length - 1]?.[1] ?? 0) >=
    (primaryData[0]?.[1] ?? 0)
      ? 'up'
      : 'down'
  const primaryColor = direction === 'up' ? p.up : p.down
  const fillTop =
    direction === 'up'
      ? 'rgba(127,232,160,0.28)'
      : 'rgba(255,107,107,0.24)'

  const primaryLabel = props.primaryLabel ?? 'Price'

  if (isCompare.value) {
    const tooltip = baseTooltip()
    const overlaySeries = props.overlays
      .filter((o) => o.series.length > 0)
      .map((o, i) => {
        const color = compareColor(i)
        return {
          name: o.label,
          type: 'line',
          showSymbol: false,
          smooth: 0.18,
          sampling: 'lttb',
          data: toPct(o.series),
          lineStyle: { color, width: 1.2 },
          emphasis: { focus: 'series' },
        }
      })

    return markRaw({
      animation: true,
      animationDuration: 240,
      legend: {
        top: 0,
        right: 8,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          color: p.inkDim,
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 10,
        },
        inactiveColor: p.inkFaint,
      },
      tooltip: {
        ...tooltip,
        valueFormatter: (v: unknown) => {
          const n = Number(v)
          if (!Number.isFinite(n)) return '-'
          const sign = n > 0 ? '+' : ''
          return `${sign}${n.toFixed(2)}%`
        },
      },
      grid: baseGrid({ left: 56, right: 16, top: 30, bottom: 28 }),
      xAxis: {
        type: 'time',
        ...baseAxisLine(),
      },
      yAxis: {
        type: 'value',
        scale: true,
        position: 'right',
        ...baseAxisLine(),
        axisLabel: {
          ...baseAxisLine().axisLabel,
          formatter: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`,
        },
      },
      series: [
        {
          name: primaryLabel,
          type: 'line',
          showSymbol: false,
          smooth: 0.18,
          sampling: 'lttb',
          data: toPct(props.series),
          lineStyle: { color: p.accent, width: 1.8 },
          emphasis: { focus: 'series' },
        },
        ...overlaySeries,
      ],
    })
  }

  const base: Record<string, unknown> = {
    animation: true,
    animationDuration: 240,
    tooltip: baseTooltip(),
    grid: baseGrid({ left: 56, right: 16, top: 18, bottom: props.showVolume ? 60 : 28 }),
    xAxis: {
      type: 'time',
      min: primaryData[0]?.[0],
      max: primaryData[primaryData.length - 1]?.[0],
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
        name: primaryLabel,
        type: 'bar',
        data: primaryData,
        itemStyle: { color: primaryColor, borderRadius: 0 },
        barMaxWidth: 6,
      },
    ]
  } else {
    base.series = [
      {
        name: primaryLabel,
        type: 'line',
        showSymbol: false,
        smooth: 0.18,
        sampling: 'lttb',
        data: primaryData,
        lineStyle: { color: primaryColor, width: 1.5 },
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
      data: primaryData.map((d, i) => [d[0], props.volumes![i] ?? 0]),
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
