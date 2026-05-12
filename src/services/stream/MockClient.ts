import type { Candle, Ticker, Trade } from '@/types/market'
import { BaseClient } from './BaseClient'
import { generateCandles, generateSeries } from '@/mocks/fixtures'
import type { Subscription } from './types'

const TICKER_BASE: Record<string, number> = {
  BTCUSDT: 67_842.31,
  ETHUSDT: 3_512.84,
  SOLUSDT: 178.42,
  AVAXUSDT: 39.71,
  BNBUSDT: 612.05,
  XRPUSDT: 0.5421,
  ADAUSDT: 0.4612,
  DOGEUSDT: 0.1583,
  LINKUSDT: 17.84,
  MATICUSDT: 0.7912,
}

export class MockClient extends BaseClient {
  private tickInterval: number | null = null
  private tradeInterval: number | null = null
  private klineInterval: number | null = null
  private prices = new Map<string, number>()
  private opens = new Map<string, number>()
  private currentCandles = new Map<string, Candle>()
  private candleStepMs = 60_000

  start(sub: Subscription): void {
    this.sub = sub
    this.emit({ kind: 'status', state: 'connecting' })
    for (const s of sub.symbols) {
      const start = TICKER_BASE[s] ?? 100
      this.prices.set(s, start)
      this.opens.set(s, start * (0.97 + Math.random() * 0.06))
      const now = Date.now()
      const start0 = Math.floor(now / this.candleStepMs) * this.candleStepMs
      this.currentCandles.set(s, {
        t: start0,
        o: start,
        h: start,
        l: start,
        c: start,
        v: 0,
      })
    }
    setTimeout(() => this.emit({ kind: 'status', state: 'live' }), 240)
    this.lastPingMs = 12

    this.tickInterval = window.setInterval(() => this.emitTicks(), 800)
    if (sub.trades) {
      this.tradeInterval = window.setInterval(() => this.emitTrade(), 350)
    }
    if (sub.klineInterval) {
      this.klineInterval = window.setInterval(() => this.emitKline(), 1_000)
    }
  }

  stop(): void {
    if (this.tickInterval !== null) clearInterval(this.tickInterval)
    if (this.tradeInterval !== null) clearInterval(this.tradeInterval)
    if (this.klineInterval !== null) clearInterval(this.klineInterval)
    this.tickInterval = null
    this.tradeInterval = null
    this.klineInterval = null
    this.prices.clear()
    this.opens.clear()
    this.currentCandles.clear()
    this.emit({ kind: 'status', state: 'idle' })
  }

  private emitTicks() {
    if (!this.sub) return
    for (const s of this.sub.symbols) {
      const cur = this.prices.get(s) ?? 100
      const open = this.opens.get(s) ?? cur
      const drift = (Math.random() - 0.5) * 0.0018
      const next = Math.max(0.0001, cur * (1 + drift))
      this.prices.set(s, next)

      const candle = this.currentCandles.get(s)
      if (candle) {
        candle.c = next
        if (next > candle.h) candle.h = next
        if (next < candle.l) candle.l = next
        candle.v += Math.random() * 1.2
      }

      const change = next - open
      const ticker: Ticker = {
        symbol: s,
        price: next,
        change24h: change,
        changePct24h: (change / open) * 100,
        volume24h: this.makeVolume(s),
        high24h: open * 1.04,
        low24h: open * 0.96,
        lastUpdate: Date.now(),
      }
      this.emit({ kind: 'ticker', payload: ticker })
    }
  }

  private emitTrade() {
    if (!this.sub) return
    const s = this.sub.symbols[Math.floor(Math.random() * this.sub.symbols.length)]
    if (!s) return
    const price = this.prices.get(s) ?? 100
    const t: Trade = {
      id: `${s}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      symbol: s,
      side: Math.random() > 0.5 ? 'buy' : 'sell',
      price: price * (1 + (Math.random() - 0.5) * 0.0005),
      size: 0.001 + Math.random() * 1.8,
      time: Date.now(),
    }
    this.emit({ kind: 'trade', payload: t })
  }

  private emitKline() {
    if (!this.sub || !this.sub.klineInterval) return
    const now = Date.now()
    for (const s of this.sub.symbols) {
      const candle = this.currentCandles.get(s)
      if (!candle) continue
      const period = candle.t + this.candleStepMs
      const closed = now >= period
      this.emit({
        kind: 'kline',
        symbol: s,
        interval: this.sub.klineInterval,
        candle: { ...candle },
        closed,
      })
      if (closed) {
        const next: Candle = {
          t: period,
          o: candle.c,
          h: candle.c,
          l: candle.c,
          c: candle.c,
          v: 0,
        }
        this.currentCandles.set(s, next)
      }
    }
  }

  private makeVolume(symbol: string): number {
    const base = TICKER_BASE[symbol] ?? 100
    return base * (5_000 + Math.random() * 50_000)
  }

  seedHistory(symbol: string, points: number, stepMs: number) {
    return generateSeries(symbol, points, stepMs)
  }

  seedCandles(symbol: string, count: number, stepMs: number) {
    return generateCandles(symbol, count, stepMs)
  }
}
