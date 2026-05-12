<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    body?: string
    cta?: string
    compact?: boolean
  }>(),
  {
    eyebrow: 'Watchlist',
    title: 'Nothing pinned yet',
    body: 'Add symbols to track their price, volume, and trades in real time.',
    cta: 'Manage watchlist',
    compact: false,
  },
)
defineEmits<{ (e: 'action'): void }>()
</script>

<template>
  <div class="es" :class="{ 'es--compact': compact }">
    <div class="es__rail" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
    <span class="eyebrow es__eyebrow">{{ eyebrow }}</span>
    <h3 class="es__title">{{ title }}</h3>
    <p class="es__body">{{ body }}</p>
    <button type="button" class="es__cta" @click="$emit('action')">
      {{ cta }}
      <span aria-hidden="true" class="es__arrow">→</span>
    </button>
  </div>
</template>

<style scoped>
.es {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 22px 18px;
  border: 1px dashed var(--border);
  border-radius: var(--r-1);
  background: var(--bg-elev);
  color: var(--ink-dim);
}

.es__rail {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}
.es__rail span {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--border-hi);
}
.es__rail span:nth-child(1) {
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent);
}

.es__eyebrow {
  color: var(--ink-mute);
}

.es__title {
  margin: 0;
  font-family: var(--font-tech, var(--font-mono));
  font-weight: 600;
  font-size: 18px;
  letter-spacing: -0.02em;
  color: var(--ink);
  text-transform: lowercase;
}

.es__body {
  margin: 0;
  max-width: 36ch;
  color: var(--ink-mute);
  font-size: var(--fs-sm);
  line-height: 1.5;
}

.es__cta {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 14px;
  background: var(--accent);
  color: var(--accent-ink);
  border-radius: var(--r-1);
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  font-weight: 600;
  transition: filter var(--t-fast) var(--ease-out);
}
.es__cta:hover {
  filter: brightness(1.06);
}
.es__cta:hover .es__arrow {
  transform: translateX(2px);
}
.es__arrow {
  font-family: var(--font-mono);
  transition: transform var(--t-fast) var(--ease-out);
}

.es--compact {
  padding: 14px 14px;
  gap: 6px;
}
.es--compact .es__title {
  font-size: 15px;
}
.es--compact .es__body {
  font-size: var(--fs-xs);
}
</style>
