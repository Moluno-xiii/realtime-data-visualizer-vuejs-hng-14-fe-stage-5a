<script setup lang="ts">
import { useTheme, type ThemeMode } from '@/composables/useTheme'
import { useDensity, type Density } from '@/composables/useDensity'
import { useDataSource } from '@/composables/useDataSource'
import { useWatchlist } from '@/composables/useWatchlist'
import { useOverlays } from '@/composables/useOverlays'
import SegmentedControl from '@/components/controls/SegmentedControl.vue'

const { theme, toggle: toggleTheme } = useTheme()
const { density, set: setDensity } = useDensity()
const { mode: dataMode, liveEnabled, set: setData } = useDataSource()
const { symbols, reset: resetWatchlist } = useWatchlist()
const { openSymbolPicker } = useOverlays()

const THEME_OPTS: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
]

const DENSITY_OPTS: { value: Density; label: string }[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
]
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-[880px] mx-auto">
    <header class="flex flex-col gap-2">
      <span class="eyebrow">Settings</span>
      <h1 class="display m-0 text-[clamp(40px,6vw,64px)]">Tune the tape.</h1>
    </header>

    <section class="bg-surface border border-border rounded-1 shadow-[var(--shadow-lift)]">
      <div class="settings-row flex items-center justify-between gap-4 px-5 py-4">
        <div class="flex flex-col gap-1 min-w-0">
          <h3 class="m-0 text-lg text-ink tracking-[-0.01em]">Theme</h3>
          <p class="m-0 text-ink-mute text-sm max-w-[56ch]">
            Dark is the hero theme; light is for high-glare environments and pitch decks.
          </p>
        </div>
        <SegmentedControl
          :model-value="theme"
          :options="THEME_OPTS"
          aria-label="Theme"
          @update:model-value="(v) => v !== theme && toggleTheme()"
        />
      </div>
      <hr class="rule" />
      <div class="settings-row flex items-center justify-between gap-4 px-5 py-4">
        <div class="flex flex-col gap-1 min-w-0">
          <h3 class="m-0 text-lg text-ink tracking-[-0.01em]">Density</h3>
          <p class="m-0 text-ink-mute text-sm max-w-[56ch]">
            Comfortable on touch and presentations; compact for trader-terminal density on desktop.
          </p>
        </div>
        <SegmentedControl
          :model-value="density"
          :options="DENSITY_OPTS"
          aria-label="Density"
          @update:model-value="setDensity"
        />
      </div>
      <hr class="rule" />
      <div class="settings-row flex items-center justify-between gap-4 px-5 py-4">
        <div class="flex flex-col gap-1 min-w-0">
          <h3 class="m-0 text-lg text-ink tracking-[-0.01em]">Data source</h3>
          <p class="m-0 text-ink-mute text-sm max-w-[56ch]">
            Synthetic feeds run a deterministic price generator on-device.
            Live mode connects to Binance public WebSocket.
          </p>
        </div>
        <div class="inline-flex items-center gap-[6px]">
          <button
            type="button"
            class="inline-flex items-center gap-[6px] h-7 px-3 border border-border rounded-1 text-xs uppercase tracking-[0.08em] text-ink-mute bg-surface transition-colors hover:text-ink hover:border-border-hi"
            :class="dataMode === 'synthetic' ? '!text-ink !border-accent !bg-accent-soft' : ''"
            @click="setData('synthetic')"
          >Synthetic</button>
          <button
            type="button"
            class="inline-flex items-center gap-[6px] h-7 px-3 border border-border rounded-1 text-xs uppercase tracking-[0.08em] text-ink-mute bg-surface transition-colors hover:text-ink hover:border-border-hi disabled:opacity-55 disabled:cursor-not-allowed"
            :class="dataMode === 'live' ? '!text-ink !border-accent !bg-accent-soft' : ''"
            :disabled="!liveEnabled"
            :title="liveEnabled ? '' : 'Disabled — ships in v0.2'"
            @click="setData('live')"
          >
            Live
            <span
              v-if="!liveEnabled"
              class="font-mono text-[9px] px-[5px] py-[1px] rounded-pill bg-warn-soft text-warn tracking-normal normal-case"
            >soon</span>
          </button>
        </div>
      </div>
    </section>

    <section class="bg-surface border border-border rounded-1 shadow-[var(--shadow-lift)]">
      <div class="settings-row flex items-center justify-between gap-4 px-5 py-4">
        <div class="flex flex-col gap-1 min-w-0">
          <h3 class="m-0 text-lg text-ink tracking-[-0.01em]">Watchlist</h3>
          <p class="m-0 text-ink-mute text-sm max-w-[56ch]">
            {{ symbols.length }} symbol{{ symbols.length === 1 ? '' : 's' }} streaming. Open the picker to add or remove.
          </p>
        </div>
        <div class="inline-flex items-center gap-[6px]">
          <button
            type="button"
            class="h-[30px] px-3 border border-border rounded-1 text-xs uppercase tracking-[0.08em] text-ink-mute bg-surface hover:text-ink hover:border-border-hi"
            @click="resetWatchlist"
          >Reset</button>
          <button
            type="button"
            class="h-[30px] px-3 border border-accent rounded-1 text-xs uppercase tracking-[0.08em] font-semibold bg-accent text-accent-ink hover:brightness-[1.05]"
            @click="openSymbolPicker"
          >Manage</button>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-3 p-5 border border-dashed border-border rounded-1 text-ink-dim text-md leading-[1.6]">
      <h3 class="m-0 font-display italic text-2xl text-ink">About TAPE</h3>
      <p class="m-0">
        <strong>TAPE</strong> is a live markets terminal — built for the trader
        who wants the speed and clarity of a desk setup, on a single screen.
        Every metric, chart, and feed updates in real time, optimized so the
        browser doesn't break a sweat.
      </p>
      <p class="m-0 text-xs uppercase tracking-[0.08em] text-ink-faint">
        v0.1 · built with Vue 3, ECharts, and a lot of mono numerics.
      </p>
    </section>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  .settings-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
