import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import type { ActivityEvent, Severity, Trade } from '@/types/market'

const CAP = 500

function severityForTrade(t: Trade): Severity {
  const notional = t.price * t.size
  if (notional > 250_000) return 'critical'
  if (notional > 50_000) return 'warn'
  if (t.size > 0.5) return 'success'
  return 'info'
}

function titleForTrade(t: Trade): string {
  const notional = t.price * t.size
  if (notional > 250_000) return 'Whale order executed'
  if (notional > 50_000) return 'Large block executed'
  if (t.size > 0.5) return 'Sweep across asks'
  return 'Trade printed'
}

export const useActivityStore = defineStore('activity', () => {
  const events = shallowRef<ActivityEvent[]>([])

  function pushTrade(t: Trade) {
    const ev: ActivityEvent = {
      id: t.id,
      time: t.time,
      severity: severityForTrade(t),
      kind: 'trade',
      symbol: t.symbol,
      title: titleForTrade(t),
      detail: t.side,
      value: +(t.price * t.size).toFixed(2),
    }
    const next = [ev, ...events.value]
    if (next.length > CAP) next.length = CAP
    events.value = next
  }

  function pushMany(list: ActivityEvent[]) {
    if (!list.length) return
    const next = [...list, ...events.value]
    if (next.length > CAP) next.length = CAP
    events.value = next
  }

  function clear() {
    events.value = []
  }

  return { events, pushTrade, pushMany, clear }
})
