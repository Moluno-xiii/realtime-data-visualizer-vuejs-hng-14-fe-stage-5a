<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
const { theme, toggle } = useTheme()
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
        <button class="row__action" @click="toggle">
          <span class="mono">{{ theme.toUpperCase() }}</span>
          <span class="row__hint">Click to switch</span>
        </button>
      </div>
      <hr class="rule" />
      <div class="row">
        <div class="row__copy">
          <h3 class="row__title">Density</h3>
          <p class="row__desc">Compact density on desktop, comfortable on touch (coming in v0.2).</p>
        </div>
        <span class="chip">Comfortable</span>
      </div>
      <hr class="rule" />
      <div class="row">
        <div class="row__copy">
          <h3 class="row__title">Data source</h3>
          <p class="row__desc">Synthetic deterministic generator. Switches to Binance public WebSocket in v0.2.</p>
        </div>
        <span class="chip">Synthetic</span>
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
  max-width: 50ch;
}

.row__action {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  background: var(--surface-hi);
  color: var(--ink);
}
.row__action:hover {
  border-color: var(--accent);
}
.row__hint {
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--ink-mute);
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
</style>
