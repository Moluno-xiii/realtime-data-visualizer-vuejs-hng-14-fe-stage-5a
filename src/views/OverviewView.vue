<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import ChartCard from '@/components/cards/ChartCard.vue'
import MetricCard from '@/components/cards/MetricCard.vue'
import MetricCardSkeleton from '@/components/cards/MetricCardSkeleton.vue'
import PriceChart from '@/components/charts/PriceChart.vue'
import CandlestickChart from '@/components/charts/CandlestickChart.vue'
import VolumeBarChart from '@/components/charts/VolumeBarChart.vue'
import ActivityFeed from '@/components/feed/ActivityFeed.vue'
import SegmentedControl from '@/components/controls/SegmentedControl.vue'
import PauseResume from '@/components/controls/PauseResume.vue'
import { usePause } from '@/composables/usePause'
import { useWatchlist } from '@/composables/useWatchlist'
import { useFocusedSymbol } from '@/composables/useFocusedSymbol'
import { useChartData } from '@/composables/useChartData'
import { useOverlays } from '@/composables/useOverlays'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useMarketStore } from '@/stores/marketStore'
import { useKlineStore } from '@/stores/klineStore'
import { useStreamStore } from '@/stores/streamStore'
import { useActivityStore } from '@/stores/activityStore'
import { useSymbolsStore } from '@/stores/symbolsStore'
import { formatCompact, formatPrice, formatPct } from '@/utils/format'
import type { ChartKind, TimeRange } from '@/types/market'

const range = ref<TimeRange>('live')
const kind = ref<ChartKind>('area')
const symbolMenuOpen = ref(false)
const { paused, toggle: togglePause } = usePause()
const { symbols: watchlistSymbols } = useWatchlist()
const { focus, setFocus } = useFocusedSymbol()
const { openSymbolPicker } = useOverlays()
const market = useMarketStore()
const klines = useKlineStore()
const stream = useStreamStore()
const activity = useActivityStore()
const symbolsStore = useSymbolsStore()
const { tickers, series } = storeToRefs(market)
const { msgsPerSec, latencyMs } = storeToRefs(stream)
const { events: activityEvents } = storeToRefs(activity)

const RANGE_OPTS = [
  { value: 'live' as TimeRange, label: 'Live' },
  { value: '1m' as TimeRange, label: '1m' },
  { value: '5m' as TimeRange, label: '5m' },
  { value: '15m' as TimeRange, label: '15m' },
  { value: '1h' as TimeRange, label: '1h' },
  { value: '4h' as TimeRange, label: '4h' },
  { value: '1mo' as TimeRange, label: '1mo' },
  { value: '3mo' as TimeRange, label: '3mo' },
  { value: '6mo' as TimeRange, label: '6mo' },
  { value: '1y' as TimeRange, label: '1y' },
]

const KIND_OPTS: { value: ChartKind; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'bar', label: 'Bar' },
  { value: 'candle', label: 'Candle' },
]

const { series: heroSeries, candles: focusCandles } = useChartData(focus, range)
const focusInfo = computed(() => symbolsStore.lookup(focus.value))
const focusTicker = computed(() => tickers.value[focus.value])

const subscribedSymbols = computed(() => {
  const set = new Set<string>(['BTCUSDT'])
  for (const s of watchlistSymbols.value) set.add(s)
  if (focus.value) set.add(focus.value)
  return [...set]
})

const focusOptions = computed(() =>
  subscribedSymbols.value.map((sym) => ({
    sym,
    info: symbolsStore.lookup(sym),
    ticker: tickers.value[sym],
  })),
)

function pickFocus(sym: string) {
  setFocus(sym)
  symbolMenuOpen.value = false
}

const headlineSymbols = computed(() => {
  const set = new Set<string>()
  for (const s of watchlistSymbols.value) {
    set.add(s)
    if (set.size >= 3) break
  }
  set.add('BTCUSDT')
  return [...set].slice(0, 3)
})

const sparkFor = (sym: string) => {
  const all = series.value[sym] ?? []
  return all.slice(-48).map((p) => p.v)
}

const tickerOf = (sym: string) => tickers.value[sym]

const topMover = computed(() => {
  const list = Object.values(tickers.value)
  if (!list.length) return null
  return [...list].sort(
    (a, b) => Math.abs(b.changePct24h) - Math.abs(a.changePct24h),
  )[0]!
})

const symbolInfo = (sym: string) => symbolsStore.lookup(sym)

const totalVolume = computed(() =>
  Object.values(tickers.value).reduce((s, t) => s + t.volume24h, 0),
)

const watched = computed(() => new Set(watchlistSymbols.value))
const recentActivity = computed(() =>
  activityEvents.value
    .filter((e) => !e.symbol || watched.value.has(e.symbol))
    .slice(0, 40),
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
            {{ Object.keys(tickers).length }} streams
          </span>
          <span class="chip">
            <span class="mono">${{ formatCompact(totalVolume) }}</span>
            <span class="muted-tone">24h vol</span>
          </span>
          <span v-if="topMover" class="chip chip--mover">
            <span class="mono">{{ symbolInfo(topMover.symbol).base }}</span>
            <span
              :class="topMover.changePct24h >= 0 ? 'up' : 'down'"
              class="mono"
            >{{ formatPct(topMover.changePct24h) }}</span>
            <span class="muted-tone">top mover</span>
          </span>
        </div>
      </div>
      <div
        class="hero__cards"
        :class="{ 'hero__cards--solo': headlineSymbols.length === 1 }"
      >
        <template v-for="sym in headlineSymbols" :key="sym">
          <MetricCard
            v-if="tickerOf(sym)"
            :label="symbolInfo(sym).base + ' / USDT'"
            :hint="symbolInfo(sym).icon"
            :value="tickerOf(sym)!.price"
            :change-pct="tickerOf(sym)!.changePct24h"
            :change-abs="tickerOf(sym)!.change24h"
            :spark="sparkFor(sym)"
            :format="formatPrice"
            unit="$"
          />
          <MetricCardSkeleton v-else :label="symbolInfo(sym).base + ' / USDT'" />
        </template>
        <EmptyState
          v-if="!watchlistSymbols.length"
          class="hero__empty"
          eyebrow="Watchlist"
          title="Pin more markets"
          body="The KPI cards mirror your watchlist. Add symbols to track ETH, SOL, and beyond alongside BTC."
          cta="Add symbols"
          @action="openSymbolPicker"
        />
      </div>
    </section>

    <div class="grid">
      <ChartCard
        :title="(focusInfo?.base ?? focus) + ' / ' + (focusInfo?.quote ?? 'USDT')"
        eyebrow="Live price"
        :subtitle="`Last ${range === 'live' ? 'live' : range} window · ${kind} view`"
        class="chart-main"
      >
        <template #tools>
          <div class="picker">
            <button
              type="button"
              class="picker__btn"
              :aria-expanded="symbolMenuOpen"
              aria-haspopup="listbox"
              @click="symbolMenuOpen = !symbolMenuOpen"
              @blur="symbolMenuOpen = false"
            >
              <span class="picker__icon" aria-hidden="true">{{ focusInfo?.icon }}</span>
              <span class="picker__lab">{{ focusInfo?.base ?? focus }}</span>
              <span class="picker__caret" aria-hidden="true">▾</span>
            </button>
            <ul v-if="symbolMenuOpen" class="picker__menu" role="listbox">
              <li v-for="o in focusOptions" :key="o.sym">
                <button
                  type="button"
                  role="option"
                  class="picker__opt"
                  :class="{ 'picker__opt--on': o.sym === focus }"
                  :aria-selected="o.sym === focus"
                  @mousedown.prevent="pickFocus(o.sym)"
                >
                  <span class="picker__opt-icon">{{ o.info.icon }}</span>
                  <span class="picker__opt-base">{{ o.info.base }}</span>
                  <span class="picker__opt-name">{{ o.info.name }}</span>
                  <span
                    v-if="o.ticker"
                    class="picker__opt-chg mono"
                    :class="o.ticker.changePct24h >= 0 ? 'up' : 'down'"
                  >{{ formatPct(o.ticker.changePct24h) }}</span>
                </button>
              </li>
            </ul>
          </div>
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
          <PauseResume :paused="paused" @update:paused="togglePause" />
        </template>
        <CandlestickChart
          v-if="kind === 'candle'"
          :candles="focusCandles"
          :height="340"
        />
        <PriceChart
          v-else
          :series="heroSeries"
          :kind="kind"
          :height="340"
        />
        <template #footer>
          <div class="legend">
            <span class="legend__dot" style="background: var(--up)"></span>
            <span class="legend__lab">spot · {{ focusInfo?.base ?? focus }} · 1m</span>
            <span class="legend__sep"></span>
            <span class="mono muted-tone">
              {{ Math.round(msgsPerSec) }} msg/s ·
              {{ Math.max(1, Math.round(latencyMs || 32)) }} ms latency ·
              {{ focusTicker ? '$' + formatPrice(focusTicker.price) : '—' }}
            </span>
          </div>
        </template>
      </ChartCard>

      <ChartCard
        title="Volume"
        :eyebrow="(focusInfo?.base ?? focus) + ' · 24h'"
        subtitle="1-minute buckets"
        class="chart-vol"
      >
        <VolumeBarChart :candles="focusCandles" :height="240" />
      </ChartCard>

      <ChartCard
        title="Activity"
        eyebrow="Tape · last 30 minutes"
        class="chart-feed"
      >
        <ActivityFeed :events="recentActivity" :show-filters="false" compact />
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
.hero__cards--solo {
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 2fr);
}
.hero__empty {
  grid-column: span 2;
}
.hero__cards--solo .hero__empty {
  grid-column: span 1;
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

.picker {
  position: relative;
}
.picker__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  background: var(--surface);
  color: var(--ink);
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
}
.picker__btn:hover {
  border-color: var(--accent);
}
.picker__icon {
  color: var(--ink-mute);
  font-family: var(--font-mono);
}
.picker__lab {
  font-weight: 600;
}
.picker__caret {
  color: var(--ink-mute);
  font-size: 10px;
}
.picker__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 30;
  min-width: 220px;
  list-style: none;
  margin: 0;
  padding: 4px;
  background: var(--surface);
  border: 1px solid var(--border-hi);
  border-radius: var(--r-1);
  box-shadow: var(--shadow-lift);
  max-height: 280px;
  overflow-y: auto;
}
.picker__opt {
  display: grid;
  grid-template-columns: 16px auto 1fr auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 8px;
  color: var(--ink-dim);
  font-size: var(--fs-sm);
  text-align: left;
  border-radius: 2px;
}
.picker__opt:hover {
  background: var(--surface-hi);
  color: var(--ink);
}
.picker__opt--on {
  background: var(--accent-soft);
  color: var(--ink);
}
.picker__opt-icon {
  color: var(--ink-mute);
  font-family: var(--font-mono);
  text-align: center;
}
.picker__opt-base {
  font-weight: 600;
  letter-spacing: 0.03em;
}
.picker__opt-name {
  color: var(--ink-mute);
  font-size: var(--fs-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.picker__opt-chg {
  font-size: var(--fs-xs);
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
