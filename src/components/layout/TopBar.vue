<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import Brand from './Brand.vue'
import StatusPill from '@/components/controls/StatusPill.vue'
import ThemeToggle from '@/components/controls/ThemeToggle.vue'
import { useMobileDrawer } from '@/composables/useMobileDrawer'
import { useOverlays } from '@/composables/useOverlays'
import { usePause } from '@/composables/usePause'
import { useFocusedSymbol } from '@/composables/useFocusedSymbol'
import { useStreamStore } from '@/stores/streamStore'

const route = useRoute()
const { toggle: toggleDrawer } = useMobileDrawer()
const { openCommandPalette, toggleCommandPalette } = useOverlays()
const { paused, toggle: togglePause } = usePause()
const { focus } = useFocusedSymbol()
const stream = useStreamStore()
const { state: streamState, latencyMs: rawLatency } = storeToRefs(stream)

const pillState = computed<'live' | 'paused' | 'reconnecting' | 'offline'>(() => {
  if (paused.value) return 'paused'
  if (streamState.value === 'live') return 'live'
  if (streamState.value === 'reconnecting' || streamState.value === 'connecting')
    return 'reconnecting'
  return 'offline'
})
const latency = computed(() => Math.max(1, Math.round(rawLatency.value || 32)))

const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform)
const cmdKey = isMac ? '⌘' : 'Ctrl'

function onKeydown(e: KeyboardEvent) {
  const mod = isMac ? e.metaKey : e.ctrlKey
  if (mod && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    toggleCommandPalette()
  } else if (e.key === ' ' && !mod && !e.altKey && !e.shiftKey) {
    const target = e.target as HTMLElement | null
    const tag = target?.tagName
    const editable = target?.isContentEditable
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || editable)
      return
    e.preventDefault()
    togglePause()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

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
</script>

<template>
  <header class="top sticky top-0 z-50 bg-bg border-b border-rule">
    <div
      class="top__bar grid items-center gap-4 px-5 h-[var(--top-h)] grid-cols-[minmax(0,1fr)_minmax(280px,520px)_minmax(0,1fr)]"
    >
      <div class="flex items-center gap-4 min-w-0">
        <button
          type="button"
          class="hamburger w-8 h-8 hidden items-center justify-center border border-border rounded-1 bg-surface text-ink-dim transition-colors hover:text-ink hover:border-border-hi"
          aria-label="Open menu"
          @click="toggleDrawer"
        >
          <svg viewBox="0 0 18 14" width="18" height="14" aria-hidden="true">
            <path
              d="M0 1h18M0 7h18M0 13h12"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="square"
              fill="none"
            />
          </svg>
        </button>
        <Brand />
        <div class="rule-v w-px h-[22px] bg-rule" aria-hidden="true"></div>
        <nav class="nav-inline flex gap-[2px]" aria-label="Primary">
          <RouterLink
            v-for="n in NAV"
            :key="n.to"
            :to="n.to"
            class="nav-item relative px-3 py-2 text-ink-mute text-sm uppercase tracking-[0.08em] font-medium whitespace-nowrap transition-colors hover:text-ink"
            :class="isActive(n) ? '!text-ink active' : ''"
          >{{ n.label }}</RouterLink>
        </nav>
      </div>

      <div class="top__center flex justify-center">
        <button
          type="button"
          class="cmd inline-flex items-center gap-[10px] w-full max-w-[520px] h-8 px-[10px] border border-border rounded-1 bg-surface text-ink-mute text-sm transition-colors hover:border-border-hi hover:text-ink-dim"
          aria-label="Open command palette"
          @click="openCommandPalette"
        >
          <span aria-hidden="true">
            <svg viewBox="0 0 16 16" width="13" height="13">
              <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" fill="none" />
              <path d="m11 11 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </span>
          <span class="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
            Search markets, signals, commands…
          </span>
          <span class="inline-flex gap-[2px]">
            <kbd class="font-mono text-[10px] py-[1px] px-[5px] border border-border rounded-[3px] text-ink-mute bg-bg-elev">{{ cmdKey }}</kbd>
            <kbd class="font-mono text-[10px] py-[1px] px-[5px] border border-border rounded-[3px] text-ink-mute bg-bg-elev">K</kbd>
          </span>
        </button>
      </div>

      <div class="flex items-center gap-3 justify-end">
        <button
          type="button"
          class="cmd-icon hidden w-8 h-8 items-center justify-center border border-border rounded-1 bg-surface text-ink-mute transition-colors hover:border-border-hi hover:text-ink-dim"
          aria-label="Open command palette"
          @click="openCommandPalette"
        >
          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" fill="none" />
            <path d="m11 11 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
        <StatusPill class="top-pill" :state="pillState" :latency-ms="latency" />
        <ThemeToggle />
      </div>
    </div>

    <nav class="nav-strip hidden px-3 border-t border-rule overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Primary">
      <RouterLink
        v-for="n in NAV"
        :key="n.to"
        :to="n.to"
        class="nav-item relative px-3 py-[10px] text-ink-mute text-sm uppercase tracking-[0.08em] font-medium whitespace-nowrap transition-colors hover:text-ink"
        :class="isActive(n) ? '!text-ink active' : ''"
      >{{ n.label }}</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.nav-inline {
  display: flex;
}
.nav-item.active::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -1px;
  height: 1px;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
}
.nav-strip .nav-item.active::after {
  bottom: 0;
}

@media (max-width: 1200px) {
  .top__bar {
    grid-template-columns: minmax(0, 1fr) minmax(0, auto);
  }
  .top__center {
    display: none;
  }
  .cmd-icon {
    display: inline-flex;
  }
}

@media (max-width: 1024px) {
  .nav-inline {
    display: none;
  }
  .nav-strip {
    display: flex;
  }
  .rule-v {
    display: none;
  }
}

@media (max-width: 640px) {
  .top__bar {
    padding: 0 var(--s-3);
    gap: var(--s-2);
  }
  .hamburger {
    display: inline-flex;
  }
  .nav-strip {
    display: none;
  }
  .top-pill {
    display: none;
  }
}
</style>
