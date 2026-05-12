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
  <div class="av">
    <header class="av__head">
      <span class="eyebrow">The Tape</span>
      <h1 class="display av__title">Activity, in order.</h1>
      <p class="av__sub">
        Every alert, signal, and notable trade for the markets you watch —
        newest first. Filter by severity or search by symbol.
      </p>
    </header>

    <EmptyState
      v-if="!symbols.length"
      eyebrow="Watchlist"
      title="No symbols to track"
      body="The tape mirrors your watchlist. Pin a market to start receiving trade prints, alerts, and signals."
      cta="Add symbols"
      class="av__empty"
      @action="openSymbolPicker"
    />
    <ChartCard v-else title="Recent events" eyebrow="Live tape">
      <div class="av__feed">
        <ActivityFeed :events="filtered" />
      </div>
    </ChartCard>
  </div>
</template>

<style scoped>
.av {
  display: flex;
  flex-direction: column;
  gap: var(--s-5);
  padding: var(--s-6);
  max-width: 1200px;
  margin: 0 auto;
}
.av__head {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}
.av__title {
  margin: 0;
  font-size: clamp(40px, 6vw, 64px);
}
.av__sub {
  margin: 0;
  color: var(--ink-dim);
  font-size: var(--fs-lg);
  max-width: 60ch;
}
.av__feed {
  height: 640px;
}
.av__empty {
  max-width: 540px;
}
@media (max-width: 960px) {
  .av {
    padding: var(--s-4);
  }
  .av__feed {
    height: 70vh;
  }
}
</style>
