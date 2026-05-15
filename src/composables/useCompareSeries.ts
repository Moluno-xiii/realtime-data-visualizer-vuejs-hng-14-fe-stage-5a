import { computed, watch, type Ref } from 'vue'
import type { PricePoint, TimeRange } from '@/types/market'
import { useKlineStore } from '@/stores/klineStore'
import { streamService } from '@/services/stream/StreamService'
import { RANGE_CONFIG } from './useChartData'

export interface CompareSeries {
  symbol: string
  series: PricePoint[]
}

export function useCompareSeries(
  symbols: Ref<string[]>,
  range: Ref<TimeRange>,
) {
  const klines = useKlineStore()

  watch(
    [symbols, range],
    ([syms, r]) => {
      const spec = RANGE_CONFIG[r]
      if (spec.interval === '1m') return
      for (const sym of syms) {
        void streamService.ensureKlines(sym, spec.interval, spec.limit)
      }
    },
    { immediate: true },
  )

  const result = computed<CompareSeries[]>(() => {
    const spec = RANGE_CONFIG[range.value]
    return symbols.value.map((sym) => {
      const list = klines.get(sym, spec.interval)
      if (!list.length) return { symbol: sym, series: [] }
      let trimmed = list
      if (spec.windowMs) {
        const cutoff = list[list.length - 1]!.t - spec.windowMs
        let start = 0
        for (let i = list.length - 1; i >= 0; i--) {
          if (list[i]!.t < cutoff) {
            start = i + 1
            break
          }
        }
        trimmed = list.slice(start)
      } else {
        trimmed = list.slice(-spec.limit)
      }
      return {
        symbol: sym,
        series: trimmed.map((c) => ({ t: c.t, v: c.c })),
      }
    })
  })

  return { compareSeries: result }
}
