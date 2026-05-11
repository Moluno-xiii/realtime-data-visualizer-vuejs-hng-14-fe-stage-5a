import { ref, watch } from 'vue'

export type DataSourceMode = 'synthetic' | 'live'

const KEY = 'tape:source'
const mode = ref<DataSourceMode>('synthetic')

if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem(KEY) as DataSourceMode | null
  if (saved === 'synthetic') mode.value = 'synthetic'
}

watch(mode, (m) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, m)
})

export function useDataSource() {
  const liveEnabled = false
  function set(m: DataSourceMode) {
    if (m === 'live' && !liveEnabled) return
    mode.value = m
  }
  return { mode, liveEnabled, set }
}
