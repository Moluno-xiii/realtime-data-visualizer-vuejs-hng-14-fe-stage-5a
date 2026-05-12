import { ref, watch } from 'vue'

const KEY = 'tape:focus'
const focus = ref<string>(loadInitial())

function loadInitial(): string {
  if (typeof localStorage === 'undefined') return 'BTCUSDT'
  const saved = localStorage.getItem(KEY)
  return saved && /^[A-Z0-9]+$/.test(saved) ? saved : 'BTCUSDT'
}

watch(focus, (v) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, v)
})

export function useFocusedSymbol() {
  function setFocus(sym: string) {
    focus.value = sym.toUpperCase()
  }
  return { focus, setFocus }
}
