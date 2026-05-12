import { defineStore } from 'pinia'
import { shallowRef, triggerRef } from 'vue'
import type { Candle } from '@/types/market'

const CANDLE_CAP = 500

type SymbolKey = string
type IntervalKey = string

function key(symbol: SymbolKey, interval: IntervalKey) {
  return `${symbol}:${interval}`
}

export const useKlineStore = defineStore('kline', () => {
  const candles = shallowRef<Record<string, Candle[]>>({})

  function get(symbol: string, interval: string): Candle[] {
    return candles.value[key(symbol, interval)] ?? []
  }

  function seed(symbol: string, interval: string, list: Candle[]) {
    const k = key(symbol, interval)
    candles.value = {
      ...candles.value,
      [k]: list.slice(-CANDLE_CAP),
    }
    triggerRef(candles)
  }

  function upsert(symbol: string, interval: string, c: Candle, closed: boolean) {
    const k = key(symbol, interval)
    const existing = candles.value[k]
    const arr = existing ? existing.slice() : []
    const last = arr[arr.length - 1]
    if (last && last.t === c.t) {
      arr[arr.length - 1] = c
    } else {
      arr.push(c)
      if (arr.length > CANDLE_CAP) arr.splice(0, arr.length - CANDLE_CAP)
    }
    void closed
    candles.value = { ...candles.value, [k]: arr }
  }

  function clear(symbols?: string[]) {
    if (!symbols) {
      candles.value = {}
      return
    }
    const c = { ...candles.value }
    for (const sym of symbols) {
      for (const k of Object.keys(c)) {
        if (k.startsWith(sym + ':')) delete c[k]
      }
    }
    candles.value = c
  }

  return { candles, get, seed, upsert, clear }
})
