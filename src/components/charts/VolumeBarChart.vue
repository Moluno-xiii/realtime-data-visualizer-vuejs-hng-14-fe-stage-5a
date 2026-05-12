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
  { height: 220 },
)

const option = computed(() => {
  const p = chartPalette()
  return markRaw({
    animation: true,
    animationDuration: 220,
    tooltip: baseTooltip(),
    grid: baseGrid({ left: 56, right: 16, top: 16, bottom: 30 }),
    xAxis: {
      type: 'time',
      min: props.candles[0]?.t,
      max: props.candles[props.candles.length - 1]?.t,
      ...baseAxisLine(),
    },
    yAxis: { type: 'value', position: 'right', ...baseAxisLine() },
    series: [
      {
        type: 'bar',
        data: props.candles.map((c) => ({
          value: [c.t, c.v],
          itemStyle: {
            color: c.c >= c.o ? p.up : p.down,
            opacity: 0.72,
          },
        })),
        barMaxWidth: 6,
        emphasis: { disabled: true },
      },
    ],
  })
})
</script>

<template>
  <ChartLoading v-if="!candles.length" :height="height" label="Volume" />
  <div v-else class="w-full" :style="{ height: `${height}px` }">
    <VChart :option="option" :autoresize="true" />
  </div>
</template>
