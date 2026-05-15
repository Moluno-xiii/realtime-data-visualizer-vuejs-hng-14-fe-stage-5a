<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import ChartCard from '@/components/cards/ChartCard.vue'
import ActivityFeed from '@/components/feed/ActivityFeed.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useActivityStore } from '@/stores/activityStore'
import { useWatchlist } from '@/composables/useWatchlist'
import { useOverlays } from '@/composables/useOverlays'

const activity = useActivityStore()
const { events } = storeToRefs(activity)
const { symbols } = useWatchlist()
const { openSymbolPicker } = useOverlays()

const watched = computed(() => new Set(symbols.value))
const filtered = computed(() =>
  events.value.filter((e) => !e.symbol || watched.value.has(e.symbol)),
)
</script>

<template>
  <div class="flex flex-col gap-5 p-6 max-w-[1200px] mx-auto max-md:p-4">
    <header class="flex flex-col gap-2">
      <span class="eyebrow">The Tape</span>
      <h1 class="display m-0 text-[clamp(40px,6vw,64px)]">Activity, in order.</h1>
      <p class="m-0 text-ink-dim text-lg max-w-[60ch]">
        Every alert, signal, and notable trade for the markets you watch,
        newest first. Filter by severity or search by symbol.
      </p>
    </header>

    <EmptyState
      v-if="!symbols.length"
      eyebrow="Watchlist"
      title="No symbols to track"
      body="The tape mirrors your watchlist. Pin a market to start receiving trade prints, alerts, and signals."
      cta="Add symbols"
      class="max-w-[540px]"
      @action="openSymbolPicker"
    />
    <ChartCard v-else title="Recent events" eyebrow="Live tape">
      <div class="h-[640px] max-md:h-[70vh]">
        <ActivityFeed :events="filtered" />
      </div>
    </ChartCard>
  </div>
</template>
