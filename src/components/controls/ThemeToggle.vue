<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
const { theme, toggle } = useTheme()
</script>

<template>
  <button
    class="tt"
    type="button"
    :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
    @click="toggle"
  >
    <span class="tt__icon" aria-hidden="true">
      <svg v-if="theme === 'dark'" viewBox="0 0 16 16" width="14" height="14">
        <path
          d="M11 8.5A4.5 4.5 0 0 1 6.5 4c0-.7.16-1.36.44-1.95A6 6 0 1 0 13.95 9.06 4.5 4.5 0 0 1 11 8.5Z"
          fill="currentColor"
        />
      </svg>
      <svg v-else viewBox="0 0 16 16" width="14" height="14">
        <circle cx="8" cy="8" r="3" fill="currentColor" />
        <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6" />
          <path d="M3.3 3.3l1.1 1.1M11.6 11.6l1.1 1.1M3.3 12.7l1.1-1.1M11.6 4.4l1.1-1.1" />
        </g>
      </svg>
    </span>
  </button>
</template>

<style scoped>
.tt {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  background: var(--surface);
  color: var(--ink-dim);
  transition:
    color var(--t-fast) var(--ease-out),
    border-color var(--t-fast) var(--ease-out),
    background var(--t-fast) var(--ease-out);
}
.tt:hover {
  color: var(--ink);
  border-color: var(--border-hi);
  background: var(--surface-hi);
}
</style>
