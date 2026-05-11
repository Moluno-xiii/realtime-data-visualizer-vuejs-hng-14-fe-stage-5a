<script setup lang="ts" generic="T extends string | number">
defineProps<{
  options: { value: T; label: string }[]
  modelValue: T
  ariaLabel?: string
}>()
defineEmits<{ (e: 'update:modelValue', v: T): void }>()
</script>

<template>
  <div class="seg" :aria-label="ariaLabel" role="tablist">
    <button
      v-for="o in options"
      :key="String(o.value)"
      type="button"
      role="tab"
      :aria-selected="o.value === modelValue"
      class="seg__btn"
      :class="{ 'seg__btn--active': o.value === modelValue }"
      @click="$emit('update:modelValue', o.value)"
    >
      {{ o.label }}
    </button>
  </div>
</template>

<style scoped>
.seg {
  display: inline-flex;
  align-items: stretch;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  background: var(--surface);
  padding: 2px;
  gap: 2px;
}
.seg__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  height: 100%;
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--ink-mute);
  border-radius: 2px;
  transition:
    color var(--t-fast) var(--ease-out),
    background var(--t-fast) var(--ease-out);
}
.seg__btn:hover {
  color: var(--ink);
}
.seg__btn--active {
  background: var(--surface-hi);
  color: var(--ink);
  box-shadow: inset 0 -1px 0 var(--accent);
}
</style>
