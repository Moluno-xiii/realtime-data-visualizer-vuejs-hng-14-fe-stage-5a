import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useWatchlist } from './useWatchlist'
import { usePause } from './usePause'

const latencyMs = ref(0)
const msgsPerSec = ref(0)
const ticks = ref(0)

let booted = false
let rafId: number | null = null
let intervalId: number | null = null

function start() {
  if (booted) return
  booted = true
  const { paused } = usePause()
  const { symbols } = useWatchlist()

  let prev = performance.now()
  const loop = (now: number) => {
    const dt = now - prev
    prev = now
    const jitter = Math.max(0, Math.min(120, dt - 16.67))
    latencyMs.value = latencyMs.value * 0.92 + jitter * 0.08
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)

  let acc = 0
  intervalId = window.setInterval(() => {
    if (paused.value) {
      msgsPerSec.value = msgsPerSec.value * 0.7
      return
    }
    const per = symbols.value.length * 6
    const noise = (Math.random() - 0.5) * per * 0.1
    const next = Math.max(0, per + noise)
    acc += next
    msgsPerSec.value = msgsPerSec.value * 0.6 + next * 0.4
    ticks.value = (ticks.value + Math.round(next / 4)) | 0
  }, 250)
}

function stop() {
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (intervalId !== null) clearInterval(intervalId)
  rafId = null
  intervalId = null
  booted = false
}

let mounts = 0

export function useHeartbeat() {
  onMounted(() => {
    mounts++
    start()
  })
  onBeforeUnmount(() => {
    mounts--
    if (mounts <= 0) stop()
  })
  return { latencyMs, msgsPerSec, ticks }
}
