import { ref, watch } from 'vue'

const KEY = 'tape:recent'
const CAP = 6

function load(): string[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((v): v is string => typeof v === 'string')
      .slice(0, CAP)
  } catch {
    return []
  }
}

const list = ref<string[]>(load())

watch(
  list,
  (v) => {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(KEY, JSON.stringify(v))
    } catch {
      /* quota or disabled */
    }
  },
  { deep: true },
)

export function useRecentSymbols() {
  function track(sym: string) {
    if (!sym) return
    const upper = sym.toUpperCase()
    const next = [upper, ...list.value.filter((s) => s !== upper)]
    if (next.length > CAP) next.length = CAP
    list.value = next
  }
  function clear() {
    list.value = []
  }
  return { recent: list, track, clear }
}
