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
import type { Candle } from '@/types/market'
import ChartLoading from './ChartLoading.vue'

bootstrapECharts()

const props = withDefaults(
  defineProps<{ candles: Candle[]; height?: number }>(),
  { height: 360 },
)

function detectStepMs(times: number[]): number {
  if (times.length < 2) return 60_000
  const deltas: number[] = []
  for (let i = 1; i < Math.min(times.length, 12); i++) {
    deltas.push(times[i]! - times[i - 1]!)
  }
  deltas.sort((a, b) => a - b)
  return deltas[Math.floor(deltas.length / 2)] ?? 60_000
}

function formatTick(t: number, stepMs: number): string {
  const d = new Date(t)
  if (stepMs >= 86_400_000) {
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
  }
  if (stepMs >= 3_600_000) {
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) +
      ' ' +
      d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit' }) + 'h'
  }
  return d.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  })
}

const option = computed(() => {
  const p = chartPalette()
  const xs = props.candles.map((c) => c.t)
  const stepMs = detectStepMs(xs)
  const labels = xs.map((t) => formatTick(t, stepMs))
  const ohlc = props.candles.map((c) => [c.o, c.c, c.l, c.h])
  const volumes = props.candles.map((c) => [
    c.t,
    c.v,
    c.c >= c.o ? 1 : -1,
  ])

  return markRaw({
    animation: true,
    animationDuration: 240,
    tooltip: {
      ...baseTooltip(),
      formatter: (params: { seriesType: string; data: unknown[]; axisValueLabel?: string }[]) => {
        const c = params.find((x) => x.seriesType === 'candlestick')
        if (!c) return ''
        const d = c.data as [number, number, number, number, number]
        const [, o, cl, l, h] = d
        const up = cl >= o
        const color = up ? p.up : p.down
        const fmt = (n: number) => n.toFixed(2)
        return `<div style="font-family:JetBrains Mono,monospace;font-size:11px;line-height:1.4">
          <div style="color:${p.inkMute};margin-bottom:4px">${c.axisValueLabel ?? ''}</div>
          <div>O <span style="color:${p.ink}">${fmt(o)}</span></div>
          <div>H <span style="color:${p.ink}">${fmt(h)}</span></div>
          <div>L <span style="color:${p.ink}">${fmt(l)}</span></div>
          <div>C <span style="color:${color}">${fmt(cl)}</span></div>
        </div>`
      },
    },
    grid: [
      baseGrid({ left: 56, right: 16, top: 16, bottom: 96 }),
      { left: 56, right: 16, top: '74%', height: 56, containLabel: false },
    ],
    xAxis: [
      { type: 'category', data: labels, ...baseAxisLine(), boundaryGap: true },
      { type: 'category', data: xs, gridIndex: 1, show: false },
    ],
    yAxis: [
      { type: 'value', scale: true, position: 'right', ...baseAxisLine() },
      { type: 'value', gridIndex: 1, show: false, scale: true },
    ],
    dataZoom: [
      { type: 'inside', xAxisIndex: [0, 1], start: 0, end: 100 },
    ],
    series: [
      {
        type: 'candlestick',
        data: ohlc,
        itemStyle: {
          color: p.up,
          color0: p.down,
          borderColor: p.up,
          borderColor0: p.down,
          borderWidth: 1,
        },
      },
      {
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes.map((v) => ({
          value: [v[0], v[1]],
          itemStyle: {
            color: v[2] === 1 ? p.up : p.down,
            opacity: 0.42,
          },
        })),
        barMaxWidth: 6,
      },
    ],
  })
})
</script>

<template>
  <ChartLoading v-if="!candles.length" :height="height" />
  <div v-else class="w-full" :style="{ height: `${height}px` }">
    <VChart :option="option" :autoresize="true" />
  </div>
</template>
