<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    body?: string
    cta?: string
    compact?: boolean
  }>(),
  {
    eyebrow: 'Watchlist',
    title: 'Nothing pinned yet',
    body: 'Add symbols to track their price, volume, and trades in real time.',
    cta: 'Manage watchlist',
    compact: false,
  },
)
defineEmits<{ (e: 'action'): void }>()
</script>

<template>
  <div
    class="relative flex flex-col items-start border border-dashed border-border rounded-1 bg-bg-elev text-ink-dim"
    :class="compact ? 'p-[14px] gap-[6px]' : 'px-[18px] py-[22px] gap-2'"
  >
    <div class="flex gap-1 mb-1" aria-hidden="true">
      <span class="block w-[18px] h-[2px] bg-accent shadow-[0_0_6px_var(--accent)]"></span>
      <span class="block w-[18px] h-[2px] bg-border-hi"></span>
      <span class="block w-[18px] h-[2px] bg-border-hi"></span>
    </div>
    <span class="eyebrow text-ink-mute">{{ eyebrow }}</span>
    <h3
      class="m-0 font-tech font-semibold tracking-[-0.02em] text-ink lowercase"
      :class="compact ? 'text-[15px]' : 'text-[18px]'"
    >
      {{ title }}
    </h3>
    <p
      class="m-0 max-w-[36ch] text-ink-mute leading-[1.5]"
      :class="compact ? 'text-xs' : 'text-sm'"
    >
      {{ body }}
    </p>
    <button
      type="button"
      class="group mt-[6px] inline-flex items-center gap-2 h-[30px] px-[14px] bg-accent text-accent-ink rounded-1 text-xs uppercase tracking-[0.08em] font-semibold transition-[filter] hover:brightness-[1.06]"
      @click="$emit('action')"
    >
      {{ cta }}
      <span
        class="font-mono transition-transform group-hover:translate-x-[2px]"
        aria-hidden="true"
      >→</span>
    </button>
  </div>
</template>
