<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import TickerTape from './TickerTape.vue'
import TopBar from './TopBar.vue'
import SideRail from './SideRail.vue'
import MobileDrawer from './MobileDrawer.vue'
import SymbolPicker from '@/components/overlays/SymbolPicker.vue'
import CommandPalette from '@/components/overlays/CommandPalette.vue'
import MarketSwitcher from '@/components/overlays/MarketSwitcher.vue'
import { useOverlays } from '@/composables/useOverlays'
import { useDensity } from '@/composables/useDensity'
import { useStream } from '@/composables/useStream'
import { useSymbolsStore } from '@/stores/symbolsStore'
import { useFocusedSymbol } from '@/composables/useFocusedSymbol'

const {
  symbolPicker,
  closeSymbolPicker,
  commandPalette,
  closeCommandPalette,
  marketSwitcher,
  closeMarketSwitcher,
} = useOverlays()
const { focus } = useFocusedSymbol()

useDensity()
useStream()
useSymbolsStore().ensureLoaded()

const utc = ref('')
let utcId: number | undefined
const fmt = () => {
  utc.value = new Date().toISOString().slice(11, 19)
}
onMounted(() => {
  fmt()
  utcId = window.setInterval(fmt, 1000)
})
onBeforeUnmount(() => {
  if (utcId) clearInterval(utcId)
})
</script>

<template>
  <div class="shell grid grid-rows-[auto_auto_1fr_auto] h-dvh min-h-dvh">
    <TickerTape />
    <TopBar />
    <div class="shell__body grid grid-cols-[var(--rail-w)_1fr] min-h-0 overflow-hidden">
      <SideRail />
      <main class="min-w-0 min-h-0 overflow-auto bg-bg relative">
        <RouterView />
      </main>
    </div>
    <MobileDrawer />
    <SymbolPicker :open="symbolPicker" @close="closeSymbolPicker" />
    <CommandPalette :open="commandPalette" @close="closeCommandPalette" />
    <MarketSwitcher
      :open="marketSwitcher"
      :current="focus"
      @close="closeMarketSwitcher"
    />
    <footer class="flex items-center justify-between h-7 px-5 border-t border-rule bg-bg">
      <div class="flex items-center gap-[10px]">
        <span class="eyebrow">TAPE //</span>
        <span class="text-xs text-ink-faint">Binance live feed</span>
      </div>
      <div class="flex items-center gap-[10px]">
        <span class="text-xs text-ink-faint font-mono">UTC {{ utc }}</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@media (max-width: 960px) {
  .shell__body {
    grid-template-columns: 1fr;
  }
}
</style>
