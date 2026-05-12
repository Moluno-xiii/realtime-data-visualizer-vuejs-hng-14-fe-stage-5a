import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { streamService } from '@/services/stream/StreamService'
import { useDataSource } from './useDataSource'
import { useWatchlist } from './useWatchlist'
import { useFocusedSymbol } from './useFocusedSymbol'

export const ALWAYS_ON = ['BTCUSDT']

export function useStream() {
  const { symbols } = useWatchlist()
  const { mode } = useDataSource()
  const { focus } = useFocusedSymbol()

  const subscribed = computed(() => {
    const set = new Set<string>(ALWAYS_ON)
    for (const s of symbols.value) set.add(s)
    if (focus.value) set.add(focus.value)
    return [...set]
  })

  onMounted(() => {
    streamService.attach()
    streamService.ensureStarted(subscribed.value, mode.value)
  })

  onBeforeUnmount(() => {
    streamService.detachOnce()
  })

  watch(
    [subscribed, mode],
    ([nextSyms, nextMode]) => {
      if (!streamService.isActive()) return
      streamService.configure([...nextSyms], nextMode)
    },
    { deep: true },
  )
}
