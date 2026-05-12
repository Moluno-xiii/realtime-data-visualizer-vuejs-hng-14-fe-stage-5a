<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Modal from './Modal.vue'
import { useWatchlist } from '@/composables/useWatchlist'
import { useSymbolsStore } from '@/stores/symbolsStore'
import { useMarketStore } from '@/stores/marketStore'
import { formatPct, formatPrice } from '@/utils/format'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { toggle, symbols, reset } = useWatchlist()
const symbolsStore = useSymbolsStore()
const { directory, loaded } = storeToRefs(symbolsStore)
const market = useMarketStore()
const { tickers } = storeToRefs(market)
const q = ref('')

watch(
  () => props.open,
  (v) => {
    if (v) {
      q.value = ''
      symbolsStore.ensureLoaded()
    }
  },
)

const rows = computed(() => {
  const term = q.value.trim().toLowerCase()
  const filtered = !term
    ? directory.value.slice(0, 80)
    : directory.value.filter(
        (s) =>
          s.symbol.toLowerCase().includes(term) ||
          s.base.toLowerCase().includes(term) ||
          s.name.toLowerCase().includes(term),
      )
  const watchSet = new Set(symbols.value)
  const live = tickers.value
  return filtered.slice(0, 200).map((info) => ({
    info,
    on: watchSet.has(info.symbol),
    ticker: live[info.symbol],
  }))
})
</script>

<template>
  <Modal :open="open" label="Manage watchlist" @close="emit('close')">
    <header class="head">
      <div class="head__titles">
        <span class="eyebrow">Watchlist</span>
        <h2 class="head__title">Manage symbols</h2>
        <p class="head__sub mono">
          {{ symbols.length }} of {{ directory.length }} selected
          <span v-if="!loaded" class="head__loading">· loading directory…</span>
        </p>
      </div>
      <button type="button" class="head__reset" @click="reset">Reset</button>
    </header>

    <div class="search">
      <svg viewBox="0 0 16 16" width="13" height="13" class="search__icon">
        <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.4" fill="none" />
        <path d="m11 11 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      </svg>
      <input
        v-model="q"
        type="search"
        class="search__input"
        placeholder="Filter by symbol, base, or name…"
        aria-label="Filter symbols"
      />
    </div>

    <ul class="list" role="list">
      <li v-for="r in rows" :key="r.info.symbol">
        <button
          type="button"
          class="opt"
          :class="{ 'opt--on': r.on }"
          :aria-pressed="r.on"
          @click="toggle(r.info.symbol)"
        >
          <span class="opt__check" aria-hidden="true">
            <svg v-if="r.on" viewBox="0 0 12 12" width="10" height="10">
              <path d="M2 6.5L5 9.5L10 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" />
            </svg>
          </span>
          <span class="opt__icon" aria-hidden="true">{{ r.info.icon }}</span>
          <span class="opt__base">{{ r.info.base }}</span>
          <span class="opt__name">{{ r.info.name }}</span>
          <span v-if="r.ticker" class="opt__price mono">
            ${{ formatPrice(r.ticker.price) }}
          </span>
          <span
            v-if="r.ticker"
            class="opt__chg mono"
            :class="r.ticker.changePct24h >= 0 ? 'up' : 'down'"
          >
            {{ formatPct(r.ticker.changePct24h) }}
          </span>
        </button>
      </li>
      <li v-if="!rows.length" class="empty">
        No symbols match "{{ q }}".
      </li>
    </ul>

    <footer class="foot">
      <span class="mono muted">Changes are saved automatically.</span>
      <button type="button" class="foot__done" @click="emit('close')">Done</button>
    </footer>
  </Modal>
</template>

<style scoped>
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 8px;
}
.head__title {
  margin: 4px 0 0;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 26px;
  line-height: 1.05;
  color: var(--ink);
}
.head__sub {
  margin: 4px 0 0;
  font-size: var(--fs-xs);
  color: var(--ink-mute);
}
.head__loading {
  color: var(--warn);
  margin-left: 4px;
}
.head__reset {
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--ink-mute);
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  padding: 6px 10px;
}
.head__reset:hover {
  color: var(--ink);
  border-color: var(--border-hi);
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin: 8px 16px 0;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  color: var(--ink-mute);
}
.search:focus-within {
  border-color: var(--accent);
  color: var(--ink);
}
.search__input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  color: var(--ink);
  font-size: var(--fs-sm);
  min-width: 0;
}
.search__input::placeholder {
  color: var(--ink-faint);
}

.list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0 8px 8px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.opt {
  display: grid;
  grid-template-columns: 18px 22px auto 1fr auto auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--r-1);
  text-align: left;
  color: var(--ink-dim);
  transition: background var(--t-fast) var(--ease-out);
}
.opt:hover {
  background: var(--surface-hi);
  color: var(--ink);
}
.opt--on {
  color: var(--ink);
}

.opt__check {
  width: 16px;
  height: 16px;
  border: 1px solid var(--border-hi);
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-ink);
  background: transparent;
}
.opt--on .opt__check {
  background: var(--accent);
  border-color: var(--accent);
}

.opt__icon {
  font-family: var(--font-mono);
  color: var(--ink-mute);
  text-align: center;
}
.opt__base {
  font-weight: 600;
  letter-spacing: 0.03em;
}
.opt__name {
  color: var(--ink-mute);
  font-size: var(--fs-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.opt__price {
  font-size: var(--fs-sm);
  color: var(--ink);
}
.opt__chg {
  font-size: var(--fs-xs);
  min-width: 56px;
  text-align: right;
}

.empty {
  padding: 32px 12px;
  text-align: center;
  color: var(--ink-mute);
  font-size: var(--fs-sm);
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid var(--rule);
}
.muted {
  color: var(--ink-faint);
  font-size: var(--fs-xs);
}
.foot__done {
  height: 30px;
  padding: 0 14px;
  background: var(--accent);
  color: var(--accent-ink);
  border-radius: var(--r-1);
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  font-weight: 600;
}
.foot__done:hover {
  filter: brightness(1.06);
}
</style>
