import { computed, ref, watch, type Ref } from 'vue'
import type { Candle, PricePoint, TimeRange } from '@/types/market'
import { useKlineStore } from '@/stores/klineStore'
import { streamService } from '@/services/stream/StreamService'

interface RangeSpec {
  interval: string
  limit: number
  windowMs?: number
}

export const RANGE_CONFIG: Record<TimeRange, RangeSpec> = {
  live: { interval: '1m', limit: 240, windowMs: 5 * 60_000 },
  '1m': { interval: '1m', limit: 240, windowMs: 5 * 60_000 },
  '5m': { interval: '1m', limit: 240, windowMs: 30 * 60_000 },
  '15m': { interval: '1m', limit: 240, windowMs: 60 * 60_000 },
  '1h': { interval: '1m', limit: 240, windowMs: 4 * 60 * 60_000 },
  '4h': { interval: '5m', limit: 240, windowMs: 24 * 60 * 60_000 },
  '1mo': { interval: '1h', limit: 720 },
  '3mo': { interval: '4h', limit: 540 },
  '6mo': { interval: '1d', limit: 180 },
  '1y': { interval: '1d', limit: 365 },
}

export function useChartData(symbol: Ref<string>, range: Ref<TimeRange>) {
  const klines = useKlineStore()
  const loading = ref(false)

  const spec = computed<RangeSpec>(() => RANGE_CONFIG[range.value])

  async function load(sym: string, s: RangeSpec) {
    if (s.interval === '1m') return
    loading.value = true
    try {
      await streamService.ensureKlines(sym, s.interval, s.limit)
    } finally {
      loading.value = false
    }
  }

  watch(
    [symbol, spec],
    ([sym, s]) => {
      if (!sym) return
      void load(sym, s)
    },
    { immediate: true },
  )

  const candles = computed<Candle[]>(() => {
    const s = spec.value
    const list = klines.get(symbol.value, s.interval)
    if (!list.length) return []
    if (s.windowMs) {
      const cutoff = list[list.length - 1]!.t - s.windowMs
      let start = 0
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i]!.t < cutoff) {
          start = i + 1
          break
        }
      }
      return list.slice(start)
    }
    return list.slice(-s.limit)
  })

  const series = computed<PricePoint[]>(() =>
    candles.value.map((c) => ({ t: c.t, v: c.c })),
  )

  return { candles, series, loading }
}
