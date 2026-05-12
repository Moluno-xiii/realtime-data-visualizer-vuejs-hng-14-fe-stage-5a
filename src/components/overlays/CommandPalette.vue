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
import { useRecentSymbols } from '@/composables/useRecentSymbols'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const router = useRouter()
const { toggle: toggleTheme } = useTheme()
const { paused, toggle: togglePause } = usePause()
const { openSymbolPicker } = useOverlays()
const symbolsStore = useSymbolsStore()
const { directory } = storeToRefs(symbolsStore)
const { symbols: watchlistSymbols } = useWatchlist()
const { recent } = useRecentSymbols()

type Item = {
  id: string
  group: string
  label: string
  hint?: string
  action: () => void
}

const ACTIONS = computed<Item[]>(() => {
  const watch = new Set(watchlistSymbols.value)
  const recentSet = new Set(recent.value)

  const dirBySymbol = new Map(directory.value.map((s) => [s.symbol, s]))
  const recentItems: Item[] = recent.value
    .map((sym) => dirBySymbol.get(sym))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({
      id: `recent-${s.symbol}`,
      group: 'Recent',
      label: `${s.base} / ${s.quote}`,
      hint: s.name,
      action: () => router.push(`/markets/${s.symbol}`),
    }))

  const sorted = [...directory.value]
    .filter((s) => !recentSet.has(s.symbol))
    .sort((a, b) => {
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

  return [...recentItems, ...routeItems, ...actionItems, ...symbolItems]
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
    <div class="flex flex-col min-h-0 flex-1" @keydown="onKey">
      <div class="flex items-center gap-[10px] px-[18px] py-[14px] border-b border-rule text-ink-mute">
        <span aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.4" fill="none" />
            <path d="m11 11 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </span>
        <input
          id="cp-input"
          v-model="q"
          type="text"
          class="flex-1 bg-transparent border-0 outline-0 text-ink text-lg font-body min-w-0 placeholder:text-ink-faint"
          placeholder="Jump to a market, route, or action…"
          aria-label="Search commands"
          autocomplete="off"
        />
        <span class="font-mono text-[10px] tracking-[0.06em] text-ink-mute border border-border rounded-[3px] px-[6px] py-[2px] bg-bg-elev">esc</span>
      </div>

      <div class="cp-list overflow-y-auto flex-1 min-h-0">
        <template v-for="[group, items] in grouped" :key="group">
          <div class="cp-group">
            <span class="eyebrow">{{ group }}</span>
          </div>
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="cp-row flex items-center justify-between w-full rounded-1 text-left text-ink-dim transition-colors hover:bg-surface-hi/40"
            :class="
              filtered[idx]?.id === item.id
                ? 'bg-surface-hi text-ink ring-1 ring-inset ring-accent'
                : ''
            "
            @click="run(item)"
            @mouseenter="idx = filtered.findIndex((i) => i.id === item.id)"
          >
            <span class="text-md">{{ item.label }}</span>
            <span class="font-mono text-xs text-ink-faint">{{ item.hint }}</span>
          </button>
        </template>
        <div v-if="!filtered.length" class="px-4 py-8 text-center text-ink-mute text-sm">
          No commands match "{{ q }}".
        </div>
      </div>

      <footer class="flex items-center gap-[14px] px-[14px] py-[10px] border-t border-rule bg-bg-elev">
        <span class="text-xs uppercase tracking-[0.08em] text-ink-faint inline-flex items-center gap-[6px]">
          <kbd class="font-mono text-[10px] py-[1px] px-[5px] border border-border rounded-[3px] text-ink-mute bg-surface">↑↓</kbd>
          navigate
        </span>
        <span class="text-xs uppercase tracking-[0.08em] text-ink-faint inline-flex items-center gap-[6px]">
          <kbd class="font-mono text-[10px] py-[1px] px-[5px] border border-border rounded-[3px] text-ink-mute bg-surface">↵</kbd>
          run
        </span>
        <span class="text-xs uppercase tracking-[0.08em] text-ink-faint inline-flex items-center gap-[6px]">
          <kbd class="font-mono text-[10px] py-[1px] px-[5px] border border-border rounded-[3px] text-ink-mute bg-surface">esc</kbd>
          close
        </span>
      </footer>
    </div>
  </Modal>
</template>


<style scoped>
.cp-list {
  padding: 8px 16px 16px;
}
.cp-group {
  padding: 12px 20px 8px;
}
.cp-list > .cp-group:first-child {
  padding-top: 4px;
}
.cp-row {
  padding: 14px 20px;
  margin: 2px 0;
}
</style>
