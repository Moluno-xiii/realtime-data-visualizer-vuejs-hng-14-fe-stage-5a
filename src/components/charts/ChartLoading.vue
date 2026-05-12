<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStreamStore } from '@/stores/streamStore'

const props = withDefaults(
  defineProps<{
    height?: number
    label?: string
    hint?: string
  }>(),
  { height: 320 },
)

const stream = useStreamStore()
const { state, lastReason, attempt } = storeToRefs(stream)

const variant = computed<'streaming' | 'reconnecting' | 'offline'>(() => {
  if (state.value === 'offline') return 'offline'
  if (state.value === 'reconnecting' || state.value === 'idle')
    return 'reconnecting'
  return 'streaming'
})

const label = computed(() => {
  if (props.label) return props.label
  if (variant.value === 'offline') return 'Stream blocked'
  if (variant.value === 'reconnecting') return 'Reconnecting'
  return 'Streaming'
})

const hint = computed(() => {
  if (props.hint) return props.hint
  if (variant.value === 'offline') return 'binance unreachable'
  if (variant.value === 'reconnecting')
    return lastReason.value
      ? lastReason.value
      : `retrying connection · attempt ${attempt.value}`
  return 'awaiting first frame'
})
</script>

<template>
  <div
    class="cl"
    :data-variant="variant"
    :style="{ height: `${height}px` }"
    role="status"
    aria-live="polite"
  >
    <div class="cl__grid" aria-hidden="true">
      <span class="cl__hline" v-for="i in 4" :key="i"></span>
    </div>
    <div v-if="variant !== 'offline'" class="cl__sweep" aria-hidden="true"></div>
    <div class="cl__head">
      <span class="cl__dot" aria-hidden="true"></span>
      <span class="cl__eyebrow">{{ label }}</span>
    </div>
    <div class="cl__center">
      <svg
        class="cl__pulse"
        viewBox="0 0 240 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          class="cl__pulse-path"
          d="M0 20 L40 20 L52 8 L64 32 L76 14 L88 26 L100 20 L240 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
      </svg>
      <span class="cl__hint mono">{{ hint }}</span>
    </div>
  </div>
</template>

<style scoped>
.cl {
  position: relative;
  width: 100%;
  border: 1px dashed var(--border);
  border-radius: var(--r-1);
  background: var(--bg-elev);
  overflow: hidden;
}

.cl__grid {
  position: absolute;
  inset: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}
.cl__hline {
  display: block;
  height: 1px;
  background: var(--grid);
}

.cl__sweep {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent);
  opacity: 0.6;
  animation: cl-sweep 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes cl-sweep {
  0% {
    transform: translateX(-2px);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateX(calc(100vw));
    opacity: 0;
  }
}

.cl__head {
  position: absolute;
  top: 14px;
  left: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.cl__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  animation: cl-pulse 1.6s ease-in-out infinite;
}
.cl[data-variant='reconnecting'] .cl__dot {
  background: var(--warn);
  box-shadow: 0 0 8px var(--warn);
}
.cl[data-variant='offline'] .cl__dot {
  background: var(--down);
  box-shadow: 0 0 8px var(--down);
  animation: none;
}
.cl[data-variant='offline'] .cl__pulse {
  color: var(--down);
}
.cl__eyebrow {
  font-size: var(--fs-xs);
  font-family: var(--font-tech, var(--font-mono));
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--ink-mute);
}

@keyframes cl-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.9);
  }
}

.cl__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.cl__pulse {
  width: clamp(180px, 36%, 280px);
  height: 40px;
  color: var(--accent);
  opacity: 0.42;
}
.cl__pulse-path {
  stroke-dasharray: 8 6;
  animation: cl-dash 1.6s linear infinite;
}
@keyframes cl-dash {
  to {
    stroke-dashoffset: -28;
  }
}

.cl__hint {
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--ink-faint);
  text-align: center;
  max-width: 32ch;
}

</style>
