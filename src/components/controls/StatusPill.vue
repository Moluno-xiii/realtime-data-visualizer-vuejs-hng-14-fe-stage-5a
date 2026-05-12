<script setup lang="ts">
import { computed } from 'vue'

type State = 'live' | 'paused' | 'reconnecting' | 'offline'
const props = withDefaults(
  defineProps<{ state?: State; latencyMs?: number }>(),
  { state: 'live', latencyMs: 38 },
)

const labels: Record<State, string> = {
  live: 'LIVE',
  paused: 'PAUSED',
  reconnecting: 'RECONNECTING',
  offline: 'OFFLINE',
}

const dotClass = computed(() => {
  switch (props.state) {
    case 'live':
      return 'bg-accent text-accent shadow-[0_0_8px_var(--accent)] animate-pulse-dot'
    case 'paused':
      return 'bg-warn'
    case 'reconnecting':
      return 'bg-warn animate-pulse-fast'
    case 'offline':
      return 'bg-down'
    default:
      return 'bg-ink-faint'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-2 h-[26px] px-[10px] border border-border rounded-pill bg-surface text-ink-dim text-xs uppercase tracking-[0.18em]"
    role="status"
    aria-live="polite"
  >
    <span class="w-[7px] h-[7px] rounded-full inline-block" :class="dotClass" aria-hidden="true"></span>
    <span>{{ labels[props.state] }}</span>
    <span v-if="state === 'live'" class="text-ink-faint" aria-hidden="true">·</span>
    <span v-if="state === 'live'" class="font-mono text-ink-mute text-xs">{{ latencyMs }}ms</span>
  </span>
</template>
