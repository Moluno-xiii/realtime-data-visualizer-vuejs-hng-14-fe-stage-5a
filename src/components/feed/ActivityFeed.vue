<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ActivityEvent, Severity } from '@/types/market'
import ActivityRow from './ActivityRow.vue'

const props = withDefaults(
  defineProps<{
    events: ActivityEvent[]
    compact?: boolean
    showFilters?: boolean
  }>(),
  { compact: false, showFilters: true },
)

const q = ref('')
const sev = ref<Set<Severity>>(new Set())
const SEVS: { v: Severity; label: string }[] = [
  { v: 'info', label: 'Info' },
  { v: 'success', label: 'Success' },
  { v: 'warn', label: 'Warn' },
  { v: 'critical', label: 'Critical' },
]

function toggleSev(s: Severity) {
  const n = new Set(sev.value)
  if (n.has(s)) n.delete(s)
  else n.add(s)
  sev.value = n
}

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  const sevSet = sev.value
  return props.events.filter((e) => {
    if (sevSet.size && !sevSet.has(e.severity)) return false
    if (!term) return true
    return (
      e.title.toLowerCase().includes(term) ||
      e.symbol?.toLowerCase().includes(term) ||
      e.kind.includes(term)
    )
  })
})

const now = ref(Date.now())
let interval: number | undefined
onMounted(() => {
  interval = window.setInterval(() => {
    if (document.visibilityState === 'visible') now.value = Date.now()
  }, 5000)
})
onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div class="feed" :class="{ 'feed--compact': compact }">
    <div v-if="showFilters" class="feed__bar">
      <div class="feed__search">
        <span class="feed__search-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="13" height="13">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.4" fill="none" />
            <path d="m11 11 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </span>
        <input
          v-model="q"
          type="search"
          class="feed__input"
          placeholder="Search events, symbols…"
          aria-label="Search activity"
        />
      </div>
      <div class="feed__sevs" role="group" aria-label="Severity filters">
        <button
          v-for="s in SEVS"
          :key="s.v"
          type="button"
          class="sev"
          :data-severity="s.v"
          :class="{ 'sev--on': sev.has(s.v) }"
          @click="toggleSev(s.v)"
        >
          <span class="sev__dot" aria-hidden="true"></span>
          {{ s.label }}
        </button>
      </div>
    </div>
    <ul v-if="filtered.length" class="feed__list" role="list">
      <ActivityRow v-for="e in filtered" :key="e.id" :event="e" :now="now" />
    </ul>
    <div v-else class="feed__empty">
      <span class="eyebrow">No events</span>
      <p>Nothing matches the current filters. Adjust the query or clear severities.</p>
    </div>
  </div>
</template>

<style scoped>
.feed {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.feed__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--rule);
}

.feed__search {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0 10px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  color: var(--ink-mute);
  flex: 1;
  min-width: 200px;
}
.feed__search:focus-within {
  border-color: var(--accent);
  color: var(--ink);
}
.feed__input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: var(--fs-sm);
  color: var(--ink);
  min-width: 0;
}
.feed__input::placeholder {
  color: var(--ink-faint);
}

.feed__sevs {
  display: inline-flex;
  gap: 4px;
}
.sev {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 9px;
  border: 1px solid var(--border);
  border-radius: var(--r-pill);
  background: var(--surface);
  color: var(--ink-mute);
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
}
.sev:hover {
  color: var(--ink-dim);
  border-color: var(--border-hi);
}
.sev__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ink-faint);
}
.sev[data-severity='info'] .sev__dot {
  background: var(--info);
}
.sev[data-severity='success'] .sev__dot {
  background: var(--up);
}
.sev[data-severity='warn'] .sev__dot {
  background: var(--warn);
}
.sev[data-severity='critical'] .sev__dot {
  background: var(--down);
}
.sev--on {
  color: var(--ink);
  border-color: var(--accent);
  background: var(--accent-soft);
}

.feed__list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  contain: content;
}

.feed__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: var(--s-8) var(--s-4);
  text-align: center;
  color: var(--ink-mute);
  font-size: var(--fs-sm);
}
.feed__empty p {
  max-width: 320px;
  margin: 0;
}

.feed--compact .feed__bar {
  display: none;
}
</style>
