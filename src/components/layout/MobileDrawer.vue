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
import EmptyState from '@/components/feedback/EmptyState.vue'
import Brand from './Brand.vue'
import ThemeToggle from '@/components/controls/ThemeToggle.vue'
import StatusPill from '@/components/controls/StatusPill.vue'

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
        class="backdrop"
        role="presentation"
        @click="hide"
      ></div>
    </Transition>
    <Transition name="slide">
      <aside
        v-if="open"
        class="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <header class="drawer__head">
          <Brand subtle />
          <button class="drawer__close" type="button" aria-label="Close" @click="hide">
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

        <div class="drawer__status">
          <StatusPill state="live" :latency-ms="38" />
          <ThemeToggle />
        </div>

        <nav class="drawer__nav" aria-label="Primary">
          <RouterLink
            v-for="n in NAV"
            :key="n.to"
            :to="n.to"
            class="drawer__navitem"
            :class="{ 'drawer__navitem--active': isActive(n) }"
          >
            <span class="drawer__navlabel">{{ n.label }}</span>
            <span class="drawer__navarrow" aria-hidden="true">→</span>
          </RouterLink>
        </nav>

        <div class="drawer__section">
          <span class="eyebrow">Watchlist</span>
          <button type="button" class="drawer__manage" @click="manage">
            Manage
          </button>
        </div>
        <hr class="rule" />
        <div v-if="!watchlist.length" class="drawer__empty">
          <EmptyState
            compact
            eyebrow="Watchlist"
            title="No symbols pinned"
            body="Pin markets to track them in real time."
            cta="Add symbols"
            @action="manage"
          />
        </div>
        <ul v-else class="drawer__list" role="list">
          <li v-for="r in watchlist" :key="r.symbol">
            <RouterLink :to="`/markets/${r.symbol}`" class="wrow">
              <span class="wrow__sym">
                <span class="wrow__icon" aria-hidden="true">{{ r.info.icon }}</span>
                <span class="wrow__base">{{ r.info.base }}</span>
                <span class="wrow__quote">/{{ r.info.quote }}</span>
              </span>
              <span class="wrow__values">
                <span class="wrow__price mono">
                  {{ r.ticker ? formatPrice(r.ticker.price) : '—' }}
                </span>
                <span
                  class="wrow__chg mono"
                  :class="r.ticker && r.ticker.changePct24h >= 0 ? 'up' : 'down'"
                >{{ r.ticker ? formatPct(r.ticker.changePct24h) : '—' }}</span>
              </span>
            </RouterLink>
          </li>
        </ul>

        <footer class="drawer__foot">
          <span class="eyebrow">TAPE //</span>
          <span class="muted">Binance live</span>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 90;
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(86vw, 340px);
  background: var(--bg);
  border-right: 1px solid var(--rule);
  z-index: 100;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-shadow: 24px 0 48px -16px rgba(0, 0, 0, 0.5);
}

.drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--rule);
}
.drawer__close {
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-dim);
  background: var(--surface);
}
.drawer__close:hover {
  color: var(--ink);
  border-color: var(--border-hi);
}

.drawer__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--rule);
}

.drawer__nav {
  display: flex;
  flex-direction: column;
  padding: 6px 0;
}
.drawer__navitem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  color: var(--ink-dim);
  font-size: var(--fs-md);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  border-left: 2px solid transparent;
  transition: background var(--t-fast) var(--ease-out);
}
.drawer__navitem:hover {
  background: var(--surface);
  color: var(--ink);
}
.drawer__navitem--active {
  background: var(--surface);
  color: var(--ink);
  border-left-color: var(--accent);
}
.drawer__navarrow {
  color: var(--ink-faint);
  font-family: var(--font-mono);
}

.drawer__section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 6px;
}
.drawer__manage {
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--ink-mute);
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  padding: 4px 8px;
}
.drawer__manage:hover {
  color: var(--ink);
  border-color: var(--border-hi);
}
.drawer__list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
.drawer__empty {
  padding: 12px 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.wrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  padding: 9px 16px;
  color: var(--ink-dim);
  border-left: 2px solid transparent;
}
.wrow:hover {
  background: var(--surface);
  color: var(--ink);
}
.wrow__sym {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: var(--fs-sm);
}
.wrow__icon {
  width: 16px;
  text-align: center;
  color: var(--ink-mute);
}
.wrow__base {
  font-weight: 600;
}
.wrow__quote {
  color: var(--ink-faint);
  font-size: var(--fs-xs);
}
.wrow__values {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}
.wrow__price {
  font-size: var(--fs-sm);
  color: var(--ink);
}
.wrow__chg {
  font-size: var(--fs-xs);
}

.drawer__foot {
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
