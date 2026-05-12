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
const SEVS: { v: Severity; label: string; dot: string }[] = [
  { v: 'info', label: 'Info', dot: 'bg-info' },
  { v: 'success', label: 'Success', dot: 'bg-up' },
  { v: 'warn', label: 'Warn', dot: 'bg-warn' },
  { v: 'critical', label: 'Critical', dot: 'bg-down' },
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
  <div class="flex flex-col min-h-0 h-full">
    <div
      v-if="showFilters && !compact"
      class="flex items-center gap-[10px] px-[14px] py-[10px] flex-wrap border-b border-rule"
    >
      <div
        class="inline-flex items-center gap-2 h-7 px-[10px] bg-bg-elev border border-border rounded-1 text-ink-mute flex-1 min-w-[200px] focus-within:border-accent focus-within:text-ink"
      >
        <span aria-hidden="true">
          <svg viewBox="0 0 16 16" width="13" height="13">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.4" fill="none" />
            <path d="m11 11 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </span>
        <input
          v-model="q"
          type="search"
          class="flex-1 bg-transparent border-0 outline-0 text-sm text-ink min-w-0 placeholder:text-ink-faint"
          placeholder="Search events, symbols…"
          aria-label="Search activity"
        />
      </div>
      <div class="inline-flex gap-1" role="group" aria-label="Severity filters">
        <button
          v-for="s in SEVS"
          :key="s.v"
          type="button"
          class="inline-flex items-center gap-[6px] h-[26px] px-[9px] border border-border rounded-pill bg-surface text-ink-mute text-xs uppercase tracking-[0.08em] transition-colors hover:text-ink-dim hover:border-border-hi"
          :class="
            sev.has(s.v) ? '!text-ink !border-accent !bg-accent-soft' : ''
          "
          @click="toggleSev(s.v)"
        >
          <span class="w-[6px] h-[6px] rounded-full" :class="s.dot"></span>
          {{ s.label }}
        </button>
      </div>
    </div>
    <ul
      v-if="filtered.length"
      class="list-none m-0 p-0 overflow-y-auto flex-1 min-h-0 [contain:content]"
      role="list"
    >
      <ActivityRow v-for="e in filtered" :key="e.id" :event="e" :now="now" />
    </ul>
    <div
      v-else
      class="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center text-ink-mute text-sm"
    >
      <span class="eyebrow">No events</span>
      <p class="max-w-[320px] m-0">
        Nothing matches the current filters. Adjust the query or clear severities.
      </p>
    </div>
  </div>
</template>
