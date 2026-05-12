<script setup lang="ts">
import { computed } from 'vue'
import Modal from './Modal.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    body?: string
    eyebrow?: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'success' | 'danger' | 'neutral'
  }>(),
  {
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'neutral',
  },
)
const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const titleClass = computed(() => {
  if (props.variant === 'danger') return 'text-down'
  if (props.variant === 'success') return 'text-up'
  return 'text-ink'
})
const confirmClass = computed(() => {
  if (props.variant === 'danger') return 'bg-down text-[#0b0a08] border-down'
  if (props.variant === 'success') return 'bg-up text-[#0b0a08] border-up'
  return 'bg-accent text-accent-ink border-accent'
})
</script>

<template>
  <Modal :open="open" :label="title" @close="emit('cancel')">
    <div class="flex flex-col min-h-0">
      <header class="px-[22px] pt-[22px] pb-[18px] flex flex-col gap-[6px]">
        <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
        <h2
          class="m-0 font-tech font-bold text-[22px] tracking-[-0.02em] lowercase"
          :class="titleClass"
        >{{ title }}</h2>
        <p
          v-if="body"
          class="mt-[6px] m-0 text-ink-dim text-md leading-[1.5] max-w-[50ch]"
        >{{ body }}</p>
      </header>
      <footer
        class="flex justify-end gap-2 px-[18px] py-[14px] border-t border-rule bg-bg-elev"
      >
        <button
          type="button"
          class="inline-flex items-center h-[34px] px-4 rounded-1 text-xs uppercase tracking-[0.08em] font-semibold border border-border bg-surface text-ink-mute transition-colors hover:text-ink hover:border-border-hi"
          @click="emit('cancel')"
        >{{ cancelLabel }}</button>
        <button
          type="button"
          class="inline-flex items-center h-[34px] px-4 rounded-1 text-xs uppercase tracking-[0.08em] font-semibold border transition-[filter] hover:brightness-[1.06]"
          :class="confirmClass"
          @click="emit('confirm')"
        >{{ confirmLabel }}</button>
      </footer>
    </div>
  </Modal>
</template>
