import type {
  ActivityEvent,
  Candle,
  PricePoint,
  Severity,
  SymbolInfo,
  Ticker,
  Trade,
} from '@/types/market'

export const SYMBOLS: SymbolInfo[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', base: 'BTC', quote: 'USDT', icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', base: 'ETH', quote: 'USDT', icon: 'Ξ' },
  { symbol: 'SOLUSDT', name: 'Solana', base: 'SOL', quote: 'USDT', icon: '◎' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', base: 'AVAX', quote: 'USDT', icon: '▲' },
  { symbol: 'BNBUSDT', name: 'BNB', base: 'BNB', quote: 'USDT', icon: '◆' },
  { symbol: 'XRPUSDT', name: 'XRP', base: 'XRP', quote: 'USDT', icon: '✕' },
  { symbol: 'ADAUSDT', name: 'Cardano', base: 'ADA', quote: 'USDT', icon: '₳' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', base: 'DOGE', quote: 'USDT', icon: 'Ð' },
  { symbol: 'LINKUSDT', name: 'Chainlink', base: 'LINK', quote: 'USDT', icon: '⬡' },
  { symbol: 'MATICUSDT', name: 'Polygon', base: 'MATIC', quote: 'USDT', icon: '◇' },
]

const BASE_PRICE: Record<string, number> = {
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

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFor(symbol: string) {
  let h = 0
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) | 0
  return Math.abs(h) || 1
}

export function generateSeries(
  symbol: string,
  points: number,
  stepMs: number,
  endTime = Date.now(),
  volatility = 0.003,
): PricePoint[] {
  const rng = mulberry32(seedFor(symbol))
  const start = BASE_PRICE[symbol] ?? 100
  let price = start * (0.94 + rng() * 0.12)
  const out: PricePoint[] = []
  for (let i = points - 1; i >= 0; i--) {
    const drift = (rng() - 0.498) * volatility
    price = Math.max(0.0001, price * (1 + drift))
    out.push({ t: endTime - i * stepMs, v: price })
  }
  return out
}

export function generateCandles(
  symbol: string,
  count: number,
  stepMs: number,
  endTime = Date.now(),
): Candle[] {
  const rng = mulberry32(seedFor(symbol) + 7)
  const start = BASE_PRICE[symbol] ?? 100
  let price = start * (0.96 + rng() * 0.08)
  const out: Candle[] = []
  for (let i = count - 1; i >= 0; i--) {
    const o = price
    const drift = (rng() - 0.5) * 0.012
    const c = Math.max(0.0001, o * (1 + drift))
    const wickHi = Math.max(o, c) * (1 + rng() * 0.004)
    const wickLo = Math.min(o, c) * (1 - rng() * 0.004)
    const v = (50 + rng() * 950) * (start / 100)
    out.push({ t: endTime - i * stepMs, o, h: wickHi, l: wickLo, c, v })
    price = c
  }
  return out
}

export function tickerFromSeries(symbol: string, series: PricePoint[]): Ticker {
  const last = series[series.length - 1]!
  const first = series[0]!
  const change24h = last.v - first.v
  const changePct24h = (change24h / first.v) * 100
  let high = -Infinity
  let low = Infinity
  for (const p of series) {
    if (p.v > high) high = p.v
    if (p.v < low) low = p.v
  }
  const rng = mulberry32(seedFor(symbol) + 11)
  return {
    symbol,
    price: last.v,
    change24h,
    changePct24h,
    volume24h: (500_000 + rng() * 8_000_000) * (BASE_PRICE[symbol] ?? 100),
    high24h: high,
    low24h: low,
    lastUpdate: last.t,
  }
}

export function buildTickers(): Ticker[] {
  return SYMBOLS.map((s) => {
    const series = generateSeries(s.symbol, 288, 5 * 60_000)
    return tickerFromSeries(s.symbol, series)
  })
}

export function buildTrades(symbol: string, count = 60): Trade[] {
  const rng = mulberry32(seedFor(symbol) + 31)
  const base = BASE_PRICE[symbol] ?? 100
  const now = Date.now()
  const out: Trade[] = []
  for (let i = 0; i < count; i++) {
    const drift = (rng() - 0.5) * 0.004
    const price = base * (1 + drift)
    out.push({
      id: `${symbol}-${i}-${(rng() * 1e9) | 0}`,
      symbol,
      side: rng() > 0.5 ? 'buy' : 'sell',
      price,
      size: 0.001 + rng() * 2.5,
      time: now - i * (300 + rng() * 1200),
    })
  }
  return out.sort((a, b) => b.time - a.time)
}

const TITLES: Record<ActivityEvent['kind'], string[]> = {
  trade: [
    'Large block executed',
    'Sweep across asks',
    'Iceberg detected',
    'Whale wallet inflow',
  ],
  alert: [
    'Volatility spike',
    'Volume above 4σ',
    'Order book imbalance',
    'Funding rate inversion',
  ],
  system: ['Stream resubscribed', 'Snapshot reloaded', 'Latency normalized'],
  signal: [
    'RSI crossover',
    'Golden cross forming',
    'Liquidity pocket cleared',
    'Momentum breakout',
  ],
}

const SEVERITY_BY_KIND: Record<ActivityEvent['kind'], Severity[]> = {
  trade: ['info', 'success'],
  alert: ['warn', 'critical'],
  system: ['info'],
  signal: ['success', 'info', 'warn'],
}

export function buildActivity(count = 80): ActivityEvent[] {
  const rng = mulberry32(404)
  const now = Date.now()
  const kinds: ActivityEvent['kind'][] = ['trade', 'alert', 'system', 'signal']
  const out: ActivityEvent[] = []
  for (let i = 0; i < count; i++) {
    const kind = kinds[(rng() * kinds.length) | 0]!
    const titles = TITLES[kind]
    const severities = SEVERITY_BY_KIND[kind]
    const sym = SYMBOLS[(rng() * SYMBOLS.length) | 0]!
    out.push({
      id: `evt-${i}-${(rng() * 1e9) | 0}`,
      time: now - i * (1500 + rng() * 6000),
      severity: severities[(rng() * severities.length) | 0]!,
      kind,
      symbol: sym.symbol,
      title: titles[(rng() * titles.length) | 0]!,
      detail: ['amount', 'window', 'threshold', 'wallet'][(rng() * 4) | 0],
      value:
        kind === 'trade'
          ? +(rng() * 1_400_000).toFixed(0)
          : +(rng() * 8).toFixed(2),
    })
  }
  return out
}

export const FIXTURE_TICKERS = buildTickers()
export const FIXTURE_ACTIVITY = buildActivity(120)
