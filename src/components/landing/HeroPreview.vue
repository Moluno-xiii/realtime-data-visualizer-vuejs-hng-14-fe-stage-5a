<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PriceChart from '@/components/charts/PriceChart.vue'
import Sparkline from '@/components/cards/Sparkline.vue'
import AnimatedNumber from '@/components/cards/AnimatedNumber.vue'
import { FIXTURE_TICKERS, SYMBOLS, generateSeries } from '@/mocks/fixtures'
import { formatPct, formatPrice } from '@/utils/format'

const tick = ref(0)
let timer: number | undefined
onMounted(() => {
  timer = window.setInterval(() => tick.value++, 1200)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const heroSeries = computed(() => {
  const base = generateSeries('BTCUSDT', 80, 60_000, Date.now())
  const d = tick.value
  if (d > 0 && base.length > 2) {
    const last = base[base.length - 1]!
    const sign = (d & 1) === 0 ? 1 : -1
    const nudge = sign * (0.0009 + ((d % 5) / 5) * 0.0006) * last.v
    base[base.length - 1] = { t: last.t, v: Math.max(0.01, last.v + nudge) }
  }
  return base
})

const btcPrice = computed(() => {
  const t = FIXTURE_TICKERS.find((x) => x.symbol === 'BTCUSDT')!
  const wobble = Math.sin(tick.value * 0.6) * t.price * 0.0008
  return t.price + wobble
})

const sideRows = computed(() => {
  const want = ['ETHUSDT', 'SOLUSDT', 'AVAXUSDT']
  return want.map((sym) => {
    const t = FIXTURE_TICKERS.find((x) => x.symbol === sym)!
    const info = SYMBOLS.find((s) => s.symbol === sym)!
    const wobble =
      Math.sin(tick.value * 0.5 + info.symbol.length) * t.price * 0.001
    return {
      info,
      price: t.price + wobble,
      chg: t.changePct24h + Math.sin(tick.value * 0.3) * 0.05,
      spark: generateSeries(sym, 28, 60_000).map((p) => p.v),
    }
  })
})
</script>

<template>
  <div
    class="relative bg-surface border border-border-hi rounded-1 overflow-hidden shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_40px_80px_-40px_rgba(0,0,0,0.6)]"
    aria-label="Live terminal preview"
  >
    <div class="flex items-center gap-2 h-7 px-3 bg-bg-elev border-b border-rule relative z-[1]">
      <span class="w-2 h-2 rounded-full bg-ink-faint" aria-hidden="true"></span>
      <span class="w-2 h-2 rounded-full bg-warn" aria-hidden="true"></span>
      <span class="w-2 h-2 rounded-full bg-accent shadow-[0_0_6px_var(--accent)] animate-pulse-dot" aria-hidden="true"></span>
      <span class="ml-[6px] font-mono text-[10px] uppercase tracking-[0.1em] text-ink-mute">
        tape · BTC / USDT · live
      </span>
      <span class="ml-auto font-mono text-[10px] text-ink-faint">38ms</span>
    </div>
    <div class="hp-body grid grid-cols-[minmax(0,1.8fr)_minmax(180px,0.9fr)] relative z-[1]">
      <div class="px-[18px] pt-4 pb-3 border-r border-rule flex flex-col gap-[10px] min-w-0">
        <header class="flex items-end justify-between gap-[14px]">
          <div class="inline-flex items-baseline gap-2">
            <span class="text-accent font-mono text-lg">₿</span>
            <span class="font-tech font-bold text-2xl tracking-[-0.03em] leading-none text-ink lowercase">
              BTC<span class="text-ink-faint text-base">/USDT</span>
            </span>
          </div>
          <div class="inline-flex items-baseline gap-2">
            <span class="text-ink-mute font-mono text-sm">$</span>
            <AnimatedNumber :value="btcPrice" :format="formatPrice" class="text-[28px] font-semibold text-ink" />
            <span class="text-xs font-mono up">+2.84%</span>
          </div>
        </header>
        <PriceChart :series="heroSeries" kind="area" :height="200" />
        <footer class="flex items-center gap-2 text-[10px] text-ink-mute uppercase tracking-[0.08em] font-mono">
          <span class="w-[6px] h-[6px] rounded-full bg-up"></span>
          <span>spot · 1m · synthetic feed</span>
          <span class="w-px h-2 bg-rule"></span>
          <span>{{ Math.round(60 + Math.sin(tick * 0.4) * 6) }} msg/s</span>
        </footer>
      </div>
      <aside class="px-[14px] pt-[14px] pb-3 flex flex-col gap-2 min-w-0">
        <span class="eyebrow pb-1">Watchlist</span>
        <ul class="list-none m-0 p-0 flex flex-col gap-[2px]" role="list">
          <li
            v-for="r in sideRows"
            :key="r.info.symbol"
            class="grid grid-cols-[auto_1fr_auto] items-center gap-[10px] px-2 py-[7px] border-t border-rule first:border-t-0"
          >
            <div class="inline-flex items-baseline gap-[6px]">
              <span class="font-mono text-ink-mute text-[11px] w-3">{{ r.info.icon }}</span>
              <span class="font-semibold text-xs tracking-[0.03em]">{{ r.info.base }}</span>
            </div>
            <Sparkline :points="r.spark" :width="68" :height="22" />
            <div class="inline-flex flex-col items-end gap-[1px]">
              <AnimatedNumber
                :value="r.price"
                :format="(n) => formatPrice(n)"
                class="text-xs text-ink"
              />
              <span class="text-[10px] font-mono" :class="r.chg >= 0 ? 'up' : 'down'">
                {{ formatPct(r.chg) }}
              </span>
            </div>
          </li>
        </ul>
        <div class="mt-auto inline-flex items-center gap-2 pt-2 border-t border-rule text-[10px] uppercase tracking-[0.08em] text-ink-mute">
          <span class="w-[6px] h-[6px] rounded-full bg-accent shadow-[0_0_6px_var(--accent)] animate-pulse-dot" aria-hidden="true"></span>
          <span class="font-mono">streaming</span>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 840px) {
  .hp-body {
    grid-template-columns: 1fr;
  }
}
</style>
