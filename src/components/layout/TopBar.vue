<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onBeforeUnmount, onMounted } from 'vue'
import Brand from './Brand.vue'
import StatusPill from '@/components/controls/StatusPill.vue'
import ThemeToggle from '@/components/controls/ThemeToggle.vue'
import { useMobileDrawer } from '@/composables/useMobileDrawer'
import { useOverlays } from '@/composables/useOverlays'
import { useHeartbeat } from '@/composables/useHeartbeat'
import { usePause } from '@/composables/usePause'

const route = useRoute()
const { toggle: toggleDrawer } = useMobileDrawer()
const { openCommandPalette, toggleCommandPalette } = useOverlays()
const { latencyMs } = useHeartbeat()
const { paused, toggle: togglePause } = usePause()

const isMac =
  typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
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
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || editable) return
    e.preventDefault()
    togglePause()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

const NAV = [
  { to: '/', label: 'Overview' },
  { to: '/markets/BTCUSDT', label: 'Markets', match: '/markets' },
  { to: '/activity', label: 'Activity' },
  { to: '/settings', label: 'Settings' },
]

function isActive(item: { to: string; match?: string }) {
  if (item.match) return route.path.startsWith(item.match)
  return route.path === item.to
}
</script>

<template>
  <header class="top">
    <div class="top__bar">
      <div class="top__left">
        <button
          class="hamburger"
          type="button"
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
        <div class="rule rule--v" aria-hidden="true"></div>
        <nav class="nav nav--inline" aria-label="Primary">
          <RouterLink
            v-for="n in NAV"
            :key="n.to"
            :to="n.to"
            class="nav__item"
            :class="{ 'nav__item--active': isActive(n) }"
            >{{ n.label }}</RouterLink
          >
        </nav>
      </div>

      <div class="top__center">
        <button
          class="cmd"
          type="button"
          aria-label="Open command palette"
          @click="openCommandPalette"
        >
          <span class="cmd__icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="13" height="13">
              <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" fill="none" />
              <path d="m11 11 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </span>
          <span class="cmd__text">Search markets, signals, commands…</span>
          <span class="cmd__kbd">
            <kbd>{{ cmdKey }}</kbd><kbd>K</kbd>
          </span>
        </button>
      </div>

      <div class="top__right">
        <button
          class="cmd cmd--icon"
          type="button"
          aria-label="Open command palette"
          @click="openCommandPalette"
        >
          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" fill="none" />
            <path d="m11 11 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
        <StatusPill
          :state="paused ? 'paused' : 'live'"
          :latency-ms="Math.max(1, Math.round(16.67 + latencyMs))"
        />
        <ThemeToggle />
        <RouterLink to="/settings" class="avatar" aria-label="Open settings">
          <span class="avatar__txt">TA</span>
        </RouterLink>
      </div>
    </div>

    <nav class="nav nav--strip" aria-label="Primary">
      <RouterLink
        v-for="n in NAV"
        :key="n.to"
        :to="n.to"
        class="nav__item"
        :class="{ 'nav__item--active': isActive(n) }"
        >{{ n.label }}</RouterLink
      >
    </nav>
  </header>
</template>

<style scoped>
.top {
  background: var(--bg);
  border-bottom: 1px solid var(--rule);
  position: sticky;
  top: 0;
  z-index: 50;
}
.top__bar {
  height: var(--top-h);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 520px) minmax(0, 1fr);
  align-items: center;
  gap: var(--s-4);
  padding: 0 var(--s-5);
}

.top__left {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  min-width: 0;
}

.top__center {
  display: flex;
  justify-content: center;
}

.top__right {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  justify-content: flex-end;
}

.rule--v {
  width: 1px;
  height: 22px;
  background: var(--rule);
}

.nav {
  display: flex;
  gap: 2px;
}
.nav--strip {
  display: none;
  padding: 0 var(--s-3);
  border-top: 1px solid var(--rule);
  overflow-x: auto;
  scrollbar-width: none;
}
.nav--strip::-webkit-scrollbar {
  display: none;
}
.nav__item {
  position: relative;
  padding: 8px 12px;
  color: var(--ink-mute);
  font-size: var(--fs-sm);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  font-weight: 500;
  white-space: nowrap;
  transition: color var(--t-fast) var(--ease-out);
}
.nav__item:hover {
  color: var(--ink);
}
.nav__item--active {
  color: var(--ink);
}
.nav__item--active::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -1px;
  height: 1px;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
}
.nav--strip .nav__item {
  padding: 10px 12px;
}
.nav--strip .nav__item--active::after {
  bottom: 0;
}

.cmd {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 520px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  background: var(--surface);
  color: var(--ink-mute);
  font-size: var(--fs-sm);
  transition: border-color var(--t-fast) var(--ease-out);
}
.cmd:hover {
  border-color: var(--border-hi);
  color: var(--ink-dim);
}
.cmd--icon {
  display: none;
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
}
.cmd__text {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cmd__kbd {
  display: inline-flex;
  gap: 2px;
}
.cmd__kbd kbd {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 5px;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--ink-mute);
  background: var(--bg-elev);
}

.avatar {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  background: var(--surface);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink-dim);
  transition:
    color var(--t-fast) var(--ease-out),
    border-color var(--t-fast) var(--ease-out);
}
.avatar:hover {
  color: var(--ink);
  border-color: var(--accent);
}

.hamburger {
  display: none;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  background: var(--surface);
  color: var(--ink-dim);
  transition:
    color var(--t-fast) var(--ease-out),
    border-color var(--t-fast) var(--ease-out);
}
.hamburger:hover {
  color: var(--ink);
  border-color: var(--border-hi);
}

@media (max-width: 1200px) {
  .top__bar {
    grid-template-columns: minmax(0, 1fr) minmax(0, auto);
  }
  .top__center {
    display: none;
  }
  .cmd--icon {
    display: inline-flex;
  }
}

@media (max-width: 1024px) {
  .nav--inline {
    display: none;
  }
  .nav--strip {
    display: flex;
  }
  .rule--v {
    display: none;
  }
}

@media (max-width: 640px) {
  .top__bar {
    padding: 0 var(--s-3);
    gap: var(--s-2);
  }
  .top__right {
    gap: 6px;
  }
  .hamburger {
    display: inline-flex;
  }
  .avatar {
    display: none;
  }
}
</style>
