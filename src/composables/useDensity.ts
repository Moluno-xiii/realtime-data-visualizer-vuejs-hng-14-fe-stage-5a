import { onMounted, ref, watch } from 'vue'

export type Density = 'comfortable' | 'compact'

const KEY = 'tape:density'
const density = ref<Density>('comfortable')

function apply(d: Density) {
  document.documentElement.setAttribute('data-density', d)
}

export function useDensity() {
  onMounted(() => {
    const saved = localStorage.getItem(KEY) as Density | null
    if (saved === 'comfortable' || saved === 'compact') density.value = saved
    apply(density.value)
  })

  watch(density, (d) => {
    apply(d)
    localStorage.setItem(KEY, d)
  })

  function set(d: Density) {
    density.value = d
  }
  function toggle() {
    density.value = density.value === 'comfortable' ? 'compact' : 'comfortable'
  }

  return { density, set, toggle }
}
