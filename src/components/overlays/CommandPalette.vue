<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import Modal from './Modal.vue'
import { useTheme } from '@/composables/useTheme'
import { usePause } from '@/composables/usePause'
import { useOverlays } from '@/composables/useOverlays'
import { useSymbolsStore } from '@/stores/symbolsStore'
import { useWatchlist } from '@/composables/useWatchlist'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const router = useRouter()
const { toggle: toggleTheme } = useTheme()
const { paused, toggle: togglePause } = usePause()
const { openSymbolPicker } = useOverlays()
const symbolsStore = useSymbolsStore()
const { directory } = storeToRefs(symbolsStore)
const { symbols: watchlistSymbols } = useWatchlist()

type Item = {
  id: string
  group: string
  label: string
  hint?: string
  action: () => void
}

const ACTIONS = computed<Item[]>(() => {
  const watch = new Set(watchlistSymbols.value)
  const sorted = [...directory.value].sort((a, b) => {
    const aw = watch.has(a.symbol) ? 0 : 1
    const bw = watch.has(b.symbol) ? 0 : 1
    return aw - bw
  })
  const symbolItems: Item[] = sorted.map((s) => ({
    id: `sym-${s.symbol}`,
    group: watch.has(s.symbol) ? 'Watchlist' : 'Markets',
    label: `${s.base} / ${s.quote}`,
    hint: s.name,
    action: () => router.push(`/markets/${s.symbol}`),
  }))

  const routeItems: Item[] = [
    {
      id: 'route-overview',
      group: 'Navigate',
      label: 'Overview',
      hint: '/',
      action: () => router.push('/'),
    },
    {
      id: 'route-activity',
      group: 'Navigate',
      label: 'Activity feed',
      hint: '/activity',
      action: () => router.push('/activity'),
    },
    {
      id: 'route-settings',
      group: 'Navigate',
      label: 'Settings',
      hint: '/settings',
      action: () => router.push('/settings'),
    },
  ]

  const actionItems: Item[] = [
    {
      id: 'act-theme',
      group: 'Actions',
      label: 'Toggle theme',
      hint: 'dark ↔ light',
      action: () => toggleTheme(),
    },
    {
      id: 'act-pause',
      group: 'Actions',
      label: paused.value ? 'Resume stream' : 'Pause stream',
      hint: 'space',
      action: () => togglePause(),
    },
    {
      id: 'act-manage',
      group: 'Actions',
      label: 'Manage watchlist',
      hint: 'symbols',
      action: () => {
        emit('close')
        nextTick(() => openSymbolPicker())
      },
    },
  ]

  return [...routeItems, ...actionItems, ...symbolItems]
})

const q = ref('')
const idx = ref(0)

const filtered = computed<Item[]>(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) {
    return ACTIONS.value.filter((a) => a.group !== 'Markets')
  }
  const out: Item[] = []
  for (const a of ACTIONS.value) {
    if (
      a.label.toLowerCase().includes(term) ||
      a.hint?.toLowerCase().includes(term) ||
      a.group.toLowerCase().includes(term)
    ) {
      out.push(a)
      if (out.length >= 80) break
    }
  }
  return out
})

const grouped = computed(() => {
  const g = new Map<string, Item[]>()
  for (const it of filtered.value) {
    const arr = g.get(it.group) ?? []
    arr.push(it)
    g.set(it.group, arr)
  }
  return [...g.entries()]
})

watch(filtered, () => {
  idx.value = 0
})
watch(
  () => props.open,
  (v) => {
    if (v) {
      q.value = ''
      idx.value = 0
      symbolsStore.ensureLoaded()
      nextTick(() => {
        const el = document.getElementById('cp-input') as HTMLInputElement | null
        el?.focus()
      })
    }
  },
)

function run(item: Item) {
  item.action()
  if (!item.id.startsWith('act-manage')) emit('close')
}

function onKey(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    idx.value = Math.min(filtered.value.length - 1, idx.value + 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    idx.value = Math.max(0, idx.value - 1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = filtered.value[idx.value]
    if (item) run(item)
  }
}
</script>

<template>
  <Modal :open="open" label="Command palette" @close="emit('close')">
    <div class="cp" @keydown="onKey">
      <div class="cp__search">
        <span class="cp__icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.4" fill="none" />
            <path d="m11 11 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </span>
        <input
          id="cp-input"
          v-model="q"
          type="text"
          class="cp__input"
          placeholder="Jump to a market, route, or action…"
          aria-label="Search commands"
          autocomplete="off"
        />
        <span class="cp__esc">esc</span>
      </div>

      <div class="cp__list">
        <template v-for="[group, items] in grouped" :key="group">
          <div class="cp__group">
            <span class="eyebrow">{{ group }}</span>
          </div>
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="cp__item"
            :class="{ 'cp__item--active': filtered[idx]?.id === item.id }"
            @click="run(item)"
            @mouseenter="idx = filtered.findIndex((i) => i.id === item.id)"
          >
            <span class="cp__label">{{ item.label }}</span>
            <span class="cp__hint mono">{{ item.hint }}</span>
          </button>
        </template>
        <div v-if="!filtered.length" class="cp__empty">
          No commands match "{{ q }}".
        </div>
      </div>

      <footer class="cp__foot">
        <span class="cp__legend"><kbd>↑↓</kbd> navigate</span>
        <span class="cp__legend"><kbd>↵</kbd> run</span>
        <span class="cp__legend"><kbd>esc</kbd> close</span>
      </footer>
    </div>
  </Modal>
</template>

<style scoped>
.cp {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}

.cp__search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--rule);
  color: var(--ink-mute);
}
.cp__input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  color: var(--ink);
  font-size: var(--fs-lg);
  font-family: var(--font-body);
  min-width: 0;
}
.cp__input::placeholder {
  color: var(--ink-faint);
}
.cp__esc {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink-mute);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 2px 6px;
  background: var(--bg-elev);
}

.cp__list {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding: 6px 6px 8px;
}
.cp__group {
  padding: 10px 10px 4px;
}

.cp__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 9px 12px;
  border-radius: var(--r-1);
  text-align: left;
  color: var(--ink-dim);
}
.cp__item--active {
  background: var(--surface-hi);
  color: var(--ink);
  outline: 1px solid var(--accent);
  outline-offset: -1px;
}
.cp__label {
  font-size: var(--fs-md);
}
.cp__hint {
  font-size: var(--fs-xs);
  color: var(--ink-faint);
}

.cp__empty {
  padding: 24px 12px;
  text-align: center;
  color: var(--ink-mute);
  font-size: var(--fs-sm);
}

.cp__foot {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-top: 1px solid var(--rule);
  background: var(--bg-elev);
}
.cp__legend {
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--ink-faint);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.cp__legend kbd {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 5px;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--ink-mute);
  background: var(--surface);
}
</style>
