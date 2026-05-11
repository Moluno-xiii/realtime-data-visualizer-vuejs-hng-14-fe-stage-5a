<script setup lang="ts">
import { computed, ref } from 'vue'
import ChartCard from '@/components/cards/ChartCard.vue'
import MetricCard from '@/components/cards/MetricCard.vue'
import PriceChart from '@/components/charts/PriceChart.vue'
import VolumeBarChart from '@/components/charts/VolumeBarChart.vue'
import ActivityFeed from '@/components/feed/ActivityFeed.vue'
import SegmentedControl from '@/components/controls/SegmentedControl.vue'
import PauseResume from '@/components/controls/PauseResume.vue'
import {
  FIXTURE_ACTIVITY,
  FIXTURE_TICKERS,
  generateCandles,
  generateSeries,
  SYMBOLS,
} from '@/mocks/fixtures'
import {
  formatCompact,
  formatPrice,
  formatPct,
} from '@/utils/format'
import type { ChartKind, TimeRange } from '@/types/market'

const range = ref<TimeRange>('1h')
const kind = ref<Exclude<ChartKind, 'candle'>>('area')
const paused = ref(false)

const RANGE_OPTS = [
  { value: '1m' as TimeRange, label: '1m' },
  { value: '5m' as TimeRange, label: '5m' },
  { value: '15m' as TimeRange, label: '15m' },
  { value: '1h' as TimeRange, label: '1h' },
  { value: '4h' as TimeRange, label: '4h' },
  { value: 'live' as TimeRange, label: 'Live' },
]

const KIND_OPTS = [
  { value: 'line' as const, label: 'Line' },
  { value: 'area' as const, label: 'Area' },
  { value: 'bar' as const, label: 'Bar' },
]

const stepMs: Record<TimeRange, number> = {
  '1m': 1_000,
  '5m': 5_000,
  '15m': 15_000,
  '1h': 60_000,
  '4h': 240_000,
  live: 1_000,
}
const pointsByRange: Record<TimeRange, number> = {
  '1m': 60,
  '5m': 60,
  '15m': 60,
  '1h': 120,
  '4h': 144,
  live: 90,
}

const heroSeries = computed(() =>
  generateSeries('BTCUSDT', pointsByRange[range.value], stepMs[range.value]),
)

const btcCandles = computed(() => generateCandles('BTCUSDT', 96, 15 * 60_000))

const tickerBy = computed(() => {
  const m = new Map(FIXTURE_TICKERS.map((t) => [t.symbol, t]))
  return m
})

const headlineSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'] as const

const spark = (sym: string) =>
  generateSeries(sym, 48, 60_000).map((p) => p.v)

const topMover = computed(() => {
  return [...FIXTURE_TICKERS].sort(
    (a, b) => Math.abs(b.changePct24h) - Math.abs(a.changePct24h),
  )[0]!
})

const symbolInfo = (sym: string) =>
  SYMBOLS.find((s) => s.symbol === sym)!

const totalVolume = computed(() =>
  FIXTURE_TICKERS.reduce((s, t) => s + t.volume24h, 0),
)
</script>

<template>
  <div class="ov">
    <section class="hero">
      <div class="hero__copy">
        <span class="eyebrow">Pulse · {{ new Date().toUTCString().slice(0, 16) }}</span>
        <h1 class="display hero__title">
          Markets, <em>live</em>.
        </h1>
        <p class="hero__sub">
          A streaming terminal for retail traders who want pro-grade signal —
          without the seven-monitor setup. Watch order flow, momentum, and
          microstructure breathe in real time.
        </p>
        <div class="hero__meta">
          <span class="chip">
            <span class="dot" style="background: var(--accent); box-shadow: 0 0 6px var(--accent)"></span>
            {{ FIXTURE_TICKERS.length }} streams
          </span>
          <span class="chip">
            <span class="mono">${{ formatCompact(totalVolume) }}</span>
            <span class="muted-tone">24h vol</span>
          </span>
          <span class="chip chip--mover">
            <span class="mono">{{ symbolInfo(topMover.symbol).base }}</span>
            <span
              :class="topMover.changePct24h >= 0 ? 'up' : 'down'"
              class="mono"
            >{{ formatPct(topMover.changePct24h) }}</span>
            <span class="muted-tone">top mover</span>
          </span>
        </div>
      </div>
      <div class="hero__cards">
        <MetricCard
          v-for="sym in headlineSymbols"
          :key="sym"
          :label="symbolInfo(sym).base + ' / USDT'"
          :hint="symbolInfo(sym).icon"
          :value="tickerBy.get(sym)!.price"
          :change-pct="tickerBy.get(sym)!.changePct24h"
          :change-abs="tickerBy.get(sym)!.change24h"
          :spark="spark(sym)"
          :format="formatPrice"
          unit="$"
        />
      </div>
    </section>

    <div class="grid">
      <ChartCard
        title="BTC / USDT"
        eyebrow="Live price · synthetic feed"
        :subtitle="`Last ${range === 'live' ? 'live' : range} window · ${kind} view`"
        class="chart-main"
      >
        <template #tools>
          <SegmentedControl
            v-model="range"
            :options="RANGE_OPTS"
            aria-label="Time range"
          />
          <SegmentedControl
            v-model="kind"
            :options="KIND_OPTS"
            aria-label="Chart type"
          />
          <PauseResume v-model:paused="paused" />
        </template>
        <PriceChart :series="heroSeries" :kind="kind" :height="340" />
        <template #footer>
          <div class="legend">
            <span class="legend__dot" style="background: var(--up)"></span>
            <span class="legend__lab">spot · 1m candle reconstruction</span>
            <span class="legend__sep"></span>
            <span class="mono muted-tone">214 msg/s · 38 ms latency · last tick {{ new Date().toLocaleTimeString('en-US', { hour12: false }) }}</span>
          </div>
        </template>
      </ChartCard>

      <ChartCard
        title="Volume"
        eyebrow="BTC · 24h"
        subtitle="15-minute buckets"
        class="chart-vol"
      >
        <VolumeBarChart :candles="btcCandles" :height="240" />
      </ChartCard>

      <ChartCard
        title="Activity"
        eyebrow="Tape · last 30 minutes"
        class="chart-feed"
      >
        <ActivityFeed :events="FIXTURE_ACTIVITY.slice(0, 40)" :show-filters="false" compact />
        <template #footer>
          <RouterLink to="/activity" class="see-all">
            View full activity
            <span aria-hidden="true">→</span>
          </RouterLink>
        </template>
      </ChartCard>
    </div>
  </div>
</template>

<style scoped>
.ov {
  display: flex;
  flex-direction: column;
  gap: var(--s-6);
  padding: var(--s-6) var(--s-6) var(--s-8);
  max-width: var(--maxw);
  margin: 0 auto;
}

.hero {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(0, 1.4fr);
  gap: var(--s-7);
  align-items: stretch;
}

.hero__copy {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding: var(--s-2) 0 0;
}

.hero__title {
  font-size: clamp(48px, 7.2vw, var(--fs-hero));
  margin: 0;
  color: var(--ink);
}
.hero__title em {
  font-style: italic;
  color: var(--accent);
  text-shadow: 0 0 22px var(--accent-soft);
}

.hero__sub {
  margin: 0;
  max-width: 44ch;
  color: var(--ink-dim);
  font-size: var(--fs-lg);
  line-height: 1.5;
}

.hero__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
}
.muted-tone {
  color: var(--ink-mute);
}
.chip--mover {
  gap: 10px;
}

.hero__cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--s-3);
}

.grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  grid-template-rows: auto auto;
  gap: var(--s-4);
}
.chart-main {
  grid-column: 1;
  grid-row: 1 / span 2;
}
.chart-vol {
  grid-column: 2;
  grid-row: 1;
}
.chart-feed {
  grid-column: 2;
  grid-row: 2;
  min-height: 320px;
  max-height: 460px;
}

.legend {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--fs-xs);
  color: var(--ink-mute);
}
.legend__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.legend__lab {
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
}
.legend__sep {
  width: 1px;
  height: 10px;
  background: var(--rule);
}

.see-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--ink-dim);
  transition: color var(--t-fast) var(--ease-out);
}
.see-all:hover {
  color: var(--accent);
}

@media (max-width: 1180px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero__cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .ov {
    padding: var(--s-4);
    gap: var(--s-5);
  }
  .grid {
    grid-template-columns: 1fr;
  }
  .chart-main,
  .chart-vol,
  .chart-feed {
    grid-column: 1;
    grid-row: auto;
  }
  .hero__cards {
    grid-template-columns: 1fr;
  }
}
</style>
