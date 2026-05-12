<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string | number
    height?: string | number
    radius?: string
    block?: boolean
  }>(),
  { radius: '2px', block: false },
)

function dim(v: string | number | undefined): string | undefined {
  if (v === undefined) return undefined
  return typeof v === 'number' ? `${v}px` : v
}
</script>

<template>
  <span
    class="sk"
    :class="{ 'sk--block': block }"
    :style="{
      width: dim(width),
      height: dim(height),
      borderRadius: radius,
    }"
    aria-hidden="true"
  ></span>
</template>

<style scoped>
.sk {
  display: inline-block;
  background: linear-gradient(
    90deg,
    var(--surface-hi) 0%,
    var(--surface-2) 50%,
    var(--surface-hi) 100%
  );
  background-size: 200% 100%;
  animation: sk-shimmer 1.8s linear infinite;
  vertical-align: middle;
}
.sk--block {
  display: block;
}
@keyframes sk-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
