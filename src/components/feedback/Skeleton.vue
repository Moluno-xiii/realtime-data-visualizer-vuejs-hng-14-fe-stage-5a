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
    class="skeleton-bar"
    :class="block ? 'block' : 'inline-block align-middle'"
    :style="{ width: dim(width), height: dim(height), borderRadius: radius }"
    aria-hidden="true"
  ></span>
</template>
