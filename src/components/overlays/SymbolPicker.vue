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
    <header class="flex items-start justify-between gap-3 px-5 pt-[18px] pb-2">
      <div>
        <span class="eyebrow">Watchlist</span>
        <h2 class="mt-1 m-0 font-display italic text-[26px] leading-[1.05] text-ink">
          Manage symbols
        </h2>
        <p class="mt-1 m-0 font-mono text-xs text-ink-mute">
          {{ symbols.length }} of {{ directory.length }} selected
          <span v-if="!loaded" class="text-warn ml-1">· loading directory…</span>
        </p>
      </div>
      <button
        type="button"
        class="text-xs uppercase tracking-[0.08em] text-ink-mute border border-border rounded-1 px-[10px] py-[6px] hover:text-ink hover:border-border-hi"
        @click="reset"
      >Reset</button>
    </header>

    <div
      class="flex items-center gap-2 px-4 mx-4 mt-2 py-2 bg-bg-elev border border-border text-ink-mute focus-within:border-accent focus-within:text-ink"
    >
      <svg viewBox="0 0 16 16" width="13" height="13">
        <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.4" fill="none" />
        <path d="m11 11 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      </svg>
      <input
        v-model="q"
        type="search"
        class="flex-1 bg-transparent border-0 outline-0 text-ink text-sm min-w-0 placeholder:text-ink-faint"
        placeholder="Filter by symbol, base, or name…"
        aria-label="Filter symbols"
      />
    </div>

    <ul class="list-none mt-3 px-2 pb-2 overflow-y-auto flex-1 min-h-0" role="list">
      <li v-for="r in rows" :key="r.info.symbol">
        <button
          type="button"
          class="grid grid-cols-[18px_22px_auto_1fr_auto_auto] items-center gap-[10px] w-full px-3 py-[10px] rounded-1 text-left text-ink-dim transition-colors hover:bg-surface-hi hover:text-ink"
          :class="r.on ? '!text-ink' : ''"
          :aria-pressed="r.on"
          @click="toggle(r.info.symbol)"
        >
          <span
            class="w-4 h-4 border border-border-hi rounded-[3px] inline-flex items-center justify-center"
            :class="r.on ? '!bg-accent !border-accent text-accent-ink' : 'text-accent-ink bg-transparent'"
            aria-hidden="true"
          >
            <svg v-if="r.on" viewBox="0 0 12 12" width="10" height="10">
              <path
                d="M2 6.5L5 9.5L10 3"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span class="font-mono text-ink-mute text-center" aria-hidden="true">{{ r.info.icon }}</span>
          <span class="font-semibold tracking-[0.03em]">{{ r.info.base }}</span>
          <span class="text-ink-mute text-sm whitespace-nowrap overflow-hidden text-ellipsis">{{ r.info.name }}</span>
          <span v-if="r.ticker" class="text-sm text-ink font-mono">
            ${{ formatPrice(r.ticker.price) }}
          </span>
          <span
            v-if="r.ticker"
            class="text-xs font-mono min-w-[56px] text-right"
            :class="r.ticker.changePct24h >= 0 ? 'up' : 'down'"
          >{{ formatPct(r.ticker.changePct24h) }}</span>
        </button>
      </li>
      <li
        v-if="!rows.length"
        class="px-3 py-8 text-center text-ink-mute text-sm"
      >No symbols match "{{ q }}".</li>
    </ul>

    <footer class="flex items-center justify-between px-4 py-3 border-t border-rule">
      <span class="font-mono text-xs text-ink-faint">Changes are saved automatically.</span>
      <button
        type="button"
        class="h-[30px] px-[14px] bg-accent text-accent-ink rounded-1 text-xs uppercase tracking-[0.08em] font-semibold hover:brightness-[1.06]"
        @click="emit('close')"
      >Done</button>
    </footer>
  </Modal>
</template>
