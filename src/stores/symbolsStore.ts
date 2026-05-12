import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { SymbolInfo } from '@/types/market'
import { SYMBOLS as SEED_SYMBOLS } from '@/mocks/fixtures'
import { binanceRest } from '@/services/stream/BinanceRest'

const KNOWN_ICONS: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  SOL: '◎',
  AVAX: '▲',
  BNB: '◆',
  XRP: '✕',
  ADA: '₳',
  DOGE: 'Ð',
  LINK: '⬡',
  MATIC: '◇',
  POL: '◇',
  DOT: '●',
  TRX: 'T',
  TON: '◊',
  NEAR: 'N',
  ATOM: '⚛',
  ARB: 'A',
  OP: 'O',
  APT: '◉',
  SUI: '〜',
}

const KNOWN_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
  AVAX: 'Avalanche',
  BNB: 'BNB',
  XRP: 'XRP',
  ADA: 'Cardano',
  DOGE: 'Dogecoin',
  LINK: 'Chainlink',
  MATIC: 'Polygon',
  POL: 'Polygon',
  DOT: 'Polkadot',
  TRX: 'Tron',
  TON: 'Toncoin',
  NEAR: 'NEAR',
  ATOM: 'Cosmos',
  ARB: 'Arbitrum',
  OP: 'Optimism',
  APT: 'Aptos',
  SUI: 'Sui',
  LTC: 'Litecoin',
  BCH: 'Bitcoin Cash',
  ETC: 'Ethereum Classic',
  FIL: 'Filecoin',
  XLM: 'Stellar',
  HBAR: 'Hedera',
  ICP: 'Internet Computer',
  INJ: 'Injective',
  RUNE: 'Thorchain',
  AAVE: 'Aave',
  UNI: 'Uniswap',
  MKR: 'Maker',
  PEPE: 'Pepe',
  SHIB: 'Shiba Inu',
}

function decorate(info: SymbolInfo): SymbolInfo {
  return {
    ...info,
    icon: KNOWN_ICONS[info.base] ?? info.base.charAt(0),
    name: KNOWN_NAMES[info.base] ?? info.name,
  }
}

export const useSymbolsStore = defineStore('symbols', () => {
  const seed = SEED_SYMBOLS.map(decorate)
  const directory = shallowRef<SymbolInfo[]>(seed)
  const bySymbol = shallowRef<Record<string, SymbolInfo>>(
    Object.fromEntries(seed.map((s) => [s.symbol, s])),
  )
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const fetched = await binanceRest.fetchSymbols()
      const decorated = fetched.map(decorate)
      const seedMap = new Map(seed.map((s) => [s.symbol, s]))
      const merged: SymbolInfo[] = decorated.map(
        (s) => seedMap.get(s.symbol) ?? s,
      )
      directory.value = merged
      bySymbol.value = Object.fromEntries(merged.map((s) => [s.symbol, s]))
      loaded.value = true
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function ensureLoaded() {
    if (loaded.value || loading.value) return
    await load()
  }

  async function refresh() {
    if (loading.value) return
    await load()
  }

  function lookup(symbol: string): SymbolInfo {
    const sym = symbol.toUpperCase()
    const found = bySymbol.value[sym]
    if (found) return found
    let base = sym
    const QUOTES = ['USDT', 'USDC', 'BUSD', 'FDUSD', 'TUSD', 'DAI', 'BTC', 'ETH']
    for (const q of QUOTES) {
      if (sym.endsWith(q) && sym.length > q.length) {
        base = sym.slice(0, sym.length - q.length)
        return decorate({
          symbol: sym,
          base,
          quote: q,
          name: base,
          icon: base.charAt(0),
        })
      }
    }
    return decorate({ symbol: sym, base: sym, quote: '', name: sym, icon: sym.charAt(0) })
  }

  const all = computed(() => directory.value)

  return {
    directory,
    bySymbol,
    all,
    loading,
    loaded,
    error,
    ensureLoaded,
    refresh,
    lookup,
  }
})
