<script setup lang="ts">
import { computed } from 'vue'
import type { ActivityEvent } from '@/types/market'
import { formatRelative, formatCompact } from '@/utils/format'

const props = defineProps<{ event: ActivityEvent; now: number }>()

const rel = computed(() => formatRelative(props.event.time, props.now))

const dotColor = computed(() => {
  switch (props.event.severity) {
    case 'info':
      return 'bg-info'
    case 'success':
      return 'bg-up'
    case 'warn':
      return 'bg-warn'
    case 'critical':
      return 'bg-down shadow-[0_0_8px_var(--down)]'
    default:
      return 'bg-ink-faint'
  }
})
</script>

<template>
  <li
    class="grid grid-cols-[8px_44px_64px_1fr_auto] items-center gap-[10px] px-[14px] py-2 border-t border-rule text-sm text-ink-dim transition-colors hover:bg-surface-hi hover:text-ink first:border-t-0"
  >
    <span class="w-[6px] h-[6px] rounded-full justify-self-center" :class="dotColor"></span>
    <span class="font-mono tabular-nums text-xs text-ink-mute">{{ rel }}</span>
    <span class="text-xs uppercase tracking-[0.08em] text-ink-faint">{{ event.kind }}</span>
    <span class="min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
      {{ event.title }}
      <span v-if="event.symbol" class="text-xs text-ink-mute font-mono">
        · {{ event.symbol.replace('USDT', '/USDT') }}
      </span>
    </span>
    <span
      v-if="event.value !== undefined"
      class="text-sm text-ink font-mono justify-self-end tabular-nums"
    >
      {{
        event.kind === 'trade'
          ? '$' + formatCompact(event.value)
          : event.value.toFixed(2)
      }}
    </span>
  </li>
</template>
