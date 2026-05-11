import { computed, ref, watch } from 'vue'
import { SYMBOLS } from '@/mocks/fixtures'

const KEY = 'tape:watchlist'

function load(): string[] {
  if (typeof localStorage === 'undefined') return SYMBOLS.map((s) => s.symbol)
  const raw = localStorage.getItem(KEY)
  if (!raw) return SYMBOLS.map((s) => s.symbol)
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error()
    const valid = parsed.filter(
      (v): v is string =>
        typeof v === 'string' && SYMBOLS.some((s) => s.symbol === v),
    )
    return valid.length ? valid : SYMBOLS.map((s) => s.symbol)
  } catch {
    return SYMBOLS.map((s) => s.symbol)
  }
}

const list = ref<string[]>(load())

watch(
  list,
  (v) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(KEY, JSON.stringify(v))
    }
  },
  { deep: true },
)

export function useWatchlist() {
  const symbols = computed(() => list.value)
  const setSymbols = computed(() => new Set(list.value))
  function has(sym: string) {
    return setSymbols.value.has(sym)
  }
  function add(sym: string) {
    if (!has(sym)) list.value = [...list.value, sym]
  }
  function remove(sym: string) {
    if (list.value.length <= 1) return
    list.value = list.value.filter((s) => s !== sym)
  }
  function toggle(sym: string) {
    if (has(sym)) remove(sym)
    else add(sym)
  }
  function reset() {
    list.value = SYMBOLS.map((s) => s.symbol)
  }
  return { symbols, has, add, remove, toggle, reset }
}
