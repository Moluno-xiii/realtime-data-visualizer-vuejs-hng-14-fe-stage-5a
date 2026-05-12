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

const dotClass = computed(() => {
  if (variant.value === 'offline') return 'bg-down shadow-[0_0_8px_var(--down)]'
  if (variant.value === 'reconnecting')
    return 'bg-warn shadow-[0_0_8px_var(--warn)] animate-pulse-dot'
  return 'bg-accent shadow-[0_0_8px_var(--accent)] animate-pulse-dot'
})
</script>

<template>
  <div
    class="cl relative w-full border border-dashed border-border rounded-1 bg-bg-elev overflow-hidden"
    :data-variant="variant"
    :style="{ height: `${height}px` }"
    role="status"
    aria-live="polite"
  >
    <div
      class="absolute inset-y-2 inset-x-3 flex flex-col justify-between pointer-events-none"
      aria-hidden="true"
    >
      <span v-for="i in 4" :key="i" class="block h-px bg-[var(--grid)]"></span>
    </div>
    <div
      v-if="variant !== 'offline'"
      class="cl-sweep absolute top-0 bottom-0 w-[2px] bg-accent shadow-[0_0_12px_var(--accent)] opacity-60"
      aria-hidden="true"
    ></div>
    <div class="absolute top-[14px] left-4 inline-flex items-center gap-2">
      <span class="w-[7px] h-[7px] rounded-full" :class="dotClass" aria-hidden="true"></span>
      <span class="text-xs font-tech uppercase tracking-[0.18em] text-ink-mute">{{ label }}</span>
    </div>
    <div class="absolute inset-0 flex flex-col items-center justify-center gap-[14px]">
      <svg
        class="cl-pulse opacity-[0.42] w-[clamp(180px,36%,280px)] h-10"
        :class="variant === 'offline' ? 'text-down' : 'text-accent'"
        viewBox="0 0 240 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          class="cl-pulse-path"
          d="M0 20 L40 20 L52 8 L64 32 L76 14 L88 26 L100 20 L240 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
      </svg>
      <span class="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint text-center max-w-[32ch]">
        {{ hint }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.cl-sweep {
  animation: cl-sweep 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.cl-pulse-path {
  stroke-dasharray: 8 6;
  animation: cl-dash 1.6s linear infinite;
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
    transform: translateX(100vw);
    opacity: 0;
  }
}
@keyframes cl-dash {
  to {
    stroke-dashoffset: -28;
  }
}
</style>
