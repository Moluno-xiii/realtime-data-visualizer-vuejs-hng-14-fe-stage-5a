import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  LineChart,
  BarChart,
  CandlestickChart,
  TreemapChart,
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkAreaComponent,
} from 'echarts/components'

let booted = false
export function bootstrapECharts() {
  if (booted) return
  booted = true
  use([
    CanvasRenderer,
    LineChart,
    BarChart,
    CandlestickChart,
    TreemapChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DataZoomComponent,
    MarkLineComponent,
    MarkAreaComponent,
  ])
}

function cssVar(name: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  )
}

export function chartPalette() {
  return {
    ink: cssVar('--ink', '#ece7df'),
    inkDim: cssVar('--ink-dim', '#b7afa3'),
    inkMute: cssVar('--ink-mute', '#7e766c'),
    inkFaint: cssVar('--ink-faint', '#4a4540'),
    accent: cssVar('--accent', '#d4ff3a'),
    up: cssVar('--up', '#7fe8a0'),
    down: cssVar('--down', '#ff6b6b'),
    grid: cssVar('--grid', 'rgba(236,231,223,0.04)'),
    surface: cssVar('--surface', '#181614'),
    border: cssVar('--border', '#2a2724'),
  }
}

const COMPARE_COLORS = [
  '#7fd5ff',
  '#ff9d4d',
  '#c084fc',
  '#f472b6',
  '#facc15',
  '#34d399',
  '#fb7185',
  '#a3e635',
] as const

export function compareColor(index: number): string {
  return COMPARE_COLORS[index % COMPARE_COLORS.length]!
}

function clamp01(n: number): number {
  if (n <= 0) return 0
  if (n >= 1) return 1
  return n
}

function parseHex(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i)
  if (!m) return null
  const v = parseInt(m[1]!, 16)
  return [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff]
}

function mix(a: [number, number, number], b: [number, number, number], t: number): string {
  const c = clamp01(t)
  const r = Math.round(a[0] + (b[0] - a[0]) * c)
  const g = Math.round(a[1] + (b[1] - a[1]) * c)
  const bl = Math.round(a[2] + (b[2] - a[2]) * c)
  return `rgb(${r}, ${g}, ${bl})`
}

export function heatColor(pct: number, scale = 5): string {
  const p = chartPalette()
  const neutral = parseHex(p.surface) ?? [24, 22, 20]
  const up = parseHex(p.up) ?? [127, 232, 160]
  const down = parseHex(p.down) ?? [255, 107, 107]
  const intensity = clamp01(Math.abs(pct) / scale)
  if (pct >= 0) return mix(neutral, up, intensity)
  return mix(neutral, down, intensity)
}

export function baseGrid(opts?: {
  top?: number
  right?: number
  bottom?: number
  left?: number
}) {
  return {
    top: opts?.top ?? 16,
    right: opts?.right ?? 12,
    bottom: opts?.bottom ?? 24,
    left: opts?.left ?? 48,
    containLabel: false,
  }
}

export function baseAxisLine() {
  const p = chartPalette()
  return {
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: p.grid } },
    axisLabel: {
      color: p.inkMute,
      fontSize: 10,
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
    },
  }
}

export function baseTooltip() {
  const p = chartPalette()
  return {
    trigger: 'axis',
    backgroundColor: p.surface,
    borderColor: p.border,
    borderWidth: 1,
    padding: [8, 10],
    textStyle: {
      color: p.ink,
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 11,
    },
    axisPointer: {
      type: 'cross',
      lineStyle: { color: p.inkFaint, type: 'dashed', width: 1 },
      crossStyle: { color: p.inkFaint },
      label: {
        backgroundColor: p.surface,
        color: p.ink,
        borderColor: p.border,
        borderWidth: 1,
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 10,
      },
    },
  }
}
