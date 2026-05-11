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
  <div class="sv">
    <header class="sv__head">
      <span class="eyebrow">Settings</span>
      <h1 class="display sv__title">Tune the tape.</h1>
    </header>

    <section class="card">
      <div class="row">
        <div class="row__copy">
          <h3 class="row__title">Theme</h3>
          <p class="row__desc">Dark is the hero theme; light is for high-glare environments and pitch decks.</p>
        </div>
        <SegmentedControl
          :model-value="theme"
          :options="THEME_OPTS"
          aria-label="Theme"
          @update:model-value="(v) => v !== theme && toggleTheme()"
        />
      </div>
      <hr class="rule" />
      <div class="row">
        <div class="row__copy">
          <h3 class="row__title">Density</h3>
          <p class="row__desc">Comfortable on touch and presentations; compact for trader-terminal density on desktop.</p>
        </div>
        <SegmentedControl
          :model-value="density"
          :options="DENSITY_OPTS"
          aria-label="Density"
          @update:model-value="setDensity"
        />
      </div>
      <hr class="rule" />
      <div class="row">
        <div class="row__copy">
          <h3 class="row__title">Data source</h3>
          <p class="row__desc">
            Synthetic feeds run a deterministic price generator on-device.
            Live mode connects to Binance public WebSocket — ships in v0.2.
          </p>
        </div>
        <div class="row__group">
          <button
            type="button"
            class="src"
            :class="{ 'src--on': dataMode === 'synthetic' }"
            @click="setData('synthetic')"
          >Synthetic</button>
          <button
            type="button"
            class="src"
            :class="{ 'src--on': dataMode === 'live' }"
            :disabled="!liveEnabled"
            :title="liveEnabled ? '' : 'Disabled — ships in v0.2'"
            @click="setData('live')"
          >Live<span v-if="!liveEnabled" class="src__soon">soon</span></button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="row">
        <div class="row__copy">
          <h3 class="row__title">Watchlist</h3>
          <p class="row__desc">
            {{ symbols.length }} symbol{{ symbols.length === 1 ? '' : 's' }} streaming. Open the picker to add or remove.
          </p>
        </div>
        <div class="row__group">
          <button class="ghost" type="button" @click="resetWatchlist">Reset</button>
          <button class="primary" type="button" @click="openSymbolPicker">Manage</button>
        </div>
      </div>
    </section>

    <section class="about">
      <h3 class="about__title">About TAPE</h3>
      <p>
        <strong>TAPE</strong> is a live markets terminal — built for the trader
        who wants the speed and clarity of a desk setup, on a single screen.
        Every metric, chart, and feed updates in real time, optimized so the
        browser doesn't break a sweat.
      </p>
      <p class="about__sig">
        v0.1 · built with Vue 3, ECharts, and a lot of mono numerics.
      </p>
    </section>
  </div>
</template>

<style scoped>
.sv {
  display: flex;
  flex-direction: column;
  gap: var(--s-6);
  padding: var(--s-6);
  max-width: 880px;
  margin: 0 auto;
}
.sv__title {
  margin: 0;
  font-size: clamp(40px, 6vw, 64px);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  box-shadow: var(--shadow-lift);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-4);
  padding: var(--s-4) var(--s-5);
}
.row__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.row__title {
  margin: 0;
  font-size: var(--fs-lg);
  color: var(--ink);
  letter-spacing: -0.01em;
}
.row__desc {
  margin: 0;
  color: var(--ink-mute);
  font-size: var(--fs-sm);
  max-width: 56ch;
}

.row__group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.src {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--ink-mute);
  background: var(--surface);
}
.src:hover:not(:disabled) {
  color: var(--ink);
  border-color: var(--border-hi);
}
.src--on {
  color: var(--ink);
  border-color: var(--accent);
  background: var(--accent-soft);
}
.src:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.src__soon {
  font-family: var(--font-mono);
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 999px;
  background: var(--warn-soft);
  color: var(--warn);
  letter-spacing: 0;
  text-transform: none;
}

.ghost,
.primary {
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
}
.ghost {
  color: var(--ink-mute);
  background: var(--surface);
}
.ghost:hover {
  color: var(--ink);
  border-color: var(--border-hi);
}
.primary {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
  font-weight: 600;
}
.primary:hover {
  filter: brightness(1.05);
}

.about {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding: var(--s-5);
  border: 1px dashed var(--border);
  border-radius: var(--r-1);
  color: var(--ink-dim);
  font-size: var(--fs-md);
  line-height: 1.6;
}
.about__title {
  margin: 0;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 24px;
  color: var(--ink);
}
.about p {
  margin: 0;
}
.about__sig {
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--ink-faint);
}

@media (max-width: 640px) {
  .row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
