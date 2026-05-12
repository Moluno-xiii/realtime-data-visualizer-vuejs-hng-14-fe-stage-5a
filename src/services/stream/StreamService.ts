import type { Candle, PricePoint, Ticker, Trade } from '@/types/market'
import type { DataSourceMode } from '@/composables/useDataSource'
import { generateCandles, generateSeries } from '@/mocks/fixtures'
import { createRafBatch, type RafBatch } from '@/composables/useRafBatch'
import { useActivityStore } from '@/stores/activityStore'
import { useKlineStore } from '@/stores/klineStore'
import { useMarketStore } from '@/stores/marketStore'
import { useStreamStore } from '@/stores/streamStore'
import { usePause } from '@/composables/usePause'
import { binanceRest, candlesToSeries } from './BinanceRest'
import { BinanceClient } from './BinanceClient'
import { MockClient } from './MockClient'
import type { StreamClient, StreamEvent } from './types'

const KLINE_INTERVAL = '1m'

type BatchItem =
  | { kind: 'ticker'; t: Ticker }
  | {
      kind: 'kline'
      symbol: string
      interval: string
      candle: Candle
      closed: boolean
    }
  | { kind: 'trade'; t: Trade }

export class StreamService {
  private client: StreamClient | null = null
  private detach: (() => void) | null = null
  private batch: RafBatch<BatchItem> | null = null
  private currentSymbols: string[] = []
  private currentMode: DataSourceMode = 'live'
  private refCount = 0
  private seedToken = 0

  attach() {
    this.refCount++
  }

  detachOnce() {
    this.refCount--
    if (this.refCount <= 0) {
      this.refCount = 0
      this.stop()
    }
  }

  isActive(): boolean {
    return this.refCount > 0
  }

  configure(symbols: string[], mode: DataSourceMode) {
    if (!this.isActive()) return
    const sameSyms =
      symbols.length === this.currentSymbols.length &&
      symbols.every((s, i) => s === this.currentSymbols[i])
    if (this.client && sameSyms && mode === this.currentMode) return
    this.restart(symbols, mode)
  }

  async ensureKlines(symbol: string, interval: string, limit: number) {
    const klines = useKlineStore()
    const market = useMarketStore()
    const existing = klines.get(symbol, interval)
    if (existing.length >= limit) return
    try {
      const candles = await binanceRest.fetchKlines(symbol, interval, limit)
      klines.seed(symbol, interval, candles)
      if (interval === '1m') {
        market.seedSeries(symbol, candlesToSeries(candles))
      }
    } catch (err) {
      console.warn(`[stream] ensureKlines ${symbol}/${interval} failed`, err)
    }
  }

  ensureStarted(symbols: string[], mode: DataSourceMode) {
    if (this.client) return
    this.restart(symbols, mode)
  }

  private restart(symbols: string[], mode: DataSourceMode) {
    this.stop()
    this.currentSymbols = [...symbols]
    this.currentMode = mode
    this.client = this.makeClient(mode)
    this.bind()
    this.client.start({ symbols, klineInterval: KLINE_INTERVAL, trades: true })
    void this.seedHistory(symbols, mode)
  }

  private stop() {
    if (this.detach) this.detach()
    this.detach = null
    if (this.batch) this.batch.stop()
    this.batch = null
    if (this.client) this.client.stop()
    this.client = null
    this.currentSymbols = []
    const stream = useStreamStore()
    stream.reset()
  }

  private makeClient(mode: DataSourceMode): StreamClient {
    return mode === 'live' ? new BinanceClient() : new MockClient()
  }

  private async seedHistory(symbols: string[], mode: DataSourceMode) {
    const token = ++this.seedToken
    if (mode === 'live') {
      await this.seedFromRest(symbols, token)
    } else {
      this.seedFromFixtures(symbols, token)
    }
  }

  private seedFromFixtures(symbols: string[], token: number) {
    if (token !== this.seedToken) return
    const market = useMarketStore()
    const klines = useKlineStore()
    const now = Date.now()
    for (const s of symbols) {
      const series: PricePoint[] = generateSeries(s, 240, 60_000, now)
      market.seedSeries(s, series)
      const candles: Candle[] = generateCandles(s, 240, 60_000, now)
      klines.seed(s, KLINE_INTERVAL, candles)
    }
  }

  private async seedFromRest(symbols: string[], token: number) {
    const market = useMarketStore()
    const klines = useKlineStore()
    try {
      const tickers = await binanceRest.fetchTickers(symbols)
      if (token !== this.seedToken) return
      market.seedTickers(tickers)
    } catch (err) {
      console.warn('[stream] seed tickers failed', err)
    }
    await Promise.all(
      symbols.map(async (s) => {
        try {
          const candles = await binanceRest.fetchKlines(s, KLINE_INTERVAL, 240)
          if (token !== this.seedToken) return
          klines.seed(s, KLINE_INTERVAL, candles)
          market.seedSeries(s, candlesToSeries(candles))
        } catch (err) {
          console.warn(`[stream] seed klines ${s} failed`, err)
        }
      }),
    )
  }

  private bind() {
    if (!this.client) return
    const stream = useStreamStore()
    const market = useMarketStore()
    const klines = useKlineStore()
    const activity = useActivityStore()
    const { paused } = usePause()

    const batch = createRafBatch<BatchItem>((items) => {
      if (paused.value) return
      for (const item of items) {
        if (item.kind === 'ticker') market.upsertTicker(item.t)
        else if (item.kind === 'kline')
          klines.upsert(item.symbol, item.interval, item.candle, item.closed)
        else if (item.kind === 'trade') {
          market.pushTrade(item.t)
          activity.pushTrade(item.t)
        }
      }
    })
    this.batch = batch

    let lastFrameAt = performance.now()

    const off = this.client.on((e: StreamEvent) => {
      if (e.kind === 'status') {
        stream.setState(e.state, { attempt: e.attempt, reason: e.reason })
        return
      }
      if (e.kind === 'error') {
        stream.setState('reconnecting', { reason: e.message })
        return
      }
      const now = performance.now()
      stream.setLatency(Math.min(500, now - lastFrameAt))
      lastFrameAt = now
      stream.bumpRx()
      if (e.kind === 'ticker') batch.push({ kind: 'ticker', t: e.payload })
      else if (e.kind === 'kline')
        batch.push({
          kind: 'kline',
          symbol: e.symbol,
          interval: e.interval,
          candle: e.candle,
          closed: e.closed,
        })
      else if (e.kind === 'trade') batch.push({ kind: 'trade', t: e.payload })
    })

    this.detach = () => {
      off()
      batch.stop()
    }
  }
}

export const streamService = new StreamService()
