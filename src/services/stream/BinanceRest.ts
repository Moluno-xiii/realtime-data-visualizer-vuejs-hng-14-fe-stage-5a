import type { Candle, PricePoint, SymbolInfo, Ticker } from '@/types/market'
import { z } from 'zod'

const REST = 'https://api.binance.com/api/v3'

const num = z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number())

const KlineTuple = z.tuple([
  z.number(),
  num,
  num,
  num,
  num,
  num,
])
const KlineArray = z.array(z.array(z.any()))

const TickerEntry = z.object({
  symbol: z.string(),
  lastPrice: num,
  priceChange: num,
  priceChangePercent: num,
  highPrice: num,
  lowPrice: num,
  quoteVolume: num,
  closeTime: z.number().optional(),
})
const TickerArray = z.array(TickerEntry)

export class BinanceRest {
  private base: string
  constructor(base = REST) {
    this.base = base
  }

  async fetchKlines(
    symbol: string,
    interval = '1m',
    limit = 240,
  ): Promise<Candle[]> {
    const url = `${this.base}/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`klines ${symbol}: ${res.status}`)
    const raw = await res.json()
    const parsed = KlineArray.safeParse(raw)
    if (!parsed.success) throw new Error(`klines ${symbol}: bad shape`)
    const out: Candle[] = []
    for (const row of parsed.data) {
      const tup = KlineTuple.safeParse(row.slice(0, 6))
      if (!tup.success) continue
      const [t, o, h, l, c, v] = tup.data
      out.push({ t, o, h, l, c, v })
    }
    return out
  }

  async fetchSymbols(quoteAsset = 'USDT'): Promise<SymbolInfo[]> {
    const res = await fetch(`${this.base}/exchangeInfo`)
    if (!res.ok) throw new Error(`exchangeInfo: ${res.status}`)
    const data = await res.json()
    const ExchangeInfo = z.object({
      symbols: z.array(
        z.object({
          symbol: z.string(),
          baseAsset: z.string(),
          quoteAsset: z.string(),
          status: z.string(),
          isSpotTradingAllowed: z.boolean().optional(),
        }),
      ),
    })
    const parsed = ExchangeInfo.safeParse(data)
    if (!parsed.success) throw new Error('exchangeInfo: bad shape')
    return parsed.data.symbols
      .filter(
        (s) =>
          s.status === 'TRADING' &&
          s.quoteAsset === quoteAsset &&
          s.isSpotTradingAllowed !== false,
      )
      .map((s) => ({
        symbol: s.symbol,
        name: s.baseAsset,
        base: s.baseAsset,
        quote: s.quoteAsset,
        icon: s.baseAsset.charAt(0),
      }))
  }

  async fetchTickers(symbols: string[]): Promise<Ticker[]> {
    if (!symbols.length) return []
    const param = encodeURIComponent(JSON.stringify(symbols))
    const url = `${this.base}/ticker/24hr?symbols=${param}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`tickers: ${res.status}`)
    const raw = await res.json()
    const parsed = TickerArray.safeParse(raw)
    if (!parsed.success) throw new Error('tickers: bad shape')
    return parsed.data.map((t) => ({
      symbol: t.symbol,
      price: t.lastPrice,
      change24h: t.priceChange,
      changePct24h: t.priceChangePercent,
      volume24h: t.quoteVolume,
      high24h: t.highPrice,
      low24h: t.lowPrice,
      lastUpdate: t.closeTime ?? Date.now(),
    }))
  }
}

export function candlesToSeries(candles: Candle[]): PricePoint[] {
  return candles.map((c) => ({ t: c.t, v: c.c }))
}

export const binanceRest = new BinanceRest()
