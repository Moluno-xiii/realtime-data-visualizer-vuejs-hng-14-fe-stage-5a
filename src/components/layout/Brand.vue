<script setup lang="ts">
defineProps<{ subtle?: boolean }>()
</script>

<template>
  <RouterLink to="/" class="brand" :class="{ 'brand--subtle': subtle }">
    <span class="brand__mark" aria-hidden="true">
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
    <span class="brand__word">
      <span class="brand__name">TAPE</span>
      <span class="brand__slash" aria-hidden="true">//</span>
    </span>
  </RouterLink>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--ink);
  letter-spacing: var(--tracking-tight);
  user-select: none;
}

.brand__mark {
  color: var(--accent);
  display: inline-flex;
}

.brand__word {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}

.brand__name {
  font-family: var(--font-display);
  font-size: 24px;
  letter-spacing: -0.02em;
  line-height: 1;
  font-style: italic;
}

.brand__slash {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--accent);
  letter-spacing: 0;
}

.brand--subtle .brand__name {
  font-size: 18px;
}
</style>
