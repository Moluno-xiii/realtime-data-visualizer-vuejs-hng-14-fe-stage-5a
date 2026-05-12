<script setup lang="ts">
import TickerTape from './TickerTape.vue'
import TopBar from './TopBar.vue'
import SideRail from './SideRail.vue'
import MobileDrawer from './MobileDrawer.vue'
import SymbolPicker from '@/components/overlays/SymbolPicker.vue'
import CommandPalette from '@/components/overlays/CommandPalette.vue'
import { useOverlays } from '@/composables/useOverlays'
import { useDensity } from '@/composables/useDensity'
import { useStream } from '@/composables/useStream'
import { useSymbolsStore } from '@/stores/symbolsStore'

const {
  symbolPicker,
  closeSymbolPicker,
  commandPalette,
  closeCommandPalette,
} = useOverlays()

useDensity()
useStream()
useSymbolsStore().ensureLoaded()
</script>

<template>
  <div class="shell">
    <TickerTape />
    <TopBar />
    <div class="shell__body">
      <SideRail />
      <main class="shell__main">
        <RouterView />
      </main>
    </div>
    <MobileDrawer />
    <SymbolPicker :open="symbolPicker" @close="closeSymbolPicker" />
    <CommandPalette :open="commandPalette" @close="closeCommandPalette" />
    <footer class="shell__foot">
      <div class="shell__foot-left">
        <span class="eyebrow">TAPE //</span>
        <span class="muted">Binance live feed</span>
      </div>
      <div class="shell__foot-right">
        <span class="muted mono">UTC {{ utc }}</span>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
export default defineComponent({
  setup() {
    const utc = ref('')
    let id: number | undefined
    const fmt = () => {
      const d = new Date()
      utc.value = d.toISOString().slice(11, 19)
    }
    onMounted(() => {
      fmt()
      id = window.setInterval(fmt, 1000)
    })
    onBeforeUnmount(() => {
      if (id) clearInterval(id)
    })
    return { utc }
  },
})
</script>

<style scoped>
.shell {
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  height: 100dvh;
  min-height: 100dvh;
}

.shell__body {
  display: grid;
  grid-template-columns: var(--rail-w) 1fr;
  min-height: 0;
  overflow: hidden;
}

.shell__main {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  background: var(--bg);
  position: relative;
}

.shell__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px var(--s-5);
  border-top: 1px solid var(--rule);
  background: var(--bg);
  height: 28px;
}
.shell__foot-left,
.shell__foot-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.muted {
  color: var(--ink-faint);
  font-size: var(--fs-xs);
}

@media (max-width: 960px) {
  .shell__body {
    grid-template-columns: 1fr;
  }
}
</style>
