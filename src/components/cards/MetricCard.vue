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
  <article class="metric-card relative flex flex-col gap-[6px] px-4 pt-4 pb-3 bg-surface border border-border rounded-1 shadow-[var(--shadow-lift)] overflow-hidden">
    <header class="flex items-center justify-between">
      <span class="eyebrow">{{ props.label }}</span>
      <span v-if="props.hint" class="text-xs text-ink-faint font-mono">{{ props.hint }}</span>
    </header>
    <div class="flex items-baseline gap-[6px]">
      <span v-if="props.unit" class="text-lg text-ink-mute font-mono">{{ props.unit }}</span>
      <AnimatedNumber
        :value="props.value"
        :format="props.format"
        class="text-3xl font-semibold tracking-[-0.02em] text-ink"
      />
    </div>
    <div class="flex items-center gap-2 text-xs text-ink-mute">
      <span
        v-if="props.changePct !== undefined"
        class="inline-flex items-center gap-[3px] font-mono"
        :class="props.changePct >= 0 ? 'up' : 'down'"
      >
        <span class="text-[9px]" aria-hidden="true">{{ props.changePct >= 0 ? '▲' : '▼' }}</span>
        {{ formatPct(props.changePct) }}
      </span>
      <span v-if="props.changeAbs !== undefined" class="font-mono text-ink-mute text-xs">
        {{ (props.changeAbs > 0 ? '+' : '') + props.changeAbs.toFixed(2) }}
      </span>
      <span class="w-px h-[10px] bg-rule"></span>
      <span class="uppercase tracking-[0.18em]">24h</span>
    </div>
    <div v-if="props.spark && props.spark.length" class="mt-1 w-[220px] self-end -mr-2">
      <Sparkline :points="props.spark" :height="44" :width="220" />
    </div>
  </article>
</template>

<style scoped>
.metric-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, var(--accent-soft) 0%, transparent 32%);
  opacity: 0.4;
}
</style>
