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
    const wobble = Math.sin(tick.value * 0.5 + info.symbol.length) * t.price * 0.001
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
  <div class="hp" aria-label="Live terminal preview">
    <div class="hp__chrome">
      <span class="hp__dot" aria-hidden="true"></span>
      <span class="hp__dot hp__dot--mid" aria-hidden="true"></span>
      <span class="hp__dot hp__dot--end" aria-hidden="true"></span>
      <span class="hp__title">tape · BTC / USDT · live</span>
      <span class="hp__lat mono">38ms</span>
    </div>
    <div class="hp__body">
      <div class="hp__main">
        <header class="hp__head">
          <div class="hp__sym">
            <span class="hp__icon">₿</span>
            <span class="hp__pair">BTC<span class="hp__quote">/USDT</span></span>
          </div>
          <div class="hp__last">
            <span class="hp__usd">$</span>
            <AnimatedNumber :value="btcPrice" :format="formatPrice" class="hp__num" />
            <span class="hp__chg mono up">+2.84%</span>
          </div>
        </header>
        <PriceChart :series="heroSeries" kind="area" :height="200" />
        <footer class="hp__legend mono">
          <span class="hp__legend-dot"></span>
          <span>spot · 1m · synthetic feed</span>
          <span class="hp__legend-sep"></span>
          <span>{{ Math.round(60 + Math.sin(tick * 0.4) * 6) }} msg/s</span>
        </footer>
      </div>
      <aside class="hp__side">
        <span class="eyebrow hp__side-h">Watchlist</span>
        <ul class="hp__rows" role="list">
          <li v-for="r in sideRows" :key="r.info.symbol" class="hp__row">
            <div class="hp__row-l">
              <span class="hp__row-icon">{{ r.info.icon }}</span>
              <span class="hp__row-base">{{ r.info.base }}</span>
            </div>
            <Sparkline :points="r.spark" :width="68" :height="22" />
            <div class="hp__row-r">
              <AnimatedNumber
                :value="r.price"
                :format="(n) => formatPrice(n)"
                class="hp__row-price mono"
              />
              <span
                class="hp__row-chg mono"
                :class="r.chg >= 0 ? 'up' : 'down'"
              >{{ formatPct(r.chg) }}</span>
            </div>
          </li>
        </ul>
        <div class="hp__pulse">
          <span class="dot dot--pulse" aria-hidden="true"></span>
          <span class="mono">streaming</span>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.hp {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border-hi);
  border-radius: var(--r-1);
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.03) inset,
    0 40px 80px -40px rgba(0, 0, 0, 0.6);
}

.hp__chrome {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0 12px;
  background: var(--bg-elev);
  border-bottom: 1px solid var(--rule);
  position: relative;
  z-index: 1;
}
.hp__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ink-faint);
}
.hp__dot--mid {
  background: var(--warn);
}
.hp__dot--end {
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent);
  animation: pulse-dot 1.6s ease-in-out infinite;
}
.hp__title {
  margin-left: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-mute);
}
.hp__lat {
  margin-left: auto;
  font-size: 10px;
  color: var(--ink-faint);
}

.hp__body {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(180px, 0.9fr);
  position: relative;
  z-index: 1;
}

.hp__main {
  padding: 16px 18px 12px;
  border-right: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.hp__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
}
.hp__sym {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}
.hp__icon {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 18px;
}
.hp__pair {
  font-family: var(--font-tech);
  font-weight: 700;
  font-size: 24px;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--ink);
  text-transform: lowercase;
}
.hp__quote {
  color: var(--ink-faint);
  font-size: 16px;
}
.hp__last {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}
.hp__usd {
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: 14px;
}
.hp__num {
  font-size: 28px;
  font-weight: 600;
  color: var(--ink);
}
.hp__chg {
  font-size: 12px;
}

.hp__legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: var(--ink-mute);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.hp__legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--up);
}
.hp__legend-sep {
  width: 1px;
  height: 8px;
  background: var(--rule);
}

.hp__side {
  padding: 14px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.hp__side-h {
  padding-bottom: 4px;
}
.hp__rows {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.hp__row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-top: 1px solid var(--rule);
}
.hp__row:first-child {
  border-top: 0;
}
.hp__row-l {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}
.hp__row-icon {
  font-family: var(--font-mono);
  color: var(--ink-mute);
  font-size: 11px;
  width: 12px;
}
.hp__row-base {
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.03em;
}
.hp__row-r {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}
.hp__row-price {
  font-size: 12px;
  color: var(--ink);
}
.hp__row-chg {
  font-size: 10px;
}

.hp__pulse {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--rule);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-mute);
}
.dot--pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 6px var(--accent);
  animation: pulse-dot 1.6s ease-in-out infinite;
}

@media (max-width: 840px) {
  .hp__body {
    grid-template-columns: 1fr;
  }
  .hp__main {
    border-right: 0;
    border-bottom: 1px solid var(--rule);
  }
}
</style>
