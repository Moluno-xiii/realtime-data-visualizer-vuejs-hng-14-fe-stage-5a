<script setup lang="ts">
import { computed } from 'vue'
import type { ActivityEvent } from '@/types/market'
import { formatRelative, formatCompact } from '@/utils/format'

const props = defineProps<{ event: ActivityEvent; now: number }>()

const rel = computed(() => formatRelative(props.event.time, props.now))
</script>

<template>
  <li class="row" :data-severity="event.severity">
    <span class="row__sev" aria-hidden="true"></span>
    <span class="row__time mono">{{ rel }}</span>
    <span class="row__kind">{{ event.kind }}</span>
    <span class="row__title">
      {{ event.title }}
      <span v-if="event.symbol" class="row__sym mono">· {{ event.symbol.replace('USDT', '/USDT') }}</span>
    </span>
    <span v-if="event.value !== undefined" class="row__value mono">
      {{ event.kind === 'trade' ? '$' + formatCompact(event.value) : event.value.toFixed(2) }}
    </span>
  </li>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: 8px 44px 64px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-top: 1px solid var(--rule);
  font-size: var(--fs-sm);
  color: var(--ink-dim);
  transition: background var(--t-fast) var(--ease-out);
}
.row:hover {
  background: var(--surface-hi);
  color: var(--ink);
}
.row:first-child {
  border-top: 0;
}

.row__sev {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ink-faint);
  justify-self: center;
}
.row[data-severity='info'] .row__sev {
  background: var(--info);
}
.row[data-severity='success'] .row__sev {
  background: var(--up);
}
.row[data-severity='warn'] .row__sev {
  background: var(--warn);
}
.row[data-severity='critical'] .row__sev {
  background: var(--down);
  box-shadow: 0 0 8px var(--down);
}

.row__time {
  color: var(--ink-mute);
  font-size: var(--fs-xs);
}

.row__kind {
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--ink-faint);
}

.row__title {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row__sym {
  color: var(--ink-mute);
  font-size: var(--fs-xs);
}

.row__value {
  color: var(--ink);
  font-size: var(--fs-sm);
  justify-self: end;
}
</style>
