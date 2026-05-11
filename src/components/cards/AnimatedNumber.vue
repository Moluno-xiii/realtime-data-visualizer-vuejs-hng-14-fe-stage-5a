<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    duration?: number
    format?: (n: number) => string
  }>(),
  {
    duration: 380,
    format: (n: number) =>
      n.toLocaleString('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
  },
)

const display = ref(props.value)
const raf = ref<number | null>(null)

function tween(from: number, to: number) {
  const start = performance.now()
  const dur = props.duration
  const ease = (t: number) => 1 - Math.pow(1 - t, 3)
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / dur)
    display.value = from + (to - from) * ease(t)
    if (t < 1) raf.value = requestAnimationFrame(step)
  }
  if (raf.value) cancelAnimationFrame(raf.value)
  raf.value = requestAnimationFrame(step)
}

watch(
  () => props.value,
  (n, prev) => {
    if (!Number.isFinite(n)) return
    tween(prev ?? n, n)
  },
)

onBeforeUnmount(() => {
  if (raf.value) cancelAnimationFrame(raf.value)
})
</script>

<template>
  <span class="num mono">{{ props.format(display) }}</span>
</template>

<style scoped>
.num {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
</style>
