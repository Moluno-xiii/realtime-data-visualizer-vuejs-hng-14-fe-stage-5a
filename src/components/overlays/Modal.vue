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
        class="fixed inset-0 z-[200] bg-black/55 backdrop-blur-[3px]"
        role="presentation"
        @click="emit('close')"
      ></div>
    </Transition>
    <Transition name="rise">
      <div
        v-if="open"
        class="modal fixed left-1/2 top-[12vh] z-[210] w-[min(640px,92vw)] max-h-[76vh] -translate-x-1/2 bg-surface border border-border-hi rounded-1 flex flex-col overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.02)_inset]"
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
