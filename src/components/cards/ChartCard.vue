<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  eyebrow?: string
}>()
</script>

<template>
  <section class="flex flex-col bg-surface border border-border rounded-1 shadow-[var(--shadow-lift)] min-w-0 min-h-0 h-full overflow-hidden">
    <header class="flex items-start justify-between gap-3 px-4 py-3">
      <div class="flex flex-col gap-1 min-w-0">
        <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
        <h3 class="m-0 font-display italic text-[22px] font-normal tracking-[-0.01em] leading-[1.05] text-ink">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="m-0 text-xs text-ink-mute">{{ subtitle }}</p>
      </div>
      <div class="inline-flex items-center gap-2">
        <slot name="tools" />
      </div>
    </header>
    <hr class="rule" />
    <div class="cc-body px-4 pt-3 pb-4 min-w-0 min-h-0 flex-1 overflow-hidden flex flex-col">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="px-4 py-3 border-t border-rule">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.cc-body > * {
  min-height: 0;
}
</style>
