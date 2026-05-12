<script setup lang="ts">
import Skeleton from '@/components/feedback/Skeleton.vue'
defineProps<{ label?: string }>()
</script>

<template>
  <article class="flex flex-col gap-[6px] px-4 pt-4 pb-3 bg-surface border border-border rounded-1 shadow-[var(--shadow-lift)]">
    <header class="flex items-center justify-between">
      <span class="eyebrow">{{ label ?? 'Loading' }}</span>
      <Skeleton width="20" height="12" />
    </header>
    <div class="flex items-baseline gap-[6px]">
      <Skeleton width="16" height="20" />
      <Skeleton width="120" height="30" />
    </div>
    <div class="flex items-center gap-2">
      <Skeleton width="56" height="11" />
      <Skeleton width="40" height="11" />
      <span class="w-px h-[10px] bg-rule"></span>
      <Skeleton width="22" height="9" />
    </div>
    <div class="mt-1 w-[220px] self-end -mr-2">
      <Skeleton block width="100%" height="44" />
    </div>
  </article>
</template>
