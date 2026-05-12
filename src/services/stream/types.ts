import type { Candle, Ticker, Trade } from '@/types/market'

export type TickerEvent = { kind: 'ticker'; payload: Ticker }
export type KlineEvent = {
  kind: 'kline'
  symbol: string
  interval: string
  candle: Candle
  closed: boolean
}
export type TradeEvent = { kind: 'trade'; payload: Trade }
export type StatusEvent = {
  kind: 'status'
  state: 'idle' | 'connecting' | 'live' | 'reconnecting' | 'offline'
  attempt?: number
  reason?: string
}
export type ErrorEvent = { kind: 'error'; message: string }

export type StreamEvent =
  | TickerEvent
  | KlineEvent
  | TradeEvent
  | StatusEvent
  | ErrorEvent

export type Subscription = {
  symbols: string[]
  klineInterval?: string
  trades?: boolean
}

export interface StreamClient {
  start(sub: Subscription): void
  stop(): void
  on(handler: (e: StreamEvent) => void): () => void
  ping(): number | null
}
