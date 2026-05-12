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
    <div class="flex flex-col min-h-0 flex-1" @keydown="onKey">
      <div class="flex items-center justify-between px-[18px] pt-[14px] pb-[6px]">
        <span class="eyebrow">Switch market</span>
        <span class="font-mono text-xs text-ink-mute">
          {{ matched.length }} of {{ directory.length }}
          <span v-if="!loaded" class="text-warn ml-1">· loading…</span>
        </span>
      </div>
      <div
        class="flex items-center gap-[10px] px-[14px] py-[10px] mx-[14px] mt-1 bg-bg-elev border border-border rounded-1 text-ink-mute focus-within:border-accent focus-within:text-ink"
      >
        <span aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.4" fill="none" />
            <path d="m11 11 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </span>
        <input
          id="ms-input"
          v-model="q"
          type="text"
          class="flex-1 bg-transparent border-0 outline-0 text-ink text-md font-body min-w-0 placeholder:text-ink-faint"
          placeholder="Search a pair — try BTC, ETH, SOL…"
          aria-label="Search markets"
          autocomplete="off"
          spellcheck="false"
        />
        <span class="font-mono text-[10px] tracking-[0.06em] text-ink-mute border border-border rounded-[3px] px-[6px] py-[2px] bg-surface">esc</span>
      </div>

      <ul class="ms-list list-none mt-2 overflow-y-auto flex-1 min-h-0" role="listbox">
        <li
          v-for="(r, i) in rows"
          :key="r.info.symbol"
          :data-ms-active="idx === i ? '' : undefined"
        >
          <button
            type="button"
            role="option"
            class="ms-row flex items-center gap-[10px] w-full rounded-[2px] text-left text-ink-dim transition-colors hover:bg-surface-hi hover:text-ink min-w-0"
            :class="[
              idx === i
                ? 'bg-surface-hi text-ink ring-1 ring-inset ring-accent'
                : '',
              r.info.symbol === current ? 'bg-accent-soft' : '',
            ]"
            :aria-selected="idx === i"
            @click="pick(r.info.symbol)"
            @mouseenter="idx = i"
          >
            <span class="font-mono text-ink-mute text-center shrink-0" aria-hidden="true">{{ r.info.icon }}</span>
            <span class="font-tech font-bold tracking-[0.02em] shrink-0">{{ r.info.base }}</span>
            <span class="text-ink-faint text-sm shrink-0">/ {{ r.info.quote }}</span>
            <span class="ms-name text-ink-mute text-sm whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0">{{ r.info.name }}</span>
            <span v-if="r.on" class="ms-pin text-accent text-[8px] shrink-0" title="On watchlist">●</span>
            <span v-if="r.ticker" class="text-sm text-ink font-mono shrink-0">
              ${{ formatPrice(r.ticker.price) }}
            </span>
            <span
              v-if="r.ticker"
              class="text-xs font-mono min-w-[56px] text-right shrink-0"
              :class="r.ticker.changePct24h >= 0 ? 'up' : 'down'"
            >{{ formatPct(r.ticker.changePct24h) }}</span>
            <span
              v-if="r.info.symbol === current"
              class="inline-block whitespace-nowrap font-mono text-[9px] leading-none px-2 py-1 rounded-pill bg-accent text-accent-ink tracking-[0.06em] uppercase font-semibold shrink-0"
            >current</span>
          </button>
        </li>
        <li
          v-if="!rows.length && (remoteSearching || directoryLoading)"
          class="flex items-center justify-center gap-2 py-[26px] text-xs uppercase tracking-[0.08em] text-ink-mute"
        >
          <span class="ms-spinner w-3 h-3 rounded-full border-[1.5px] border-border border-t-accent" aria-hidden="true"></span>
          <span class="font-mono">Searching Binance for "{{ q }}"…</span>
        </li>
        <li
          v-else-if="!rows.length"
          class="flex flex-col items-center gap-[6px] py-[26px] text-center text-ink-mute text-sm"
        >
          <span class="text-ink-dim">No symbols match "{{ q }}"</span>
          <span class="font-mono text-xs text-ink-faint uppercase tracking-[0.08em]">Not listed on Binance spot.</span>
        </li>
        <li
          v-if="rows.length && rows.length < matched.length"
          ref="sentinel"
          class="py-[14px] text-center font-mono text-xs uppercase tracking-[0.08em] text-ink-faint"
        >
          loading more · {{ rows.length }} of {{ matched.length }}
        </li>
      </ul>

      <footer class="flex items-center gap-[14px] px-[14px] py-[10px] border-t border-rule bg-bg-elev">
        <span class="text-xs uppercase tracking-[0.08em] text-ink-faint inline-flex items-center gap-[6px]">
          <kbd class="font-mono text-[10px] py-[1px] px-[5px] border border-border rounded-[3px] text-ink-mute bg-surface">↑↓</kbd>
          navigate
        </span>
        <span class="text-xs uppercase tracking-[0.08em] text-ink-faint inline-flex items-center gap-[6px]">
          <kbd class="font-mono text-[10px] py-[1px] px-[5px] border border-border rounded-[3px] text-ink-mute bg-surface">↵</kbd>
          open
        </span>
        <span class="text-xs uppercase tracking-[0.08em] text-ink-faint inline-flex items-center gap-[6px]">
          <kbd class="font-mono text-[10px] py-[1px] px-[5px] border border-border rounded-[3px] text-ink-mute bg-surface">esc</kbd>
          close
        </span>
      </footer>
    </div>
  </Modal>
</template>


<style scoped>
.ms-list {
  padding: 8px 16px 16px;
}
.ms-row {
  padding: 14px 20px;
  margin: 2px 0;
}
.ms-spinner {
  animation: ms-spin 0.8s linear infinite;
}
@keyframes ms-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 540px) {
  .ms-name,
  .ms-pin {
    display: none;
  }
}
</style>
