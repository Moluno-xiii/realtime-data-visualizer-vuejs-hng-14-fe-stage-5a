<script setup lang="ts">
type State = 'live' | 'paused' | 'reconnecting' | 'offline'
const props = withDefaults(defineProps<{ state?: State; latencyMs?: number }>(), {
  state: 'live',
  latencyMs: 38,
})

const labels: Record<State, string> = {
  live: 'LIVE',
  paused: 'PAUSED',
  reconnecting: 'RECONNECTING',
  offline: 'OFFLINE',
}
</script>

<template>
  <span class="pill" :data-state="props.state" role="status" aria-live="polite">
    <span class="pill__dot" aria-hidden="true"></span>
    <span class="pill__label">{{ labels[props.state] }}</span>
    <span v-if="state === 'live'" class="pill__sep" aria-hidden="true">·</span>
    <span v-if="state === 'live'" class="pill__lat mono">{{ latencyMs }}ms</span>
  </span>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--r-pill);
  background: var(--surface);
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--ink-dim);
}

.pill__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ink-faint);
  display: inline-block;
}

.pill[data-state='live'] .pill__dot {
  background: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  animation: pulse-dot 1.6s ease-in-out infinite;
}

.pill[data-state='paused'] .pill__dot {
  background: var(--warn);
}
.pill[data-state='reconnecting'] .pill__dot {
  background: var(--warn);
  animation: pulse-dot 0.8s ease-in-out infinite;
}
.pill[data-state='offline'] .pill__dot {
  background: var(--down);
}

.pill__lat {
  color: var(--ink-mute);
  font-size: var(--fs-xs);
}

.pill__sep {
  color: var(--ink-faint);
}
</style>
