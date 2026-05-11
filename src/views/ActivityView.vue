<script setup lang="ts">
import ChartCard from '@/components/cards/ChartCard.vue'
import ActivityFeed from '@/components/feed/ActivityFeed.vue'
import { FIXTURE_ACTIVITY } from '@/mocks/fixtures'
</script>

<template>
  <div class="av">
    <header class="av__head">
      <span class="eyebrow">The Tape</span>
      <h1 class="display av__title">Activity, in order.</h1>
      <p class="av__sub">
        Every alert, signal, system event and notable trade — newest first.
        Filter by severity or search by symbol.
      </p>
    </header>
    <ChartCard title="Recent events" eyebrow="Live tape · synthetic">
      <div class="av__feed">
        <ActivityFeed :events="FIXTURE_ACTIVITY" />
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
@media (max-width: 960px) {
  .av {
    padding: var(--s-4);
  }
  .av__feed {
    height: 70vh;
  }
}
</style>
