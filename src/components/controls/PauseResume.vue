<script setup lang="ts">
defineProps<{ paused: boolean }>()
defineEmits<{ (e: 'update:paused', v: boolean): void }>()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 h-7 px-[10px] border border-border rounded-1 bg-surface text-ink-dim text-xs uppercase tracking-[0.08em] transition-colors hover:text-ink hover:border-border-hi aria-pressed:text-warn aria-pressed:border-warn aria-pressed:bg-warn-soft"
    :aria-pressed="paused"
    :aria-label="paused ? 'Resume stream' : 'Pause stream'"
    @click="$emit('update:paused', !paused)"
  >
    <span aria-hidden="true" class="inline-flex">
      <svg v-if="paused" width="10" height="10" viewBox="0 0 10 10">
        <path d="M1 1l8 4-8 4z" fill="currentColor" />
      </svg>
      <svg v-else width="10" height="10" viewBox="0 0 10 10">
        <rect x="1" y="1" width="3" height="8" fill="currentColor" />
        <rect x="6" y="1" width="3" height="8" fill="currentColor" />
      </svg>
    </span>
    <span>{{ paused ? 'Resume' : 'Pause' }}</span>
  </button>
</template>
