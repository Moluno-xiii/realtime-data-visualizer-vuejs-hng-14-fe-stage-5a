<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
const { theme, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="w-8 h-8 inline-flex items-center justify-center border border-border rounded-1 bg-surface text-ink-dim transition-colors hover:text-ink hover:border-border-hi hover:bg-surface-hi"
    :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
    @click="toggle"
  >
    <span aria-hidden="true">
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
