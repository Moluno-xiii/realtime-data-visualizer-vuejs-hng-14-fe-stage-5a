<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import ChartCard from '@/components/cards/ChartCard.vue'
import CandlestickChart from '@/components/charts/CandlestickChart.vue'
import AnimatedNumber from '@/components/cards/AnimatedNumber.vue'
import Sparkline from '@/components/cards/Sparkline.vue'
import Skeleton from '@/components/feedback/Skeleton.vue'
import ConfirmModal from '@/components/overlays/ConfirmModal.vue'
import { formatCompact, formatPct, formatPrice, formatTime } from '@/utils/format'
import { useMarketStore } from '@/stores/marketStore'
import { useKlineStore } from '@/stores/klineStore'
import { useSymbolsStore } from '@/stores/symbolsStore'
import { useFocusedSymbol } from '@/composables/useFocusedSymbol'
import { useWatchlist } from '@/composables/useWatchlist'
import { useOverlays } from '@/composables/useOverlays'
import { useRecentSymbols } from '@/composables/useRecentSymbols'

const route = useRoute()
const market = useMarketStore()
const klines = useKlineStore()
const symbolsStore = useSymbolsStore()
const { tickers, series, trades: tradesMap } = storeToRefs(market)
const { setFocus } = useFocusedSymbol()
const { has, add, remove } = useWatchlist()
const { openMarketSwitcher } = useOverlays()
const { track: trackRecent } = useRecentSymbols()

const symbol = computed(() =>
  String(route.params.symbol ?? 'BTCUSDT').toUpperCase(),
)

watch(
  symbol,
  (s) => {
    if (!s) return
    setFocus(s)
    trackRecent(s)
  },
  { immediate: true },
)

const onWatchlist = computed(() => has(symbol.value))
const confirmOpen = ref(false)

function requestToggle() {
  confirmOpen.value = true
}
function cancelToggle() {
  confirmOpen.value = false
}
function confirmToggle() {
  if (onWatchlist.value) remove(symbol.value)
  else add(symbol.value)
  confirmOpen.value = false
}

const info = computed(() => symbolsStore.lookup(symbol.value))
const ticker = computed(() => tickers.value[symbol.value])
const candles = computed(() => klines.get(symbol.value, '1m'))
const trades = computed(() => tradesMap.value[symbol.value] ?? [])
const spark = computed(() => {
  const s = series.value[symbol.value] ?? []
  return s.slice(-60).map((p) => p.v)
})

const statRows = computed(() => {
  const t = ticker.value
  return [
    { label: '24h High', value: t ? '$' + formatPrice(t.high24h) : '—' },
    { label: '24h Low', value: t ? '$' + formatPrice(t.low24h) : '—' },
    { label: '24h Vol', value: t ? '$' + formatCompact(t.volume24h) : '—' },
    { label: 'Last tick', value: t ? formatTime(t.lastUpdate) : '—' },
  ]
})
</script>

<template>
  <div class="flex flex-col gap-5 p-6 max-w-[var(--maxw)] mx-auto max-md:p-4">
    <header class="md-head grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 pb-4 border-b border-rule">
      <div class="flex flex-col gap-[6px] items-start">
        <span class="eyebrow">Market</span>
        <button
          type="button"
          class="group bg-transparent border-0 p-0 m-0 cursor-pointer text-left rounded-1 transition-opacity focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent focus-visible:outline-offset-[6px]"
          aria-label="Switch market"
          @click="openMarketSwitcher"
        >
          <h1 class="display m-0 text-[clamp(36px,5.4vw,56px)] inline-flex items-baseline gap-[10px] group-hover:underline group-hover:[text-decoration-color:var(--accent)] group-hover:[text-underline-offset:6px] group-hover:[text-decoration-thickness:1px]">
            <span class="text-accent font-mono text-[0.7em]">{{ info.icon }}</span>
            {{ info.base }}
            <span class="text-ink-faint text-[0.6em] italic">/ {{ info.quote }}</span>
            <span class="inline-flex items-center text-ink-mute ml-[6px] transition-[color,transform] group-hover:text-accent group-hover:translate-y-[1px]" aria-hidden="true">
              <svg viewBox="0 0 12 12" width="12" height="12">
                <path d="M3 4l3 4 3-4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </h1>
        </button>
        <p class="m-0 text-ink-mute text-sm">{{ info.name }} · Spot · Live feed</p>
        <button
          type="button"
          class="inline-flex items-center gap-2 h-8 px-[14px] mt-2 rounded-1 text-xs uppercase tracking-[0.08em] font-semibold bg-transparent border transition-colors"
          :class="
            onWatchlist
              ? 'text-down border-down hover:bg-down hover:text-[#0b0a08]'
              : 'text-up border-up hover:bg-up hover:text-[#0b0a08]'
          "
          :aria-pressed="onWatchlist"
          @click="requestToggle"
        >
          <span class="inline-flex items-center" aria-hidden="true">
            <svg v-if="onWatchlist" viewBox="0 0 12 12" width="11" height="11">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            <svg v-else viewBox="0 0 12 12" width="11" height="11">
              <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </span>
          {{ onWatchlist ? 'Remove from watchlist' : 'Add to watchlist' }}
        </button>
      </div>
      <div class="flex flex-col gap-[6px] items-end max-md:items-start">
        <template v-if="ticker">
          <div class="inline-flex items-baseline gap-[6px] text-ink">
            <span class="text-ink-mute font-mono text-lg">$</span>
            <AnimatedNumber
              :value="ticker.price"
              :format="formatPrice"
              class="text-[clamp(36px,5vw,52px)] font-semibold"
            />
          </div>
          <div class="inline-flex items-center gap-2 text-sm">
            <span :class="ticker.changePct24h >= 0 ? 'up' : 'down'" class="font-mono">
              {{ formatPct(ticker.changePct24h) }}
            </span>
            <span class="text-ink-mute font-mono">
              {{ ticker.change24h >= 0 ? '+' : '−' }}${{ Math.abs(ticker.change24h).toFixed(2) }}
            </span>
            <span class="eyebrow">24h</span>
          </div>
          <Sparkline :points="spark" :width="240" :height="42" class="mt-[6px]" />
        </template>
        <template v-else>
          <Skeleton width="220" height="44" />
          <Skeleton width="160" height="14" />
          <Skeleton block width="240" height="42" />
        </template>
      </div>
    </header>

    <div class="grid grid-cols-4 gap-px bg-rule border border-rule max-md:grid-cols-2">
      <div v-for="(stat, i) in statRows" :key="i" class="flex flex-col gap-1 px-4 py-3 bg-surface">
        <span class="eyebrow">{{ stat.label }}</span>
        <span v-if="ticker" class="text-lg text-ink font-mono">{{ stat.value }}</span>
        <Skeleton v-else width="90" height="16" />
      </div>
    </div>

    <div class="md-grid grid grid-cols-[minmax(0,2.1fr)_minmax(280px,1fr)] gap-4">
      <ChartCard title="Candlestick" eyebrow="1m interval · live" class="min-w-0">
        <CandlestickChart :candles="candles" :height="420" />
      </ChartCard>

      <section class="bg-surface border border-border rounded-1 shadow-[var(--shadow-lift)] flex flex-col min-w-0 max-h-[540px]">
        <div class="flex justify-between items-center px-[14px] py-3">
          <span class="eyebrow">Recent trades</span>
          <span class="font-mono text-xs text-ink-mute">{{ trades.length }} rows</span>
        </div>
        <hr class="rule" />
        <ul v-if="trades.length" class="list-none m-0 p-0 overflow-y-auto flex-1 [contain:content]" role="list">
          <li
            v-for="t in trades"
            :key="t.id"
            class="grid grid-cols-[64px_1fr_1fr_44px] gap-[10px] items-center px-[14px] py-[5px] text-xs text-ink-dim border-t border-rule first:border-t-0"
            :data-side="t.side"
          >
            <span class="text-ink-faint font-mono">{{ formatTime(t.time) }}</span>
            <span class="text-sm font-mono" :class="t.side === 'buy' ? 'up' : 'down'">
              {{ formatPrice(t.price) }}
            </span>
            <span class="text-right font-mono">{{ t.size.toFixed(4) }}</span>
            <span
              class="text-right text-xs uppercase tracking-[0.08em]"
              :class="t.side === 'buy' ? 'text-up' : 'text-down'"
            >{{ t.side }}</span>
          </li>
        </ul>
        <ul v-else class="list-none m-0 p-0 overflow-y-auto flex-1" role="list" aria-busy="true">
          <li
            v-for="n in 14"
            :key="n"
            class="grid grid-cols-[64px_1fr_1fr_44px] gap-[10px] items-center px-[14px] py-[5px] border-t border-rule first:border-t-0"
          >
            <Skeleton width="48" height="10" />
            <Skeleton width="64" height="11" />
            <Skeleton width="50" height="10" />
            <Skeleton width="28" height="9" />
          </li>
        </ul>
      </section>
    </div>
    <ConfirmModal
      :open="confirmOpen"
      :eyebrow="onWatchlist ? 'Remove' : 'Add'"
      :title="onWatchlist ? `remove ${info.base} from watchlist?` : `pin ${info.base} to watchlist?`"
      :body="
        onWatchlist
          ? `${info.name} will stop appearing in your watchlist, the activity feed, and the live ticker until you re-add it. Its market page stays accessible via search.`
          : `${info.name} will be pinned to your watchlist and tracked in real time alongside your other markets.`
      "
      :confirm-label="onWatchlist ? 'Remove' : 'Add to watchlist'"
      :variant="onWatchlist ? 'danger' : 'success'"
      @confirm="confirmToggle"
      @cancel="cancelToggle"
    />
  </div>
</template>

<style scoped>
@media (max-width: 960px) {
  .md-head {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }
  .md-grid {
    grid-template-columns: 1fr;
  }
}
</style>
