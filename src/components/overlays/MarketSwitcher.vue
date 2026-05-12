<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import Modal from './Modal.vue'
import { useSymbolsStore } from '@/stores/symbolsStore'
import { useMarketStore } from '@/stores/marketStore'
import { useWatchlist } from '@/composables/useWatchlist'
import { formatPct, formatPrice } from '@/utils/format'

const props = defineProps<{ open: boolean; current?: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const router = useRouter()
const symbolsStore = useSymbolsStore()
const { directory, loaded, loading: directoryLoading } = storeToRefs(symbolsStore)
const market = useMarketStore()
const { tickers } = storeToRefs(market)
const { symbols: watchlistSymbols } = useWatchlist()

const q = ref('')
const idx = ref(0)
const PAGE = 60
const visibleCount = ref(PAGE)
const retriedTerms = new Set<string>()
const remoteSearching = ref(false)
let retryTimer: number | null = null

watch(
  () => props.open,
  (v) => {
    if (v) {
      q.value = ''
      idx.value = 0
      visibleCount.value = PAGE
      symbolsStore.ensureLoaded()
      nextTick(() => {
        const el = document.getElementById('ms-input') as HTMLInputElement | null
        el?.focus()
      })
    }
  },
)

function subsequence(text: string, query: string): boolean {
  let i = 0
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  for (let k = 0; k < t.length && i < q.length; k++) {
    if (t[k] === q[i]) i++
  }
  return i === q.length
}

const matched = computed(() => {
  const term = q.value.trim().toLowerCase()
  const watchSet = new Set(watchlistSymbols.value)

  if (!term) {
    return directory.value.slice().sort((a, b) => {
      const aw = watchSet.has(a.symbol) ? 0 : 1
      const bw = watchSet.has(b.symbol) ? 0 : 1
      if (aw !== bw) return aw - bw
      return a.symbol.localeCompare(b.symbol)
    })
  }

  type Scored = { info: (typeof directory.value)[number]; score: number }
  const scored: Scored[] = []
  for (const info of directory.value) {
    const sym = info.symbol.toLowerCase()
    const base = info.base.toLowerCase()
    const name = info.name.toLowerCase()
    let score = Number.POSITIVE_INFINITY
    if (sym.startsWith(term)) score = 0
    else if (base.startsWith(term)) score = 1
    else if (name.startsWith(term)) score = 2
    else if (sym.includes(term)) score = 3
    else if (base.includes(term)) score = 4
    else if (name.includes(term)) score = 5
    else if (subsequence(base, term)) score = 6
    else if (subsequence(name, term)) score = 7
    else if (subsequence(sym, term)) score = 8
    if (score < Number.POSITIVE_INFINITY) {
      if (watchSet.has(info.symbol)) score -= 0.5
      scored.push({ info, score })
    }
  }
  scored.sort(
    (a, b) => a.score - b.score || a.info.symbol.localeCompare(b.info.symbol),
  )
  return scored.map((s) => s.info)
})

const rows = computed(() => {
  const watchSet = new Set(watchlistSymbols.value)
  const live = tickers.value
  return matched.value.slice(0, visibleCount.value).map((info) => ({
    info,
    on: watchSet.has(info.symbol),
    ticker: live[info.symbol],
  }))
})

const sentinel = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null

function attachIo() {
  if (io) io.disconnect()
  if (!sentinel.value) return
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (
          e.isIntersecting &&
          visibleCount.value < matched.value.length
        ) {
          visibleCount.value = Math.min(
            matched.value.length,
            visibleCount.value + PAGE,
          )
        }
      }
    },
    { root: null, rootMargin: '200px' },
  )
  io.observe(sentinel.value)
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      nextTick(attachIo)
    } else {
      io?.disconnect()
      io = null
    }
  },
)

watch(
  matched,
  () => {
    visibleCount.value = PAGE
    idx.value = 0
    nextTick(attachIo)
  },
)

watch(q, (v) => {
  const term = v.trim().toLowerCase()
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = null
  }
  if (!term) {
    remoteSearching.value = false
    return
  }
  retryTimer = window.setTimeout(() => {
    if (q.value.trim().toLowerCase() !== term) return
    if (matched.value.length > 0) return
    if (retriedTerms.has(term)) return
    retriedTerms.add(term)
    remoteSearching.value = true
    symbolsStore
      .refresh()
      .finally(() => {
        if (q.value.trim().toLowerCase() === term) {
          remoteSearching.value = false
        }
      })
  }, 350)
})

onBeforeUnmount(() => {
  io?.disconnect()
  if (retryTimer) clearTimeout(retryTimer)
})

function pick(sym: string) {
  if (sym === props.current) {
    emit('close')
    return
  }
  router.push(`/markets/${sym}`)
  emit('close')
}

function onKey(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (idx.value + 1 >= rows.value.length) {
      if (visibleCount.value < matched.value.length) {
        visibleCount.value = Math.min(
          matched.value.length,
          visibleCount.value + PAGE,
        )
      }
    }
    idx.value = Math.min(rows.value.length - 1, idx.value + 1)
    scrollActiveIntoView()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    idx.value = Math.max(0, idx.value - 1)
    scrollActiveIntoView()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const row = rows.value[idx.value]
    if (row) pick(row.info.symbol)
  }
}

function scrollActiveIntoView() {
  nextTick(() => {
    document
      .querySelector('[data-ms-active]')
      ?.scrollIntoView({ block: 'nearest' })
  })
}

watch(rows, () => {
  idx.value = 0
})
</script>

<template>
  <Modal :open="open" label="Switch market" @close="emit('close')">
    <div class="ms" @keydown="onKey">
      <div class="ms__head">
        <span class="eyebrow">Switch market</span>
        <span class="ms__count mono">
          {{ matched.length }} of {{ directory.length }}
          <span v-if="!loaded" class="ms__loading">· loading…</span>
        </span>
      </div>
      <div class="ms__search">
        <span class="ms__icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.4" fill="none" />
            <path d="m11 11 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </span>
        <input
          id="ms-input"
          v-model="q"
          type="text"
          class="ms__input"
          placeholder="Search a pair — try BTC, ETH, SOL…"
          aria-label="Search markets"
          autocomplete="off"
          spellcheck="false"
        />
        <span class="ms__esc">esc</span>
      </div>

      <ul class="ms__list" role="listbox">
        <li
          v-for="(r, i) in rows"
          :key="r.info.symbol"
          :data-ms-active="idx === i ? '' : undefined"
        >
          <button
            type="button"
            role="option"
            class="ms__opt"
            :class="{
              'ms__opt--active': idx === i,
              'ms__opt--current': r.info.symbol === current,
            }"
            :aria-selected="idx === i"
            @click="pick(r.info.symbol)"
            @mouseenter="idx = i"
          >
            <span class="ms__opt-icon" aria-hidden="true">{{ r.info.icon }}</span>
            <span class="ms__opt-base">{{ r.info.base }}</span>
            <span class="ms__opt-quote">/ {{ r.info.quote }}</span>
            <span class="ms__opt-name">{{ r.info.name }}</span>
            <span v-if="r.on" class="ms__pin" title="On watchlist">●</span>
            <span v-if="r.ticker" class="ms__opt-price mono">
              ${{ formatPrice(r.ticker.price) }}
            </span>
            <span
              v-if="r.ticker"
              class="ms__opt-chg mono"
              :class="r.ticker.changePct24h >= 0 ? 'up' : 'down'"
            >{{ formatPct(r.ticker.changePct24h) }}</span>
            <span v-if="r.info.symbol === current" class="ms__here">current</span>
          </button>
        </li>
        <li
          v-if="!rows.length && (remoteSearching || directoryLoading)"
          class="ms__empty ms__empty--loading"
        >
          <span class="ms__spinner" aria-hidden="true"></span>
          <span class="mono">Searching Binance for "{{ q }}"…</span>
        </li>
        <li v-else-if="!rows.length" class="ms__empty">
          <span class="ms__empty-title">No symbols match "{{ q }}"</span>
          <span class="ms__empty-hint">Not listed on Binance spot.</span>
        </li>
        <li
          v-if="rows.length && rows.length < matched.length"
          ref="sentinel"
          class="ms__sentinel"
        >
          loading more · {{ rows.length }} of {{ matched.length }}
        </li>
      </ul>

      <footer class="ms__foot">
        <span class="ms__legend"><kbd>↑↓</kbd> navigate</span>
        <span class="ms__legend"><kbd>↵</kbd> open</span>
        <span class="ms__legend"><kbd>esc</kbd> close</span>
      </footer>
    </div>
  </Modal>
</template>

<style scoped>
.ms {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}
.ms__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 6px;
}
.ms__count {
  font-size: var(--fs-xs);
  color: var(--ink-mute);
}
.ms__loading {
  color: var(--warn);
  margin-left: 4px;
}

.ms__search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin: 4px 14px 0;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  color: var(--ink-mute);
}
.ms__search:focus-within {
  border-color: var(--accent);
  color: var(--ink);
}
.ms__input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  color: var(--ink);
  font-size: var(--fs-md);
  font-family: var(--font-body);
  min-width: 0;
}
.ms__input::placeholder {
  color: var(--ink-faint);
}
.ms__esc {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink-mute);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 2px 6px;
  background: var(--surface);
}

.ms__list {
  list-style: none;
  margin: 8px 0 0;
  padding: 4px 8px 8px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.ms__opt {
  display: grid;
  grid-template-columns: 18px auto auto 1fr auto auto auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border-radius: 2px;
  text-align: left;
  color: var(--ink-dim);
  transition: background var(--t-fast) var(--ease-out);
}
.ms__opt--active {
  background: var(--surface-hi);
  color: var(--ink);
  outline: 1px solid var(--accent);
  outline-offset: -1px;
}
.ms__opt--current {
  background: var(--accent-soft);
}
.ms__opt-icon {
  font-family: var(--font-mono);
  color: var(--ink-mute);
  text-align: center;
}
.ms__opt-base {
  font-weight: 700;
  font-family: var(--font-tech, var(--font-mono));
  letter-spacing: 0.02em;
}
.ms__opt-quote {
  color: var(--ink-faint);
  font-size: var(--fs-sm);
}
.ms__opt-name {
  color: var(--ink-mute);
  font-size: var(--fs-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ms__pin {
  color: var(--accent);
  font-size: 8px;
}
.ms__opt-price {
  font-size: var(--fs-sm);
  color: var(--ink);
}
.ms__opt-chg {
  font-size: var(--fs-xs);
  min-width: 56px;
  text-align: right;
}
.ms__here {
  font-family: var(--font-mono);
  font-size: 9px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-ink);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ms__empty {
  padding: 26px 12px;
  text-align: center;
  color: var(--ink-mute);
  font-size: var(--fs-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.ms__empty-title {
  color: var(--ink-dim);
}
.ms__empty-hint {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  color: var(--ink-faint);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
}
.ms__empty--loading {
  flex-direction: row;
  justify-content: center;
  color: var(--ink-mute);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  font-size: var(--fs-xs);
}
.ms__spinner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  border-top-color: var(--accent);
  animation: ms-spin 0.8s linear infinite;
}
@keyframes ms-spin {
  to {
    transform: rotate(360deg);
  }
}
.ms__sentinel {
  padding: 14px 12px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--ink-faint);
}

.ms__foot {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-top: 1px solid var(--rule);
  background: var(--bg-elev);
}
.ms__legend {
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--ink-faint);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ms__legend kbd {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 5px;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--ink-mute);
  background: var(--surface);
}

@media (max-width: 540px) {
  .ms__opt {
    grid-template-columns: 18px auto auto 1fr auto;
    gap: 8px;
  }
  .ms__opt-name,
  .ms__pin {
    display: none;
  }
}
</style>
