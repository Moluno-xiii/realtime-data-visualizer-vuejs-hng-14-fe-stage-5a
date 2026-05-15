<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { formatPrice, formatPct } from '@/utils/format'
import { useWatchlist } from '@/composables/useWatchlist'
import { useOverlays } from '@/composables/useOverlays'
import { useMarketStore } from '@/stores/marketStore'
import { useStreamStore } from '@/stores/streamStore'
import { useSymbolsStore } from '@/stores/symbolsStore'
import EmptyState from '@/components/feedback/EmptyState.vue'

const route = useRoute()
const { symbols } = useWatchlist()
const { openSymbolPicker } = useOverlays()
const market = useMarketStore()
const { tickers } = storeToRefs(market)
const stream = useStreamStore()
const { msgsPerSec } = storeToRefs(stream)
const symbolsStore = useSymbolsStore()

const rows = computed(() =>
  symbols.value.map((sym) => {
    const info = symbolsStore.lookup(sym)
    const ticker = tickers.value[sym]
    return { symbol: sym, info, ticker }
  }),
)

function isActive(symbol: string) {
  return route.path === `/markets/${symbol}`
}
</script>

<template>
  <aside class="rail w-[var(--rail-w)] flex flex-col bg-bg border-r border-rule h-full min-h-0">
    <div class="flex items-center justify-between px-4 pt-4 pb-3">
      <span class="eyebrow">Watchlist</span>
      <button
        type="button"
        class="w-[22px] h-[22px] border border-border rounded-1 text-ink-mute text-sm leading-none hover:text-ink hover:border-border-hi"
        aria-label="Manage watchlist"
        title="Manage watchlist"
        @click="openSymbolPicker"
      >+</button>
    </div>
    <hr class="rule" />
    <div v-if="!rows.length" class="flex-1 min-h-0 p-[14px] overflow-y-auto">
      <EmptyState
        compact
        eyebrow="Watchlist"
        title="No symbols pinned"
        body="Pin markets to track them here."
        cta="Add symbols"
        @action="openSymbolPicker"
      />
    </div>
    <ul v-else class="list-none m-0 py-1 overflow-y-auto flex-1 min-h-0" role="list">
      <li v-for="r in rows" :key="r.symbol">
        <RouterLink
          :to="`/markets/${r.symbol}`"
          class="flex items-center justify-between gap-3 py-[7px] px-4 text-ink-dim border-l-[2px] border-transparent transition-colors hover:bg-surface hover:text-ink"
          :class="
            isActive(r.symbol)
              ? '!bg-surface !text-ink !border-l-accent'
              : ''
          "
        >
          <span class="inline-flex items-baseline gap-[6px] text-sm">
            <span class="w-4 inline-block text-center text-ink-mute" aria-hidden="true">{{ r.info.icon }}</span>
            <span class="font-semibold tracking-[0.04em]">{{ r.info.base }}</span>
            <span class="text-ink-faint text-xs">/{{ r.info.quote }}</span>
          </span>
          <span class="inline-flex flex-col items-end gap-[1px]">
            <span class="text-sm text-ink font-mono">
              {{ r.ticker ? formatPrice(r.ticker.price) : '-' }}
            </span>
            <span
              class="text-xs font-mono"
              :class="r.ticker && r.ticker.changePct24h >= 0 ? 'up' : 'down'"
            >
              {{ r.ticker ? formatPct(r.ticker.changePct24h) : '-' }}
            </span>
          </span>
        </RouterLink>
      </li>
    </ul>
    <hr class="rule" />
    <div class="grid grid-cols-2 px-4 py-3">
      <div class="flex flex-col gap-[2px]">
        <span class="eyebrow">Streams</span>
        <span class="text-sm text-ink font-mono">{{ rows.length }}</span>
      </div>
      <div class="flex flex-col gap-[2px]">
        <span class="eyebrow">Msgs/s</span>
        <span class="text-sm text-ink font-mono">{{ Math.round(msgsPerSec) }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
@media (max-width: 960px) {
  .rail {
    display: none;
  }
}
</style>
