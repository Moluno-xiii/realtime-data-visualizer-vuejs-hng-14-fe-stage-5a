import { z } from 'zod'

const num = z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number())

export const BinanceTickerFrame = z.object({
  e: z.literal('24hrTicker').optional(),
  s: z.string(),
  c: num,
  o: num,
  h: num,
  l: num,
  v: num,
  q: num,
  p: num,
  P: num,
  E: z.number().optional(),
})

export const BinanceKlineFrame = z.object({
  e: z.literal('kline').optional(),
  s: z.string(),
  k: z.object({
    t: z.number(),
    T: z.number(),
    s: z.string(),
    i: z.string(),
    o: num,
    c: num,
    h: num,
    l: num,
    v: num,
    x: z.boolean(),
  }),
})

export const BinanceTradeFrame = z.object({
  e: z.literal('trade').optional(),
  s: z.string(),
  t: z.number(),
  p: num,
  q: num,
  T: z.number(),
  m: z.boolean(),
})

export const BinanceCombinedFrame = z.object({
  stream: z.string(),
  data: z.unknown(),
})

export type BinanceTickerData = z.infer<typeof BinanceTickerFrame>
export type BinanceKlineData = z.infer<typeof BinanceKlineFrame>
export type BinanceTradeData = z.infer<typeof BinanceTradeFrame>
