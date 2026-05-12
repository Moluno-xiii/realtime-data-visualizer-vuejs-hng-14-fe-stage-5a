<script setup lang="ts" generic="T extends string | number">
defineProps<{
  options: { value: T; label: string }[]
  modelValue: T
  ariaLabel?: string
}>()
defineEmits<{ (e: 'update:modelValue', v: T): void }>()
</script>

<template>
  <div
    class="inline-flex items-stretch h-7 border border-border rounded-1 bg-surface p-[2px] gap-[2px]"
    :aria-label="ariaLabel"
    role="tablist"
  >
    <button
      v-for="o in options"
      :key="String(o.value)"
      type="button"
      role="tab"
      :aria-selected="o.value === modelValue"
      class="inline-flex items-center justify-center px-[10px] h-full text-xs uppercase tracking-[0.08em] text-ink-mute rounded-[2px] transition-colors hover:text-ink"
      :class="
        o.value === modelValue
          ? 'bg-surface-hi text-ink shadow-[inset_0_-1px_0_var(--accent)]'
          : ''
      "
      @click="$emit('update:modelValue', o.value)"
    >
      {{ o.label }}
    </button>
  </div>
</template>
