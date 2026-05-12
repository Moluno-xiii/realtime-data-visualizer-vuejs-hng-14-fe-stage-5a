<script setup lang="ts" generic="T extends string | number, O extends { value: T; label: string }">
import { computed, ref } from 'vue'

const props = defineProps<{
  options: readonly O[]
  modelValue: T
  label?: string
  ariaLabel?: string
  align?: 'left' | 'right'
  menuMinWidth?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: T): void }>()

const open = ref(false)
const selected = computed(
  () => props.options.find((o) => o.value === props.modelValue) ?? props.options[0],
)

function pick(v: T) {
  emit('update:modelValue', v)
  open.value = false
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="group inline-flex items-center gap-[10px] h-8 pl-[14px] pr-[12px] border border-border rounded-1 bg-surface text-ink text-xs uppercase tracking-[0.08em] transition-colors hover:border-border-hi focus-visible:outline-none focus-visible:border-accent"
      :class="open ? '!border-accent shadow-[0_0_0_1px_var(--accent-soft)]' : ''"
      :aria-expanded="open"
      :aria-label="ariaLabel ?? label"
      aria-haspopup="listbox"
      @click="open = !open"
      @blur="open = false"
    >
      <span
        v-if="label"
        class="text-ink-faint font-mono text-[10px] tracking-[0.18em] leading-none"
      >{{ label }}</span>
      <span v-if="label" class="w-px h-3 bg-border" aria-hidden="true"></span>
      <span class="flex items-center gap-[6px] font-semibold leading-none">
        <slot name="value" :option="selected">{{ selected?.label }}</slot>
      </span>
      <svg
        class="text-ink-mute transition-transform"
        :class="open ? 'rotate-180 text-accent' : 'group-hover:text-ink-dim'"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        aria-hidden="true"
      >
        <path
          d="M2 3.5L5 6.5L8 3.5"
          stroke="currentColor"
          stroke-width="1.3"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <ul
      v-if="open"
      class="absolute top-[calc(100%+6px)] z-30 list-none m-0 p-1 bg-surface border border-border-hi rounded-1 shadow-[var(--shadow-lift)] max-h-[300px] overflow-y-auto"
      :class="align === 'left' ? 'left-0' : 'right-0'"
      :style="{ minWidth: menuMinWidth ?? '180px' }"
      role="listbox"
    >
      <li v-for="o in options" :key="String(o.value)">
        <button
          type="button"
          role="option"
          class="select-option flex items-center justify-between gap-3 w-full px-2 py-[8px] text-ink-dim text-sm text-left rounded-[2px] transition-colors"
          :class="o.value === modelValue ? 'is-active' : ''"
          :aria-selected="o.value === modelValue"
          @mousedown.prevent="pick(o.value)"
        >
          <slot name="option" :option="o" :selected="o.value === modelValue">
            <span>{{ o.label }}</span>
          </slot>
          <span
            v-if="o.value === modelValue"
            class="text-accent text-[10px] font-mono"
            aria-hidden="true"
          >●</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.select-option {
  position: relative;
  isolation: isolate;
}
.select-option::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  background: var(--accent);
  border-radius: 2px;
  transform: scaleY(0);
  transform-origin: center;
  transition: transform 120ms ease;
}
.select-option:hover {
  background: var(--surface-hi);
  color: var(--ink);
}
.select-option:hover::before,
.select-option:focus-visible::before {
  transform: scaleY(1);
}
.select-option:focus-visible {
  outline: none;
  background: var(--surface-hi);
  color: var(--ink);
}
.select-option.is-active {
  background: var(--accent-soft);
  color: var(--ink);
}
.select-option.is-active::before {
  transform: scaleY(1);
}
.select-option.is-active:hover {
  background: var(--accent-wash, var(--accent-soft));
  filter: brightness(1.05);
}
</style>
