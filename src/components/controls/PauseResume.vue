<script setup lang="ts">
defineProps<{ paused: boolean }>()
defineEmits<{ (e: 'update:paused', v: boolean): void }>()
</script>

<template>
  <button
    class="pr"
    type="button"
    :aria-pressed="paused"
    :aria-label="paused ? 'Resume stream' : 'Pause stream'"
    @click="$emit('update:paused', !paused)"
  >
    <span v-if="paused" class="pr__icon" aria-hidden="true">
      <svg width="10" height="10" viewBox="0 0 10 10">
        <path d="M1 1l8 4-8 4z" fill="currentColor" />
      </svg>
    </span>
    <span v-else class="pr__icon" aria-hidden="true">
      <svg width="10" height="10" viewBox="0 0 10 10">
        <rect x="1" y="1" width="3" height="8" fill="currentColor" />
        <rect x="6" y="1" width="3" height="8" fill="currentColor" />
      </svg>
    </span>
    <span class="pr__lab">{{ paused ? 'Resume' : 'Pause' }}</span>
  </button>
</template>

<style scoped>
.pr {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  background: var(--surface);
  color: var(--ink-dim);
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  transition:
    border-color var(--t-fast) var(--ease-out),
    color var(--t-fast) var(--ease-out);
}
.pr:hover {
  color: var(--ink);
  border-color: var(--border-hi);
}
.pr[aria-pressed='true'] {
  color: var(--warn);
  border-color: var(--warn);
  background: var(--warn-soft);
}
.pr__icon {
  display: inline-flex;
}
</style>
