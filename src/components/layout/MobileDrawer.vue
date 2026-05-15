<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { formatPct, formatPrice } from '@/utils/format'
import { useMobileDrawer } from '@/composables/useMobileDrawer'
import { useWatchlist } from '@/composables/useWatchlist'
import { useOverlays } from '@/composables/useOverlays'
import { useFocusedSymbol } from '@/composables/useFocusedSymbol'
import { useMarketStore } from '@/stores/marketStore'
import { useSymbolsStore } from '@/stores/symbolsStore'
import Brand from './Brand.vue'
import ThemeToggle from '@/components/controls/ThemeToggle.vue'
import StatusPill from '@/components/controls/StatusPill.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'

const { open, hide } = useMobileDrawer()
const { symbols } = useWatchlist()
const { openSymbolPicker } = useOverlays()
const { focus } = useFocusedSymbol()
const market = useMarketStore()
const { tickers } = storeToRefs(market)
const symbolsStore = useSymbolsStore()
const route = useRoute()

const NAV = computed(() => [
  { to: '/dashboard', label: 'Overview' },
  { to: `/markets/${focus.value}`, label: 'Markets', match: '/markets' },
  { to: '/activity', label: 'Activity' },
  { to: '/settings', label: 'Settings' },
])

function isActive(item: { to: string; match?: string }) {
  if (item.match) return route.path.startsWith(item.match)
  return route.path === item.to
}

const watchlist = computed(() =>
  symbols.value.map((sym) => ({
    symbol: sym,
    info: symbolsStore.lookup(sym),
    ticker: tickers.value[sym],
  })),
)

function manage() {
  hide()
  openSymbolPicker()
}

watch(
  () => route.fullPath,
  () => hide(),
)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') hide()
}

watch(open, (v) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = v ? 'hidden' : ''
  if (v) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px]"
        role="presentation"
        @click="hide"
      ></div>
    </Transition>
    <Transition name="slide">
      <aside
        v-if="open"
        class="fixed top-0 left-0 bottom-0 w-[min(86vw,340px)] bg-bg border-r border-rule z-[100] flex flex-col min-h-0 shadow-[24px_0_48px_-16px_rgba(0,0,0,0.5)]"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <header class="flex items-center justify-between px-4 py-[14px] border-b border-rule">
          <Brand subtle />
          <button
            type="button"
            class="w-[30px] h-[30px] border border-border rounded-1 inline-flex items-center justify-center text-ink-dim bg-surface hover:text-ink hover:border-border-hi"
            aria-label="Close"
            @click="hide"
          >
            <svg viewBox="0 0 16 16" width="14" height="14">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </header>

        <div class="flex items-center justify-between px-4 py-3 border-b border-rule">
          <StatusPill state="live" :latency-ms="38" />
          <ThemeToggle />
        </div>

        <nav class="flex flex-col py-[6px]" aria-label="Primary">
          <RouterLink
            v-for="n in NAV"
            :key="n.to"
            :to="n.to"
            class="flex items-center justify-between gap-2 px-4 py-3 text-ink-dim text-md uppercase tracking-[0.08em] border-l-[2px] border-transparent transition-colors hover:bg-surface hover:text-ink"
            :class="isActive(n) ? '!bg-surface !text-ink !border-l-accent' : ''"
          >
            <span>{{ n.label }}</span>
            <span class="text-ink-faint font-mono" aria-hidden="true">→</span>
          </RouterLink>
        </nav>

        <div class="flex items-center justify-between px-4 pt-3 pb-[6px]">
          <span class="eyebrow">Watchlist</span>
          <button
            type="button"
            class="text-xs uppercase tracking-[0.08em] text-ink-mute border border-border rounded-1 px-2 py-[4px] hover:text-ink hover:border-border-hi"
            @click="manage"
          >
            Manage
          </button>
        </div>
        <hr class="rule" />
        <div v-if="!watchlist.length" class="px-4 py-3 flex-1 min-h-0 overflow-y-auto">
          <EmptyState
            compact
            eyebrow="Watchlist"
            title="No symbols pinned"
            body="Pin markets to track them in real time."
            cta="Add symbols"
            @action="manage"
          />
        </div>
        <ul v-else class="list-none m-0 p-0 overflow-y-auto flex-1 min-h-0" role="list">
          <li v-for="r in watchlist" :key="r.symbol">
            <RouterLink
              :to="`/markets/${r.symbol}`"
              class="flex items-center justify-between gap-3 py-[9px] px-4 text-ink-dim border-l-[2px] border-transparent hover:bg-surface hover:text-ink"
            >
              <span class="inline-flex items-baseline gap-[6px] text-sm">
                <span class="w-4 text-center text-ink-mute" aria-hidden="true">{{ r.info.icon }}</span>
                <span class="font-semibold">{{ r.info.base }}</span>
                <span class="text-ink-faint text-xs">/{{ r.info.quote }}</span>
              </span>
              <span class="inline-flex flex-col items-end gap-[1px]">
                <span class="text-sm text-ink font-mono">
                  {{ r.ticker ? formatPrice(r.ticker.price) : '-' }}
                </span>
                <span
                  class="text-xs font-mono"
                  :class="r.ticker && r.ticker.changePct24h >= 0 ? 'up' : 'down'"
                >{{ r.ticker ? formatPct(r.ticker.changePct24h) : '-' }}</span>
              </span>
            </RouterLink>
          </li>
        </ul>

        <footer class="flex items-center justify-between px-4 py-3 border-t border-rule">
          <span class="eyebrow">TAPE //</span>
          <span class="text-xs text-ink-faint">Binance live</span>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms var(--ease-out);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 260ms var(--ease-out);
}
.slide-enter-from,
.slide-leave-to {
  transform: translate3d(-100%, 0, 0);
}
</style>
