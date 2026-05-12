import type { Candle, Ticker, Trade } from '@/types/market'
import { BaseClient, backoffMs } from './BaseClient'
import {
  BinanceCombinedFrame,
  BinanceKlineFrame,
  BinanceTickerFrame,
  BinanceTradeFrame,
} from './schema'
import type { Subscription } from './types'

const BASE = 'wss://stream.binance.com:9443/stream?streams='
const RECONNECT_CAP = 30_000

export class BinanceClient extends BaseClient {
  private ws: WebSocket | null = null
  private reconnectTimer: number | null = null
  private heartbeat: number | null = null
  private lastFrameAt = 0
  private opened = false
  private intentionalClose = false
  private rxCount = 0
  private dropCount = 0

  start(sub: Subscription): void {
    this.sub = sub
    this.intentionalClose = false
    this.attempt = 0
    this.connect()
  }

  stop(): void {
    this.intentionalClose = true
    this.clearTimers()
    if (this.ws) {
      try {
        this.ws.close()
      } catch {
        /* noop */
      }
    }
    this.ws = null
    this.emit({ kind: 'status', state: 'idle' })
  }

  private clearTimers() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.heartbeat !== null) {
      clearInterval(this.heartbeat)
      this.heartbeat = null
    }
  }

  private buildUrl(sub: Subscription): string {
    const streams: string[] = []
    for (const s of sub.symbols) {
      const lc = s.toLowerCase()
      streams.push(`${lc}@ticker`)
      if (sub.klineInterval) {
        streams.push(`${lc}@kline_${sub.klineInterval}`)
      }
      if (sub.trades) {
        streams.push(`${lc}@trade`)
      }
    }
    return BASE + streams.join('/')
  }

  private connect() {
    if (!this.sub) return
    this.clearTimers()
    this.opened = false
    this.emit({
      kind: 'status',
      state: this.attempt === 0 ? 'connecting' : 'reconnecting',
      attempt: this.attempt,
    })

    let ws: WebSocket
    try {
      ws = new WebSocket(this.buildUrl(this.sub))
    } catch (err) {
      this.emit({ kind: 'error', message: `ws ctor: ${(err as Error).message}` })
      this.scheduleReconnect()
      return
    }
    this.ws = ws

    ws.onopen = () => {
      this.opened = true
      this.attempt = 0
      this.lastFrameAt = performance.now()
      this.emit({ kind: 'status', state: 'live' })
      this.heartbeat = window.setInterval(() => {
        if (!this.opened) return
        if (
          typeof document !== 'undefined' &&
          document.visibilityState === 'hidden'
        ) {
          this.lastFrameAt = performance.now()
          return
        }
        const stale = performance.now() - this.lastFrameAt
        if (stale > 45_000) {
          this.emit({
            kind: 'status',
            state: 'reconnecting',
            reason: 'no frames for 45s',
          })
          try {
            ws.close()
          } catch {
            /* noop */
          }
        }
      }, 5_000)
    }

    ws.onmessage = (msg) => {
      this.lastFrameAt = performance.now()
      this.lastPingMs = 0
      this.rxCount++
      this.handleMessage(msg.data)
    }

    ws.onerror = () => {
      this.emit({ kind: 'error', message: 'websocket error' })
    }

    ws.onclose = () => {
      this.opened = false
      if (this.intentionalClose) return
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.intentionalClose) return
    this.clearTimers()
    const delay = backoffMs(this.attempt, RECONNECT_CAP)
    this.attempt++
    const offline = this.attempt >= 4
    this.emit({
      kind: 'status',
      state: offline ? 'offline' : 'reconnecting',
      attempt: this.attempt,
      reason: offline
        ? 'binance unreachable'
        : `retry in ${Math.round(delay)}ms`,
    })
    this.reconnectTimer = window.setTimeout(() => this.connect(), delay)
  }

  private handleMessage(raw: unknown) {
    let parsed: unknown
    try {
      parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    } catch {
      this.dropCount++
      return
    }
    const outer = BinanceCombinedFrame.safeParse(parsed)
    if (!outer.success) {
      this.dropCount++
      return
    }
    const streamName = outer.data.stream
    const data = outer.data.data
    if (streamName.endsWith('@ticker')) {
      this.emitTicker(data)
    } else if (streamName.includes('@kline_')) {
      this.emitKline(data)
    } else if (streamName.endsWith('@trade')) {
      this.emitTrade(data)
    } else {
      this.dropCount++
    }
  }

  private emitTicker(raw: unknown) {
    const p = BinanceTickerFrame.safeParse(raw)
    if (!p.success) {
      this.dropCount++
      return
    }
    const d = p.data
    const t: Ticker = {
      symbol: d.s,
      price: d.c,
      change24h: d.p,
      changePct24h: d.P,
      volume24h: d.q,
      high24h: d.h,
      low24h: d.l,
      lastUpdate: d.E ?? Date.now(),
    }
    this.emit({ kind: 'ticker', payload: t })
  }

  private emitKline(raw: unknown) {
    const p = BinanceKlineFrame.safeParse(raw)
    if (!p.success) {
      this.dropCount++
      return
    }
    const k = p.data.k
    const c: Candle = { t: k.t, o: k.o, h: k.h, l: k.l, c: k.c, v: k.v }
    this.emit({
      kind: 'kline',
      symbol: k.s,
      interval: k.i,
      candle: c,
      closed: k.x,
    })
  }

  private emitTrade(raw: unknown) {
    const p = BinanceTradeFrame.safeParse(raw)
    if (!p.success) {
      this.dropCount++
      return
    }
    const d = p.data
    const t: Trade = {
      id: `${d.s}-${d.t}`,
      symbol: d.s,
      side: d.m ? 'sell' : 'buy',
      price: d.p,
      size: d.q,
      time: d.T,
    }
    this.emit({ kind: 'trade', payload: t })
  }
}
