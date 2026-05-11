<script setup lang="ts">
import AnimatedNumber from './AnimatedNumber.vue'
import Sparkline from './Sparkline.vue'
import { formatPct } from '@/utils/format'

const props = defineProps<{
  label: string
  hint?: string
  value: number
  changePct?: number
  changeAbs?: number
  spark?: number[]
  format?: (n: number) => string
  unit?: string
}>()
</script>

<template>
  <article class="card">
    <header class="card__head">
      <span class="eyebrow">{{ props.label }}</span>
      <span v-if="props.hint" class="card__hint">{{ props.hint }}</span>
    </header>
    <div class="card__value">
      <span v-if="props.unit" class="card__unit">{{ props.unit }}</span>
      <AnimatedNumber
        :value="props.value"
        :format="props.format"
        class="card__num"
      />
    </div>
    <div class="card__meta">
      <span
        v-if="props.changePct !== undefined"
        class="card__chg mono"
        :class="props.changePct >= 0 ? 'up' : 'down'"
      >
        <span class="card__chg-arrow" aria-hidden="true">{{
          props.changePct >= 0 ? '▲' : '▼'
        }}</span>
        {{ formatPct(props.changePct) }}
      </span>
      <span v-if="props.changeAbs !== undefined" class="card__delta mono">
        {{ (props.changeAbs > 0 ? '+' : '') + props.changeAbs.toFixed(2) }}
      </span>
      <span class="card__sep" aria-hidden="true"></span>
      <span class="card__period">24h</span>
    </div>
    <div v-if="props.spark && props.spark.length" class="card__spark">
      <Sparkline :points="props.spark" :height="44" :width="220" />
    </div>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--s-4) var(--s-4) var(--s-3);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  box-shadow: var(--shadow-lift);
  overflow: hidden;
}
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, var(--accent-soft) 0%, transparent 32%);
  opacity: 0.4;
}

.card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card__hint {
  font-size: var(--fs-xs);
  color: var(--ink-faint);
  font-family: var(--font-mono);
}

.card__value {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.card__unit {
  font-size: var(--fs-lg);
  color: var(--ink-mute);
  font-family: var(--font-mono);
}
.card__num {
  font-size: var(--fs-3xl);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-xs);
  color: var(--ink-mute);
}
.card__chg {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: var(--fs-xs);
}
.card__chg-arrow {
  font-size: 9px;
}
.card__delta {
  color: var(--ink-mute);
  font-size: var(--fs-xs);
}
.card__sep {
  width: 1px;
  height: 10px;
  background: var(--rule);
}
.card__period {
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.card__spark {
  margin-top: 4px;
  margin-right: -8px;
  align-self: flex-end;
  width: 220px;
}
</style>
