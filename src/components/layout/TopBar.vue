<script setup lang="ts">
import { useRoute } from 'vue-router'
import Brand from './Brand.vue'
import StatusPill from '@/components/controls/StatusPill.vue'
import ThemeToggle from '@/components/controls/ThemeToggle.vue'
import { useMobileDrawer } from '@/composables/useMobileDrawer'

const route = useRoute()
const { toggle: toggleDrawer } = useMobileDrawer()

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
    <div class="top__left">
      <button
        class="hamburger"
        type="button"
        aria-label="Open navigation"
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
      <nav class="nav">
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
      <button class="cmd" type="button" aria-label="Open command palette">
        <span class="cmd__icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="13" height="13">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" fill="none" />
            <path d="m11 11 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <span class="cmd__text">Search markets, signals, commands…</span>
        <span class="cmd__kbd">
          <kbd>⌘</kbd><kbd>K</kbd>
        </span>
      </button>
    </div>

    <div class="top__right">
      <StatusPill state="live" :latency-ms="38" />
      <ThemeToggle />
      <div class="avatar" aria-label="Account">
        <span class="avatar__txt">RM</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top {
  height: var(--top-h);
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(280px, 520px) 1fr;
  align-items: center;
  gap: var(--s-4);
  padding: 0 var(--s-5);
  background: var(--bg);
  border-bottom: 1px solid var(--rule);
  position: sticky;
  top: 0;
  z-index: 50;
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
.nav__item {
  position: relative;
  padding: 8px 12px;
  color: var(--ink-mute);
  font-size: var(--fs-sm);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  font-weight: 500;
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

@media (max-width: 1024px) {
  .top {
    grid-template-columns: 1fr auto;
  }
  .top__center {
    display: none;
  }
  .nav {
    display: none;
  }
  .hamburger {
    display: inline-flex;
  }
  .rule--v {
    display: none;
  }
}
</style>
