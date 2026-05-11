<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ChartCard from '@/components/cards/ChartCard.vue'
import CandlestickChart from '@/components/charts/CandlestickChart.vue'
import AnimatedNumber from '@/components/cards/AnimatedNumber.vue'
import Sparkline from '@/components/cards/Sparkline.vue'
import {
  buildTrades,
  FIXTURE_TICKERS,
  generateCandles,
  generateSeries,
  SYMBOLS,
} from '@/mocks/fixtures'
import { formatCompact, formatPct, formatPrice, formatTime } from '@/utils/format'

const route = useRoute()
const symbol = computed(() => String(route.params.symbol ?? 'BTCUSDT'))
const info = computed(
  () => SYMBOLS.find((s) => s.symbol === symbol.value) ?? SYMBOLS[0]!,
)
const ticker = computed(
  () =>
    FIXTURE_TICKERS.find((t) => t.symbol === symbol.value) ??
    FIXTURE_TICKERS[0]!,
)
const candles = computed(() => generateCandles(symbol.value, 144, 15 * 60_000))
const trades = computed(() => buildTrades(symbol.value, 40))
const spark = computed(() =>
  generateSeries(symbol.value, 60, 60_000).map((p) => p.v),
)
</script>

<template>
  <div class="md">
    <header class="md__head">
      <div class="md__title">
        <span class="eyebrow">Market</span>
        <h1 class="display md__name">
          <span class="md__icon">{{ info.icon }}</span>
          {{ info.base }}
          <span class="md__quote">/ {{ info.quote }}</span>
        </h1>
        <p class="md__sub">
          {{ info.name }} · Spot · Binance-style synthetic feed
        </p>
      </div>
      <div class="md__price">
        <div class="md__last">
          <span class="md__currency">$</span>
          <AnimatedNumber
            :value="ticker.price"
            :format="formatPrice"
            class="md__lastnum"
          />
        </div>
        <div class="md__delta">
          <span :class="ticker.changePct24h >= 0 ? 'up' : 'down'" class="mono">
            {{ formatPct(ticker.changePct24h) }}
          </span>
          <span class="md__delta-abs mono">
            {{ ticker.change24h >= 0 ? '+' : '−' }}${{
              Math.abs(ticker.change24h).toFixed(2)
            }}
          </span>
          <span class="eyebrow">24h</span>
        </div>
        <Sparkline :points="spark" :width="240" :height="42" class="md__spark" />
      </div>
    </header>

    <div class="md__stats">
      <div class="stat">
        <span class="eyebrow">24h High</span>
        <span class="stat__val mono">${{ formatPrice(ticker.high24h) }}</span>
      </div>
      <div class="stat">
        <span class="eyebrow">24h Low</span>
        <span class="stat__val mono">${{ formatPrice(ticker.low24h) }}</span>
      </div>
      <div class="stat">
        <span class="eyebrow">24h Vol</span>
        <span class="stat__val mono">${{ formatCompact(ticker.volume24h) }}</span>
      </div>
      <div class="stat">
        <span class="eyebrow">Last tick</span>
        <span class="stat__val mono">{{ formatTime(ticker.lastUpdate) }}</span>
      </div>
    </div>

    <div class="md__grid">
      <ChartCard
        title="Candlestick"
        eyebrow="15m interval · 36h window"
        class="md__chart"
      >
        <CandlestickChart :candles="candles" :height="420" />
      </ChartCard>

      <section class="md__book">
        <div class="md__book-head">
          <span class="eyebrow">Recent trades</span>
          <span class="mono muted-tone">{{ trades.length }} rows</span>
        </div>
        <hr class="rule" />
        <ul class="trades" role="list">
          <li
            v-for="t in trades"
            :key="t.id"
            class="trade"
            :data-side="t.side"
          >
            <span class="trade__time mono">{{ formatTime(t.time) }}</span>
            <span class="trade__price mono" :class="t.side === 'buy' ? 'up' : 'down'">
              {{ formatPrice(t.price) }}
            </span>
            <span class="trade__size mono">{{ t.size.toFixed(4) }}</span>
            <span class="trade__side">{{ t.side }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.md {
  display: flex;
  flex-direction: column;
  gap: var(--s-5);
  padding: var(--s-6);
  max-width: var(--maxw);
  margin: 0 auto;
}

.md__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: var(--s-6);
  padding-bottom: var(--s-4);
  border-bottom: 1px solid var(--rule);
}

.md__title {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.md__name {
  margin: 0;
  font-size: clamp(36px, 5.4vw, 56px);
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
}
.md__icon {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.7em;
}
.md__quote {
  color: var(--ink-faint);
  font-size: 0.6em;
  font-style: italic;
}
.md__sub {
  margin: 0;
  color: var(--ink-mute);
  font-size: var(--fs-sm);
}

.md__price {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}
.md__last {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  color: var(--ink);
}
.md__currency {
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: 18px;
}
.md__lastnum {
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 600;
}
.md__delta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-sm);
}
.md__delta-abs {
  color: var(--ink-mute);
}
.md__spark {
  margin-top: 6px;
}

.md__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
  border: 1px solid var(--rule);
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: var(--surface);
}
.stat__val {
  color: var(--ink);
  font-size: var(--fs-lg);
}

.md__grid {
  display: grid;
  grid-template-columns: minmax(0, 2.1fr) minmax(280px, 1fr);
  gap: var(--s-4);
}

.md__chart {
  min-width: 0;
}

.md__book {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  box-shadow: var(--shadow-lift);
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-height: 540px;
}
.md__book-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
}
.trades {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
  contain: content;
}
.trade {
  display: grid;
  grid-template-columns: 64px 1fr 1fr 44px;
  gap: 10px;
  align-items: center;
  padding: 5px 14px;
  font-size: var(--fs-xs);
  color: var(--ink-dim);
  border-top: 1px solid var(--rule);
}
.trade:first-child {
  border-top: 0;
}
.trade__time {
  color: var(--ink-faint);
}
.trade__price {
  font-size: var(--fs-sm);
}
.trade__size {
  text-align: right;
}
.trade__side {
  text-align: right;
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--ink-faint);
}
.trade[data-side='buy'] .trade__side {
  color: var(--up);
}
.trade[data-side='sell'] .trade__side {
  color: var(--down);
}

.muted-tone {
  color: var(--ink-mute);
}

@media (max-width: 960px) {
  .md {
    padding: var(--s-4);
  }
  .md__head {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }
  .md__price {
    align-items: flex-start;
  }
  .md__grid {
    grid-template-columns: 1fr;
  }
  .md__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
