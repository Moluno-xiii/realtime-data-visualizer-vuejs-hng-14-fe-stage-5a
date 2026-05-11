import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  LineChart,
  BarChart,
  CandlestickChart,
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
