import { defineStore } from 'pinia'
import { ref, shallowRef, triggerRef } from 'vue'
import type { PricePoint, Ticker, Trade } from '@/types/market'

const SERIES_CAP = 600
const TRADES_CAP = 80

export const useMarketStore = defineStore('market', () => {
  const tickers = shallowRef<Record<string, Ticker>>({})
  const series = shallowRef<Record<string, PricePoint[]>>({})
  const trades = shallowRef<Record<string, Trade[]>>({})
  const lastTickAt = ref(0)

  function upsertTicker(t: Ticker) {
    const next = { ...tickers.value, [t.symbol]: t }
    tickers.value = next

    const existing = series.value[t.symbol]
    const arr = existing ? existing.slice() : []
    const last = arr[arr.length - 1]
    const point: PricePoint = { t: t.lastUpdate, v: t.price }
    if (!last || point.t - last.t >= 800) {
      arr.push(point)
      if (arr.length > SERIES_CAP) arr.splice(0, arr.length - SERIES_CAP)
      series.value = { ...series.value, [t.symbol]: arr }
    }
    lastTickAt.value = t.lastUpdate
  }

  function seedSeries(symbol: string, points: PricePoint[]) {
    if (!points.length) return
    series.value = { ...series.value, [symbol]: points.slice(-SERIES_CAP) }
    triggerRef(series)
  }

  function seedTickers(list: Ticker[]) {
    const next = { ...tickers.value }
    for (const t of list) next[t.symbol] = t
    tickers.value = next
  }

  function pushTrade(t: Trade) {
    const existing = trades.value[t.symbol]
    const arr = existing ? existing.slice() : []
    arr.unshift(t)
    if (arr.length > TRADES_CAP) arr.length = TRADES_CAP
    trades.value = { ...trades.value, [t.symbol]: arr }
  }

  function getTrades(symbol: string): Trade[] {
    return trades.value[symbol] ?? []
  }

  function getTicker(symbol: string): Ticker | undefined {
    return tickers.value[symbol]
  }

  function getSeries(symbol: string): PricePoint[] {
    return series.value[symbol] ?? []
  }

  function clear(symbols?: string[]) {
    if (!symbols) {
      tickers.value = {}
      series.value = {}
      return
    }
    const t = { ...tickers.value }
    const s = { ...series.value }
    for (const sym of symbols) {
      delete t[sym]
      delete s[sym]
    }
    tickers.value = t
    series.value = s
  }

  return {
    tickers,
    series,
    trades,
    lastTickAt,
    upsertTicker,
    seedSeries,
    seedTickers,
    pushTrade,
    getTicker,
    getSeries,
    getTrades,
    clear,
  }
})
