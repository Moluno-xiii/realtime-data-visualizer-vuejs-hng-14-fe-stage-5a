<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  open: boolean
  label: string
}>()
const emit = defineEmits<{ (e: 'close'): void }>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (v) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = v ? 'hidden' : ''
    if (v) document.addEventListener('keydown', onKey)
    else document.removeEventListener('keydown', onKey)
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="backdrop"
        role="presentation"
        @click="emit('close')"
      ></div>
    </Transition>
    <Transition name="rise">
      <div
        v-if="open"
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        @click.stop
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  z-index: 200;
}
.modal {
  position: fixed;
  top: 12vh;
  left: 50%;
  transform: translateX(-50%);
  width: min(640px, 92vw);
  max-height: 76vh;
  background: var(--surface);
  border: 1px solid var(--border-hi);
  border-radius: var(--r-1);
  z-index: 210;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 30px 80px -20px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.02) inset;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 180ms var(--ease-out);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.rise-enter-active,
.rise-leave-active {
  transition:
    opacity 220ms var(--ease-out),
    transform 220ms var(--ease-out);
}
.rise-enter-from,
.rise-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}

@media (max-width: 560px) {
  .modal {
    top: 6vh;
    width: 96vw;
    max-height: 88vh;
  }
}
</style>
