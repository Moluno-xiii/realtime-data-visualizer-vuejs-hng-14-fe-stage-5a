<script setup lang="ts">
import { computed } from 'vue'
import { FIXTURE_TICKERS, SYMBOLS } from '@/mocks/fixtures'
import { formatPrice, formatPct } from '@/utils/format'

const items = computed(() => {
  const bySym = new Map(SYMBOLS.map((s) => [s.symbol, s]))
  const arr = FIXTURE_TICKERS.map((t) => ({
    ...t,
    info: bySym.get(t.symbol)!,
  }))
  return [...arr, ...arr]
})
</script>

<template>
  <div class="tape" role="region" aria-label="Live ticker tape">
    <div class="tape__brand">
      <span class="dot dot--live" aria-hidden="true"></span>
      <span class="eyebrow">LIVE&nbsp;FEED</span>
    </div>
    <div class="tape__track" aria-hidden="false">
      <div class="tape__rail">
        <div v-for="(t, i) in items" :key="`${t.symbol}-${i}`" class="tape__item">
          <span class="tape__sym">{{ t.info.icon }} {{ t.info.base }}</span>
          <span class="tape__price mono">{{ formatPrice(t.price) }}</span>
          <span
            class="tape__chg mono"
            :class="t.changePct24h >= 0 ? 'up' : 'down'"
            >{{ formatPct(t.changePct24h) }}</span
          >
          <span class="tape__sep" aria-hidden="true">·</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tape {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  height: var(--tape-h);
  border-bottom: 1px solid var(--rule);
  background:
    linear-gradient(180deg, var(--bg-elev) 0%, var(--bg) 100%);
  position: relative;
  overflow: hidden;
  flex: 0 0 auto;
}

.tape__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 var(--s-4);
  height: 100%;
  border-right: 1px solid var(--rule);
  background: var(--bg);
  flex: 0 0 auto;
  z-index: 2;
}

.dot--live {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  animation: pulse-dot 1.6s ease-in-out infinite;
}

.tape__track {
  flex: 1;
  overflow: hidden;
  mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 32px,
    #000 calc(100% - 64px),
    transparent 100%
  );
}

.tape__rail {
  display: flex;
  align-items: center;
  width: max-content;
  height: 100%;
  animation: tape-scroll 90s linear infinite;
}

.tape__rail:hover {
  animation-play-state: paused;
}

.tape__item {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  padding: 0 14px;
  font-size: var(--fs-sm);
  color: var(--ink-dim);
  white-space: nowrap;
}

.tape__sym {
  font-weight: 600;
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--ink);
}

.tape__price {
  font-size: var(--fs-sm);
  color: var(--ink);
}

.tape__chg {
  font-size: var(--fs-xs);
}

.tape__sep {
  color: var(--ink-faint);
  margin-left: 4px;
}

@keyframes tape-scroll {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(-50%, 0, 0);
  }
}
</style>
