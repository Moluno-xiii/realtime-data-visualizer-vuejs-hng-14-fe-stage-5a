<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { SYMBOLS } from '@/mocks/fixtures'
import { formatPrice, formatPct } from '@/utils/format'
import { useMarketStore } from '@/stores/marketStore'

const market = useMarketStore()
const { tickers } = storeToRefs(market)

const items = computed(() => {
  const bySym = new Map(SYMBOLS.map((s) => [s.symbol, s]))
  const list = SYMBOLS.map((s) => {
    const ticker = tickers.value[s.symbol]
    if (!ticker) return null
    return { ...ticker, info: bySym.get(s.symbol)! }
  }).filter((r): r is NonNullable<typeof r> => r !== null)
  return [...list, ...list]
})
</script>

<template>
  <div
    class="flex items-center gap-4 h-[var(--tape-h)] border-b border-rule bg-gradient-to-b from-bg-elev to-bg relative overflow-hidden flex-none"
    role="region"
    aria-label="Live ticker tape"
  >
    <div
      class="flex items-center gap-2 px-4 h-full border-r border-rule bg-bg flex-none z-[2]"
    >
      <span
        class="w-2 h-2 rounded-full bg-accent text-accent shadow-[0_0_8px_var(--accent)] animate-pulse-dot"
        aria-hidden="true"
      ></span>
      <span class="eyebrow">LIVE&nbsp;FEED</span>
    </div>
    <div class="tape-track flex-1 overflow-hidden">
      <div class="tape-rail flex items-center w-max h-full hover:[animation-play-state:paused]">
        <div
          v-for="(t, i) in items"
          :key="`${t.symbol}-${i}`"
          class="inline-flex items-baseline gap-[10px] px-[14px] text-sm text-ink-dim whitespace-nowrap"
        >
          <span class="font-semibold uppercase tracking-[0.08em] text-ink">
            {{ t.info.icon }} {{ t.info.base }}
          </span>
          <span class="text-sm text-ink font-mono">{{ formatPrice(t.price) }}</span>
          <span
            class="text-xs font-mono"
            :class="t.changePct24h >= 0 ? 'up' : 'down'"
          >{{ formatPct(t.changePct24h) }}</span>
          <span class="text-ink-faint ml-1" aria-hidden="true">·</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tape-track {
  mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 32px,
    #000 calc(100% - 64px),
    transparent 100%
  );
}
.tape-rail {
  animation: tape-scroll 90s linear infinite;
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
