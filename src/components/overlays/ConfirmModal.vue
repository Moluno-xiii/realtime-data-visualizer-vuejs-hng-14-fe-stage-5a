<script setup lang="ts">
import Modal from './Modal.vue'

withDefaults(
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

function onCancel() {
  emit('cancel')
}
function onConfirm() {
  emit('confirm')
}
</script>

<template>
  <Modal :open="open" :label="title" @close="onCancel">
    <div class="cm">
      <header class="cm__head">
        <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
        <h2 class="cm__title" :data-variant="variant">{{ title }}</h2>
        <p v-if="body" class="cm__body">{{ body }}</p>
      </header>
      <footer class="cm__foot">
        <button type="button" class="cm__btn cm__btn--ghost" @click="onCancel">
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="cm__btn"
          :data-variant="variant"
          @click="onConfirm"
        >
          {{ confirmLabel }}
        </button>
      </footer>
    </div>
  </Modal>
</template>

<style scoped>
.cm {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.cm__head {
  padding: 22px 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cm__title {
  margin: 0;
  font-family: var(--font-tech, var(--font-mono));
  font-weight: 700;
  font-size: 22px;
  letter-spacing: -0.02em;
  color: var(--ink);
  text-transform: lowercase;
}
.cm__title[data-variant='danger'] {
  color: var(--down);
}
.cm__title[data-variant='success'] {
  color: var(--up);
}
.cm__body {
  margin: 6px 0 0;
  color: var(--ink-dim);
  font-size: var(--fs-md);
  line-height: 1.5;
  max-width: 50ch;
}

.cm__foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid var(--rule);
  background: var(--bg-elev);
}

.cm__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 16px;
  border-radius: var(--r-1);
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  font-weight: 600;
  border: 1px solid transparent;
  transition:
    filter var(--t-fast) var(--ease-out),
    background var(--t-fast) var(--ease-out),
    color var(--t-fast) var(--ease-out),
    border-color var(--t-fast) var(--ease-out);
}
.cm__btn--ghost {
  background: var(--surface);
  color: var(--ink-mute);
  border-color: var(--border);
}
.cm__btn--ghost:hover {
  color: var(--ink);
  border-color: var(--border-hi);
}
.cm__btn[data-variant='success'] {
  background: var(--up);
  color: #0b0a08;
  border-color: var(--up);
}
.cm__btn[data-variant='danger'] {
  background: var(--down);
  color: #0b0a08;
  border-color: var(--down);
}
.cm__btn[data-variant='neutral'] {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
}
.cm__btn[data-variant]:hover {
  filter: brightness(1.06);
}
</style>
