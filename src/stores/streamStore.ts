import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type StreamState = 'idle' | 'connecting' | 'live' | 'reconnecting' | 'offline'

export const useStreamStore = defineStore('stream', () => {
  const state = ref<StreamState>('idle')
  const attempt = ref(0)
  const lastReason = ref<string | null>(null)
  const latencyMs = ref(0)
  const msgsPerSec = ref(0)
  const totalMsgs = ref(0)
  const droppedMsgs = ref(0)

  let rateWindowStart = performance.now()
  let rateWindowCount = 0

  function setState(s: StreamState, opts?: { attempt?: number; reason?: string }) {
    state.value = s
    if (opts?.attempt !== undefined) attempt.value = opts.attempt
    if (opts?.reason !== undefined) lastReason.value = opts.reason
    if (s === 'live') attempt.value = 0
  }

  function bumpRx(n = 1) {
    totalMsgs.value += n
    rateWindowCount += n
    const now = performance.now()
    const dt = now - rateWindowStart
    if (dt >= 500) {
      const next = (rateWindowCount * 1000) / dt
      msgsPerSec.value = msgsPerSec.value * 0.6 + next * 0.4
      rateWindowStart = now
      rateWindowCount = 0
    }
  }

  function bumpDrop(n = 1) {
    droppedMsgs.value += n
  }

  function setLatency(ms: number) {
    latencyMs.value = latencyMs.value * 0.8 + ms * 0.2
  }

  function reset() {
    state.value = 'idle'
    attempt.value = 0
    lastReason.value = null
    latencyMs.value = 0
    msgsPerSec.value = 0
    totalMsgs.value = 0
    droppedMsgs.value = 0
    rateWindowStart = performance.now()
    rateWindowCount = 0
  }

  const isLive = computed(() => state.value === 'live')

  return {
    state,
    attempt,
    lastReason,
    latencyMs,
    msgsPerSec,
    totalMsgs,
    droppedMsgs,
    isLive,
    setState,
    bumpRx,
    bumpDrop,
    setLatency,
    reset,
  }
})
