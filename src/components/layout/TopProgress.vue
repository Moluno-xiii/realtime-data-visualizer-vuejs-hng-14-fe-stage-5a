<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const active = ref(false)
const visible = ref(false)
const progress = ref(0)
let raf: number | null = null
let hideTimer: number | null = null

function start() {
  active.value = true
  visible.value = true
  progress.value = 6
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  if (raf) cancelAnimationFrame(raf)
  const begin = performance.now()
  const step = (now: number) => {
    if (!active.value) return
    const elapsed = now - begin
    const target = Math.min(86, 16 + Math.log2(elapsed / 40 + 1) * 18)
    progress.value = Math.max(progress.value, target)
    raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

function finish() {
  if (!active.value) return
  active.value = false
  if (raf) cancelAnimationFrame(raf)
  progress.value = 100
  hideTimer = window.setTimeout(() => {
    visible.value = false
    progress.value = 0
  }, 240)
}

let removeBefore: (() => void) | null = null
let removeAfter: (() => void) | null = null
let removeError: (() => void) | null = null

onMounted(() => {
  removeBefore = router.beforeEach((to, from, next) => {
    if (to.fullPath !== from.fullPath) start()
    next()
  })
  removeAfter = router.afterEach(() => finish())
  removeError = router.onError(() => finish())
})

onBeforeUnmount(() => {
  removeBefore?.()
  removeAfter?.()
  removeError?.()
  if (raf) cancelAnimationFrame(raf)
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<template>
  <div
    v-if="visible"
    class="fixed top-0 left-0 right-0 h-[2px] z-[9999] pointer-events-none bg-transparent"
    role="progressbar"
    aria-label="Loading route"
    :aria-valuenow="Math.round(progress)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <span
      class="block h-full bg-accent shadow-[0_0_8px_var(--accent)] transition-[width,opacity] [transition-duration:180ms,220ms]"
      :style="{ width: `${progress}%`, opacity: active ? 1 : 0 }"
    ></span>
  </div>
</template>
