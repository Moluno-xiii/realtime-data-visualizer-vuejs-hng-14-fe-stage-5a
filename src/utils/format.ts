export function formatPrice(n: number): string {
  if (!Number.isFinite(n)) return '-'
  if (n >= 1000)
    return n.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })
  if (n >= 1)
    return n.toLocaleString('en-US', {
      maximumFractionDigits: 4,
      minimumFractionDigits: 2,
    })
  return n.toLocaleString('en-US', {
    maximumFractionDigits: 6,
    minimumFractionDigits: 4,
  })
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return '-'
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatPct(n: number, withSign = true): string {
  if (!Number.isFinite(n)) return '-'
  const sign = withSign && n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

export function formatSigned(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '-'
  const sign = n > 0 ? '+' : n < 0 ? '−' : ''
  return `${sign}${Math.abs(n).toFixed(digits)}`
}

export function formatTime(t: number): string {
  return new Date(t).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatRelative(t: number, now = Date.now()): string {
  const diff = Math.max(0, now - t)
  if (diff < 5_000) return 'now'
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s`
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
  return `${Math.floor(diff / 86_400_000)}d`
}
