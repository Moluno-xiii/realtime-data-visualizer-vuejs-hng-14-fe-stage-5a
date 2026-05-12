<script setup lang="ts">
import Skeleton from '@/components/feedback/Skeleton.vue'
defineProps<{ label?: string }>()
</script>

<template>
  <article class="card">
    <header class="card__head">
      <span class="eyebrow">{{ label ?? 'Loading' }}</span>
      <Skeleton width="20" height="12" />
    </header>
    <div class="card__value">
      <Skeleton width="16" height="20" />
      <Skeleton width="120" height="30" />
    </div>
    <div class="card__meta">
      <Skeleton width="56" height="11" />
      <Skeleton width="40" height="11" />
      <span class="card__sep"></span>
      <Skeleton width="22" height="9" />
    </div>
    <div class="card__spark">
      <Skeleton block width="100%" height="44" />
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--s-4) var(--s-4) var(--s-3);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  box-shadow: var(--shadow-lift);
}
.card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card__value {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card__sep {
  width: 1px;
  height: 10px;
  background: var(--rule);
}
.card__spark {
  margin-top: 4px;
  width: 220px;
  align-self: flex-end;
  margin-right: -8px;
}
</style>
