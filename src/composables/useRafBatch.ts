export type RafBatch<T> = {
  push: (item: T) => void
  flush: () => void
  stop: () => void
}

export function createRafBatch<T>(
  drain: (batch: T[]) => void,
): RafBatch<T> {
  let buf: T[] = []
  let scheduled = false
  let stopped = false

  function flush() {
    if (!buf.length) {
      scheduled = false
      return
    }
    const out = buf
    buf = []
    scheduled = false
    drain(out)
  }

  function schedule() {
    if (scheduled || stopped) return
    scheduled = true
    requestAnimationFrame(flush)
  }

  return {
    push(item: T) {
      if (stopped) return
      buf.push(item)
      schedule()
    },
    flush,
    stop() {
      stopped = true
      buf = []
    },
  }
}
