import { onMounted, ref, watch } from 'vue'

export type ThemeMode = 'dark' | 'light'

const STORAGE_KEY = 'tape:theme'
const theme = ref<ThemeMode>('dark')

function apply(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', mode === 'dark' ? '#0b0a08' : '#f3efe6')
}

export function useTheme() {
  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    if (saved === 'dark' || saved === 'light') theme.value = saved
    apply(theme.value)
  })

  watch(theme, (m) => {
    apply(m)
    localStorage.setItem(STORAGE_KEY, m)
  })

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggle }
}
