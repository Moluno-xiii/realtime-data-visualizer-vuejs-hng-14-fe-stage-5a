export type Severity = 'info' | 'success' | 'warn' | 'critical'

export interface SymbolInfo {
  symbol: string
  name: string
  base: string
  quote: string
  icon: string
}

export interface Ticker {
  symbol: string
  price: number
  change24h: number
  changePct24h: number
  volume24h: number
  high24h: number
  low24h: number
  lastUpdate: number
}

export interface PricePoint {
  t: number
  v: number
}

export interface Candle {
  t: number
  o: number
  h: number
  l: number
  c: number
  v: number
}

export interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  price: number
  size: number
  time: number
}

export interface ActivityEvent {
  id: string
  time: number
  severity: Severity
  kind: 'trade' | 'alert' | 'system' | 'signal'
  symbol?: string
  title: string
  detail?: string
  value?: number
}

export type TimeRange = '1m' | '5m' | '15m' | '1h' | '4h' | 'live'

export type ChartKind = 'line' | 'area' | 'bar' | 'candle'
