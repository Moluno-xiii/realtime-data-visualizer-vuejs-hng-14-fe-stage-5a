<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    points: number[]
    width?: number
    height?: number
    direction?: 'up' | 'down' | 'auto'
    strokeWidth?: number
  }>(),
  { width: 160, height: 40, direction: 'auto', strokeWidth: 1.6 },
)

const dir = computed<'up' | 'down'>(() => {
  if (props.direction !== 'auto') return props.direction
  const first = props.points[0] ?? 0
  const last = props.points[props.points.length - 1] ?? 0
  return last >= first ? 'up' : 'down'
})

const path = computed(() => {
  const p = props.points
  if (p.length < 2) return { line: '', area: '' }
  let min = Infinity
  let max = -Infinity
  for (const v of p) {
    if (v < min) min = v
    if (v > max) max = v
  }
  const range = max - min || 1
  const w = props.width
  const h = props.height
  const pad = 2
  const dx = (w - pad * 2) / (p.length - 1)
  const coords = p.map((v, i) => {
    const x = pad + i * dx
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return [x, y] as const
  })
  const line = coords
    .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ')
  const last = coords[coords.length - 1]!
  const first = coords[0]!
  const area = `${line} L${last[0].toFixed(2)} ${h - pad} L${first[0].toFixed(2)} ${h - pad} Z`
  return { line, area }
})

const id = `spk-${Math.random().toString(36).slice(2, 8)}`
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    class="block"
    :class="dir === 'up' ? 'text-up' : 'text-down'"
  >
    <defs>
      <linearGradient :id="`${id}-grad`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="currentColor" stop-opacity="0.32" />
        <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path :d="path.area" :fill="`url(#${id}-grad)`" />
    <path
      :d="path.line"
      fill="none"
      stroke="currentColor"
      :stroke-width="strokeWidth"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </svg>
</template>
