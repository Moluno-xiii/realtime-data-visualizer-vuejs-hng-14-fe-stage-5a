<script setup lang="ts">
defineProps<{ subtle?: boolean }>()
</script>

<template>
  <RouterLink
    to="/"
    class="inline-flex items-center gap-[10px] text-ink select-none"
  >
    <span class="text-accent inline-flex" aria-hidden="true">
      <svg viewBox="0 0 32 32" width="22" height="22">
        <rect x="0" y="0" width="32" height="32" rx="4" fill="transparent" />
        <path
          d="M5 10h22M16 10v17"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="square"
        />
        <circle cx="24" cy="22" r="2" fill="currentColor" />
      </svg>
    </span>
    <span class="inline-flex items-baseline gap-1">
      <span
        class="font-display italic leading-none tracking-[-0.02em]"
        :class="subtle ? 'text-[18px]' : 'text-[24px]'"
      >TAPE</span>
      <span class="font-mono text-[13px] text-accent" aria-hidden="true">//</span>
    </span>
  </RouterLink>
</template>
