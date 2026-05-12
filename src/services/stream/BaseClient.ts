import type { StreamClient, StreamEvent, Subscription } from './types'

export abstract class BaseClient implements StreamClient {
  protected handlers = new Set<(e: StreamEvent) => void>()
  protected sub: Subscription | null = null
  protected attempt = 0
  protected lastPingMs: number | null = null

  on(handler: (e: StreamEvent) => void): () => void {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  protected emit(e: StreamEvent) {
    for (const h of this.handlers) {
      try {
        h(e)
      } catch (err) {
        console.error('[stream] handler threw', err)
      }
    }
  }

  ping(): number | null {
    return this.lastPingMs
  }

  abstract start(sub: Subscription): void
  abstract stop(): void
}

export function backoffMs(attempt: number, capMs = 30_000): number {
  const base = Math.min(capMs, 250 * Math.pow(2, attempt))
  const jitter = Math.random() * 0.3 * base
  return Math.round(base + jitter)
}
