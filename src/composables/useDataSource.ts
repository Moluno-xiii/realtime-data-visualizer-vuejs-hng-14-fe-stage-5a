import { ref, watch } from 'vue'

export type DataSourceMode = 'synthetic' | 'live'

const KEY = 'tape:source'
const mode = ref<DataSourceMode>('live')

if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem(KEY) as DataSourceMode | null
  if (saved === 'live' || saved === 'synthetic') mode.value = saved
}

watch(mode, (m) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, m)
})

export function useDataSource() {
  const liveEnabled = true
  function set(m: DataSourceMode) {
    if (m === 'live' && !liveEnabled) return
    mode.value = m
  }
  return { mode, liveEnabled, set }
}
