<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import ChartCard from '@/components/cards/ChartCard.vue'
import MetricCard from '@/components/cards/MetricCard.vue'
import MetricCardSkeleton from '@/components/cards/MetricCardSkeleton.vue'
import PriceChart from '@/components/charts/PriceChart.vue'
import CandlestickChart from '@/components/charts/CandlestickChart.vue'
import VolumeBarChart from '@/components/charts/VolumeBarChart.vue'
import MarketHeatmap, { type HeatTile } from '@/components/charts/MarketHeatmap.vue'
import ActivityFeed from '@/components/feed/ActivityFeed.vue'
import SelectMenu from '@/components/controls/SelectMenu.vue'
import PauseResume from '@/components/controls/PauseResume.vue'
import { usePause } from '@/composables/usePause'
import { useWatchlist } from '@/composables/useWatchlist'
import { useFocusedSymbol } from '@/composables/useFocusedSymbol'
import { useChartData } from '@/composables/useChartData'
import { useCompareSeries } from '@/composables/useCompareSeries'
import { useOverlays } from '@/composables/useOverlays'
import { compareColor } from '@/charts/echartsBootstrap'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useMarketStore } from '@/stores/marketStore'
import { useStreamStore } from '@/stores/streamStore'
import { useActivityStore } from '@/stores/activityStore'
import { useSymbolsStore } from '@/stores/symbolsStore'
import { formatCompact, formatPrice, formatPct } from '@/utils/format'
import type { ChartKind, SymbolInfo, Ticker, TimeRange } from '@/types/market'

type FocusOption = {
  value: string
  label: string
  info: SymbolInfo
  ticker: Ticker | undefined
}
type KindOption = { value: ChartKind; label: string; hint: string }

const range = ref<TimeRange>('live')
const kind = ref<ChartKind>('area')
const compareSet = ref<Set<string>>(new Set())
const { paused, toggle: togglePause } = usePause()
const { symbols: watchlistSymbols } = useWatchlist()
const { focus, setFocus } = useFocusedSymbol()
const { openSymbolPicker } = useOverlays()
const market = useMarketStore()
const stream = useStreamStore()
const activity = useActivityStore()
const symbolsStore = useSymbolsStore()
const { tickers, series } = storeToRefs(market)
const { msgsPerSec, latencyMs } = storeToRefs(stream)
const { events: activityEvents } = storeToRefs(activity)

const RANGE_OPTS: { value: TimeRange; label: string }[] = [
  { value: 'live', label: 'Live' },
  { value: '1m', label: '1 minute' },
  { value: '5m', label: '5 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '4h', label: '4 hours' },
  { value: '24h', label: '24 hours' },
  { value: '28h', label: '28 hours' },
  { value: '1mo', label: '1 month' },
  { value: '3mo', label: '3 months' },
  { value: '6mo', label: '6 months' },
  { value: '1y', label: '1 year' },
]

const rangeLabel = computed(
  () => RANGE_OPTS.find((r) => r.value === range.value)?.label ?? 'Live',
)

const KIND_OPTS: { value: ChartKind; label: string; hint: string }[] = [
  { value: 'line', label: 'Line', hint: 'Stroke' },
  { value: 'area', label: 'Area', hint: 'Filled' },
  { value: 'bar', label: 'Bar', hint: 'Volume' },
  { value: 'candle', label: 'Candle', hint: 'OHLC' },
]

const { series: heroSeries, candles: focusCandles } = useChartData(focus, range)
const focusInfo = computed(() => symbolsStore.lookup(focus.value))
const focusTicker = computed(() => tickers.value[focus.value])

const compareCapable = computed(() => kind.value !== 'candle' && kind.value !== 'bar')

const compareSymbols = computed(() => {
  if (!compareCapable.value) return []
  return [...compareSet.value].filter((s) => s !== focus.value)
})

const compareCandidates = computed(() =>
  watchlistSymbols.value.filter((s) => s !== focus.value).slice(0, 8),
)

const { compareSeries } = useCompareSeries(compareSymbols, range)

const overlays = computed(() =>
  compareSeries.value.map((c) => ({
    symbol: c.symbol,
    label: symbolsStore.lookup(c.symbol).base,
    series: c.series,
  })),
)

function toggleCompare(sym: string) {
  const next = new Set(compareSet.value)
  if (next.has(sym)) next.delete(sym)
  else next.add(sym)
  compareSet.value = next
}

function clearCompare() {
  if (compareSet.value.size) compareSet.value = new Set()
}

function chipColor(sym: string): string {
  const idx = compareSymbols.value.indexOf(sym)
  return idx >= 0 ? compareColor(idx) : 'var(--ink-faint)'
}

const subscribedSymbols = computed(() => {
  const set = new Set<string>(['BTCUSDT'])
  for (const s of watchlistSymbols.value) set.add(s)
  if (focus.value) set.add(focus.value)
  return [...set]
})

const focusOptions = computed(() =>
  subscribedSymbols.value.map((sym) => {
    const info = symbolsStore.lookup(sym)
    return {
      value: sym,
      label: info.base,
      info,
      ticker: tickers.value[sym],
    }
  }),
)

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

const heatTiles = computed<HeatTile[]>(() => {
  const out: HeatTile[] = []
  for (const sym of subscribedSymbols.value) {
    const t = tickers.value[sym]
    if (!t) continue
    out.push({
      symbol: sym,
      label: symbolsStore.lookup(sym).base,
      price: t.price,
      changePct: t.changePct24h,
      volume: t.volume24h,
    })
  }
  return out.sort((a, b) => b.volume - a.volume)
})

const watched = computed(() => new Set(watchlistSymbols.value))
const recentActivity = computed(() =>
  activityEvents.value
    .filter((e) => !e.symbol || watched.value.has(e.symbol))
    .slice(0, 40),
)
</script>

<template>
  <div class="flex flex-col gap-6 px-6 pt-6 pb-8 max-w-[var(--maxw)] mx-auto max-md:p-4 max-md:gap-5">
    <section class="ov-hero grid grid-cols-[minmax(280px,1fr)_minmax(0,1.4fr)] gap-7 items-stretch">
      <div class="flex flex-col gap-4 pt-2">
        <span class="eyebrow">Pulse · {{ new Date().toUTCString().slice(0, 16) }}</span>
        <h1 class="display m-0 text-ink text-[clamp(48px,7.2vw,var(--fs-hero))]">
          Markets, <em class="italic text-accent [text-shadow:0_0_22px_var(--accent-soft)]">live</em>.
        </h1>
        <p class="m-0 max-w-[44ch] text-ink-dim text-lg leading-[1.5]">
          A streaming terminal for retail traders who want pro-grade signal,
          without the seven-monitor setup. Watch order flow, momentum, and
          microstructure breathe in real time.
        </p>
        <div class="flex gap-2 flex-wrap mt-[6px]">
          <span class="chip">
            <span class="dot bg-accent shadow-[0_0_6px_var(--accent)]"></span>
            {{ Object.keys(tickers).length }} streams
          </span>
          <span class="chip">
            <span class="mono">${{ formatCompact(totalVolume) }}</span>
            <span class="text-ink-mute">24h vol</span>
          </span>
          <span v-if="topMover" class="chip gap-[10px]">
            <span class="mono">{{ symbolInfo(topMover.symbol).base }}</span>
            <span :class="topMover.changePct24h >= 0 ? 'up' : 'down'" class="mono">
              {{ formatPct(topMover.changePct24h) }}
            </span>
            <span class="text-ink-mute">top mover</span>
          </span>
        </div>
      </div>
      <div
        class="ov-hero-cards grid gap-3"
        :class="
          headlineSymbols.length === 1
            ? 'grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]'
            : 'grid-cols-3'
        "
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
          class="ov-hero-empty col-span-2"
          eyebrow="Watchlist"
          title="Pin more markets"
          body="The KPI cards mirror your watchlist. Add symbols to track ETH, SOL, and beyond alongside BTC."
          cta="Add symbols"
          @action="openSymbolPicker"
        />
      </div>
    </section>

    <div class="ov-grid grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid-rows-[auto_auto] gap-4">
      <ChartCard
        :title="(focusInfo?.base ?? focus) + ' / ' + (focusInfo?.quote ?? 'USDT')"
        eyebrow="Live price"
        :subtitle="`${rangeLabel} · ${kind} view`"
        class="ov-chart-main col-start-1 row-span-2"
      >
        <template #tools>
          <SelectMenu
            :model-value="focus"
            :options="focusOptions"
            label="Pair"
            aria-label="Trading pair"
            menu-min-width="240px"
            @update:model-value="setFocus"
          >
            <template #value="{ option }">
              <span class="text-ink-mute font-mono text-[11px]" aria-hidden="true">
                {{ (option as FocusOption)?.info.icon }}
              </span>
              <span>{{ (option as FocusOption)?.info.base }}</span>
              <span
                v-if="(option as FocusOption)?.ticker"
                class="font-mono text-[10px] normal-case tracking-normal"
                :class="
                  (option as FocusOption).ticker!.changePct24h >= 0
                    ? 'up'
                    : 'down'
                "
              >{{ formatPct((option as FocusOption).ticker!.changePct24h) }}</span>
            </template>
            <template #option="{ option }">
              <span class="grid grid-cols-[16px_auto_1fr] items-center gap-2 min-w-0">
                <span class="text-ink-mute font-mono text-center">{{ (option as FocusOption).info.icon }}</span>
                <span class="font-semibold tracking-[0.03em]">{{ (option as FocusOption).info.base }}</span>
                <span class="text-ink-mute text-xs whitespace-nowrap overflow-hidden text-ellipsis">{{ (option as FocusOption).info.name }}</span>
              </span>
              <span
                v-if="(option as FocusOption).ticker"
                class="text-xs font-mono"
                :class="(option as FocusOption).ticker!.changePct24h >= 0 ? 'up' : 'down'"
              >{{ formatPct((option as FocusOption).ticker!.changePct24h) }}</span>
            </template>
          </SelectMenu>

          <SelectMenu
            v-model="range"
            :options="RANGE_OPTS"
            label="Range"
            aria-label="Time range"
            menu-min-width="180px"
          >
            <template #value="{ option }">
              <span>{{ option?.label ?? rangeLabel }}</span>
            </template>
          </SelectMenu>

          <SelectMenu
            v-model="kind"
            :options="KIND_OPTS"
            label="Chart"
            aria-label="Chart type"
            menu-min-width="180px"
          >
            <template #value="{ option }">
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                aria-hidden="true"
                class="text-accent"
              >
                <template v-if="option?.value === 'line'">
                  <path d="M1 8L4 5L7 6L10 2L13 4" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                </template>
                <template v-else-if="option?.value === 'area'">
                  <path d="M1 8L4 5L7 6L10 2L13 4V9H1Z" fill="currentColor" fill-opacity="0.35" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
                </template>
                <template v-else-if="option?.value === 'bar'">
                  <rect x="1" y="5" width="2" height="4" fill="currentColor" />
                  <rect x="4.5" y="3" width="2" height="6" fill="currentColor" />
                  <rect x="8" y="6" width="2" height="3" fill="currentColor" />
                  <rect x="11.5" y="1" width="2" height="8" fill="currentColor" />
                </template>
                <template v-else>
                  <line x1="3" y1="1" x2="3" y2="9" stroke="currentColor" stroke-width="1" />
                  <rect x="2" y="3" width="2" height="4" fill="currentColor" />
                  <line x1="10" y1="0.5" x2="10" y2="9.5" stroke="currentColor" stroke-width="1" />
                  <rect x="9" y="2" width="2" height="5" fill="currentColor" fill-opacity="0.4" />
                </template>
              </svg>
              <span>{{ option?.label }}</span>
            </template>
            <template #option="{ option }">
              <span class="flex items-center gap-2">
                <span>{{ option.label }}</span>
                <span class="text-ink-faint text-[10px] uppercase tracking-[0.12em]">{{ (option as KindOption).hint }}</span>
              </span>
            </template>
          </SelectMenu>

          <PauseResume :paused="paused" @update:paused="togglePause" />
        </template>
        <div
          v-if="compareCapable && compareCandidates.length"
          class="compare-row flex items-center gap-2 px-1 pb-2 flex-wrap"
          role="group"
          aria-label="Compare watchlist symbols"
        >
          <span class="text-[10px] uppercase tracking-[0.18em] text-ink-faint font-mono">
            Compare
          </span>
          <button
            v-for="sym in compareCandidates"
            :key="sym"
            type="button"
            class="compare-chip inline-flex items-center gap-[6px] h-[24px] px-[10px] border border-border rounded-pill bg-surface text-ink-mute text-[11px] font-mono uppercase tracking-[0.06em] transition-colors hover:text-ink-dim hover:border-border-hi"
            :class="compareSet.has(sym) ? 'is-on' : ''"
            :aria-pressed="compareSet.has(sym)"
            @click="toggleCompare(sym)"
          >
            <span
              class="w-[6px] h-[6px] rounded-full inline-block"
              :style="{ background: chipColor(sym) }"
              aria-hidden="true"
            ></span>
            {{ symbolInfo(sym).base }}
          </button>
          <button
            v-if="compareSet.size"
            type="button"
            class="text-[10px] uppercase tracking-[0.12em] text-ink-faint hover:text-ink-dim transition-colors"
            @click="clearCompare"
          >
            Clear
          </button>
        </div>
        <CandlestickChart
          v-if="kind === 'candle'"
          :candles="focusCandles"
          :height="340"
        />
        <PriceChart
          v-else
          :series="heroSeries"
          :overlays="overlays"
          :primary-label="focusInfo?.base ?? focus"
          :kind="kind"
          :height="340"
        />
        <template #footer>
          <div class="flex items-center gap-[10px] text-xs text-ink-mute">
            <span class="w-2 h-2 rounded-full inline-block bg-up"></span>
            <span class="uppercase tracking-[0.08em]">spot · {{ focusInfo?.base ?? focus }} · 1m</span>
            <span class="w-px h-[10px] bg-rule"></span>
            <span class="mono text-ink-mute">
              {{ Math.round(msgsPerSec) }} msg/s ·
              {{ Math.max(1, Math.round(latencyMs || 32)) }} ms latency ·
              {{ focusTicker ? '$' + formatPrice(focusTicker.price) : '-' }}
            </span>
          </div>
        </template>
      </ChartCard>

      <ChartCard
        title="Volume"
        :eyebrow="(focusInfo?.base ?? focus) + ' · 24h'"
        subtitle="1-minute buckets"
        class="ov-chart-vol col-start-2 row-start-1"
      >
        <VolumeBarChart :candles="focusCandles" :height="240" />
      </ChartCard>

      <ChartCard
        title="Activity"
        eyebrow="Tape · last 30 minutes"
        class="ov-chart-feed col-start-2 row-start-2 min-h-[320px] max-h-[460px]"
      >
        <ActivityFeed :events="recentActivity" :show-filters="false" compact />
        <template #footer>
          <RouterLink
            to="/activity"
            class="inline-flex items-center gap-[6px] text-xs uppercase tracking-[0.18em] text-ink-dim hover:text-accent transition-colors"
          >
            View full activity
            <span aria-hidden="true">→</span>
          </RouterLink>
        </template>
      </ChartCard>
    </div>

    <ChartCard
      title="Market map"
      eyebrow="24h change"
      subtitle="Tile size by volume · color by % change · click to focus"
    >
      <MarketHeatmap :tiles="heatTiles" :height="380" @select="setFocus" />
      <template #footer>
        <div class="flex items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-ink-mute font-mono flex-wrap">
          <span class="inline-flex items-center gap-[6px]">
            <span class="w-[10px] h-[10px] inline-block" style="background: var(--down)"></span>
            -5% or worse
          </span>
          <span class="inline-flex items-center gap-[6px]">
            <span class="w-[10px] h-[10px] inline-block border border-border" style="background: var(--surface)"></span>
            flat
          </span>
          <span class="inline-flex items-center gap-[6px]">
            <span class="w-[10px] h-[10px] inline-block" style="background: var(--up)"></span>
            +5% or better
          </span>
          <span class="w-px h-[10px] bg-rule"></span>
          <span>{{ heatTiles.length }} markets</span>
        </div>
      </template>
    </ChartCard>
  </div>
</template>

<style scoped>
.compare-chip.is-on {
  color: var(--ink);
  border-color: var(--accent);
  background: var(--accent-soft);
}
@media (max-width: 1180px) {
  .ov-hero {
    grid-template-columns: 1fr;
  }
  .ov-hero-cards {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
}
@media (max-width: 960px) {
  .ov-grid {
    grid-template-columns: 1fr;
  }
  .ov-chart-main,
  .ov-chart-vol,
  .ov-chart-feed {
    grid-column: 1;
    grid-row: auto;
  }
  .ov-hero-cards {
    grid-template-columns: 1fr !important;
  }
}
</style>
