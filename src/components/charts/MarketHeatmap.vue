<script setup lang="ts">
import { computed, markRaw } from 'vue'
import VChart from 'vue-echarts'
import {
  bootstrapECharts,
  chartPalette,
  heatColor,
} from '@/charts/echartsBootstrap'
import ChartLoading from './ChartLoading.vue'
import { formatCompact, formatPct, formatPrice } from '@/utils/format'

bootstrapECharts()

export interface HeatTile {
  symbol: string
  label: string
  price: number
  changePct: number
  volume: number
}

const props = withDefaults(
  defineProps<{
    tiles: HeatTile[]
    height?: number
  }>(),
  { height: 320 },
)

const emit = defineEmits<{ (e: 'select', symbol: string): void }>()

const option = computed(() => {
  const p = chartPalette()
  const data = props.tiles
    .filter((t) => Number.isFinite(t.volume) && t.volume > 0)
    .map((t) => ({
      name: t.label,
      value: t.volume,
      pct: t.changePct,
      price: t.price,
      symbol: t.symbol,
      itemStyle: {
        color: heatColor(t.changePct),
        borderColor: p.border,
        borderWidth: 1,
        gapWidth: 2,
      },
      label: {
        formatter: () => {
          const sign = t.changePct >= 0 ? '+' : ''
          return `{name|${t.label}}\n{pct|${sign}${t.changePct.toFixed(2)}%}`
        },
      },
    }))

  return markRaw({
    animation: true,
    animationDuration: 320,
    tooltip: {
      backgroundColor: p.surface,
      borderColor: p.border,
      borderWidth: 1,
      padding: [8, 10],
      textStyle: {
        color: p.ink,
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 11,
      },
      formatter: (params: unknown) => {
        const d = (params as { data?: Record<string, unknown> }).data
        if (!d) return ''
        const label = String(d.label ?? d.name ?? '')
        const pct = Number(d.pct ?? 0)
        const price = Number(d.price ?? 0)
        const volume = Number(d.value ?? 0)
        const color = pct >= 0 ? p.up : p.down
        return `<div style="line-height:1.5">
          <div style="color:${p.inkMute};margin-bottom:4px;text-transform:uppercase;letter-spacing:0.08em;font-size:10px">${label}</div>
          <div>Price <span style="color:${p.ink}">$${formatPrice(price)}</span></div>
          <div>24h <span style="color:${color}">${formatPct(pct)}</span></div>
          <div>Vol <span style="color:${p.inkDim}">$${formatCompact(volume)}</span></div>
        </div>`
      },
    },
    series: [
      {
        type: 'treemap',
        data,
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        leafDepth: 1,
        squareRatio: 0.5 * (1 + Math.sqrt(5)),
        label: {
          show: true,
          color: p.ink,
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 11,
          lineHeight: 14,
          rich: {
            name: {
              color: p.ink,
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: 12,
              fontWeight: 600,
              padding: [0, 0, 2, 0],
            },
            pct: {
              color: p.inkDim,
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: 10,
            },
          },
        },
        itemStyle: {
          borderColor: p.border,
          borderWidth: 1,
          gapWidth: 2,
        },
        emphasis: {
          itemStyle: {
            borderColor: p.accent,
            borderWidth: 1,
          },
          label: { color: p.ink },
        },
      },
    ],
  })
})

function onClick(params: unknown) {
  const data = (params as { data?: { symbol?: unknown } }).data
  const sym = typeof data?.symbol === 'string' ? data.symbol : ''
  if (sym) emit('select', sym)
}
</script>

<template>
  <ChartLoading
    v-if="!tiles.length"
    :height="height"
    label="Market map"
    hint="awaiting tickers"
  />
  <div v-else class="hm w-full" :style="{ height: `${height}px` }">
    <VChart :option="option" :autoresize="true" @click="onClick" />
  </div>
</template>

<style scoped>
.hm :deep(canvas) {
  display: block;
  cursor: pointer;
}
</style>
