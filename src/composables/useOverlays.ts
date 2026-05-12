import { ref } from 'vue'

const symbolPicker = ref(false)
const commandPalette = ref(false)
const marketSwitcher = ref(false)

export function useOverlays() {
  function openSymbolPicker() {
    symbolPicker.value = true
  }
  function closeSymbolPicker() {
    symbolPicker.value = false
  }
  function openCommandPalette() {
    commandPalette.value = true
  }
  function closeCommandPalette() {
    commandPalette.value = false
  }
  function toggleCommandPalette() {
    commandPalette.value = !commandPalette.value
  }
  function openMarketSwitcher() {
    marketSwitcher.value = true
  }
  function closeMarketSwitcher() {
    marketSwitcher.value = false
  }
  return {
    symbolPicker,
    commandPalette,
    marketSwitcher,
    openSymbolPicker,
    closeSymbolPicker,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette,
    openMarketSwitcher,
    closeMarketSwitcher,
  }
}
