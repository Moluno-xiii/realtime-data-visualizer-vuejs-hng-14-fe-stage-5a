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
  <aside class="rail">
    <div class="rail__head">
      <span class="eyebrow">Watchlist</span>
      <button
        class="rail__add"
        type="button"
        aria-label="Manage watchlist"
        title="Manage watchlist"
        @click="openSymbolPicker"
      >+</button>
    </div>
    <hr class="rule" />
    <div v-if="!rows.length" class="rail__empty">
      <EmptyState
        compact
        eyebrow="Watchlist"
        title="No symbols pinned"
        body="Pin markets to track them here."
        cta="Add symbols"
        @action="openSymbolPicker"
      />
    </div>
    <ul v-else class="rail__list" role="list">
      <li v-for="r in rows" :key="r.symbol">
        <RouterLink
          :to="`/markets/${r.symbol}`"
          class="row"
          :class="{ 'row--active': isActive(r.symbol) }"
        >
          <span class="row__sym">
            <span class="row__icon" aria-hidden="true">{{ r.info.icon }}</span>
            <span class="row__base">{{ r.info.base }}</span>
            <span class="row__quote">/{{ r.info.quote }}</span>
          </span>
          <span class="row__values">
            <span class="row__price mono">
              {{ r.ticker ? formatPrice(r.ticker.price) : '—' }}
            </span>
            <span
              class="row__chg mono"
              :class="r.ticker && r.ticker.changePct24h >= 0 ? 'up' : 'down'"
            >{{ r.ticker ? formatPct(r.ticker.changePct24h) : '—' }}</span>
          </span>
        </RouterLink>
      </li>
    </ul>
    <hr class="rule" />
    <div class="rail__foot">
      <div class="rail__stat">
        <span class="eyebrow">Streams</span>
        <span class="mono rail__stat-val">{{ rows.length }}</span>
      </div>
      <div class="rail__stat">
        <span class="eyebrow">Msgs/s</span>
        <span class="mono rail__stat-val">{{ Math.round(msgsPerSec) }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.rail {
  width: var(--rail-w);
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border-right: 1px solid var(--rule);
  height: 100%;
  min-height: 0;
}

.rail__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--s-4) var(--s-4) var(--s-3);
}
.rail__add {
  width: 22px;
  height: 22px;
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  color: var(--ink-mute);
  font-size: 14px;
  line-height: 1;
}
.rail__add:hover {
  color: var(--ink);
  border-color: var(--border-hi);
}

.rail__list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
.rail__empty {
  flex: 1;
  min-height: 0;
  padding: 14px;
  overflow-y: auto;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  padding: 7px var(--s-4);
  color: var(--ink-dim);
  border-left: 2px solid transparent;
  transition: background var(--t-fast) var(--ease-out);
}
.row:hover {
  background: var(--surface);
  color: var(--ink);
}
.row--active {
  background: var(--surface);
  color: var(--ink);
  border-left-color: var(--accent);
}

.row__sym {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: var(--fs-sm);
}
.row__icon {
  width: 16px;
  display: inline-block;
  text-align: center;
  color: var(--ink-mute);
}
.row__base {
  font-weight: 600;
  letter-spacing: 0.04em;
}
.row__quote {
  color: var(--ink-faint);
  font-size: var(--fs-xs);
}

.row__values {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}
.row__price {
  font-size: var(--fs-sm);
  color: var(--ink);
}
.row__chg {
  font-size: var(--fs-xs);
}

.rail__foot {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: var(--s-3) var(--s-4);
}
.rail__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rail__stat-val {
  color: var(--ink);
  font-size: var(--fs-sm);
}

@media (max-width: 960px) {
  .rail {
    display: none;
  }
}
</style>
