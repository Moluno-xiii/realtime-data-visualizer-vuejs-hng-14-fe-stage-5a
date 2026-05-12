<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Brand from '@/components/layout/Brand.vue'
import TickerTape from '@/components/layout/TickerTape.vue'
import HeroPreview from '@/components/landing/HeroPreview.vue'
import ThemeToggle from '@/components/controls/ThemeToggle.vue'
import AnimatedNumber from '@/components/cards/AnimatedNumber.vue'

const year = new Date().getFullYear()

const statsVisible = ref(false)
const statsEl = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null

onMounted(() => {
  if (!statsEl.value) return
  io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        statsVisible.value = true
        io?.disconnect()
      }
    },
    { threshold: 0.4 },
  )
  io.observe(statsEl.value)
})
onBeforeUnmount(() => {
  io?.disconnect()
})

const CAPABILITIES = [
  {
    eyebrow: '01',
    title: 'Live charts',
    desc: 'Line, area, bar, candle — all Canvas-rendered and tuned for streaming updates.',
  },
  {
    eyebrow: '02',
    title: 'Activity feed',
    desc: 'Newest-first, severity-tagged, searchable. Filters tighten the firehose to your eye.',
  },
  {
    eyebrow: '03',
    title: 'Watchlist sync',
    desc: 'Persisted to local storage. Pin a symbol once, see it everywhere.',
  },
  {
    eyebrow: '04',
    title: 'Light + dark',
    desc: 'Dark is the hero; light ships for high-glare days and pitch decks.',
  },
  {
    eyebrow: '05',
    title: 'Keyboard first',
    desc: '⌘K to jump anywhere. Space to pause. Esc to escape. Your hands stay home.',
  },
  {
    eyebrow: '06',
    title: 'Pause / resume',
    desc: 'Freeze the feed when you need to think. Resume without a missed beat.',
  },
]

const PILLARS = [
  {
    n: 'I',
    title: 'Latency',
    body: 'Frame-perfect updates. RAF-batched commits. The render loop never blocks on a tick.',
  },
  {
    n: 'II',
    title: 'Surface',
    body: 'Trader-terminal density meets editorial restraint. Mono numerics, serif headlines, hairline rules.',
  },
  {
    n: 'III',
    title: 'Resilience',
    body: 'Schema-validated streams, reconnect with backoff, graceful failure. The UI never crashes on bad data.',
  },
]
</script>

<template>
  <div class="lp min-h-dvh flex flex-col bg-bg relative font-body">
    <TickerTape />

    <header class="lp-bar sticky top-0 z-30 flex items-center justify-between gap-5 px-6 py-3 border-b border-rule backdrop-blur-[12px] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)]">
      <Brand />
      <nav class="lp-nav inline-flex gap-[2px]" aria-label="Page sections">
        <a href="#pillars" class="px-[10px] py-[6px] text-xs uppercase tracking-[0.08em] text-ink-mute hover:text-ink transition-colors">Why</a>
        <a href="#capabilities" class="px-[10px] py-[6px] text-xs uppercase tracking-[0.08em] text-ink-mute hover:text-ink transition-colors">Capabilities</a>
        <a href="#numbers" class="px-[10px] py-[6px] text-xs uppercase tracking-[0.08em] text-ink-mute hover:text-ink transition-colors">Numbers</a>
      </nav>
      <div class="inline-flex items-center gap-3">
        <ThemeToggle />
        <RouterLink to="/dashboard" class="lp-cta lp-cta-sm">
          Open terminal
          <span aria-hidden="true" class="lp-arrow font-mono">→</span>
        </RouterLink>
      </div>
    </header>

    <main class="flex-1">
      <section class="hero relative grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] items-center gap-[clamp(28px,4vw,56px)] py-[clamp(36px,8vw,96px)] px-[clamp(20px,4vw,56px)] pb-[clamp(48px,9vw,120px)] overflow-hidden">
        <div class="hero-grid absolute inset-0 pointer-events-none opacity-55" aria-hidden="true"></div>
        <div class="hero-mark absolute -bottom-[2vw] -right-[3vw] font-glyph text-[clamp(200px,24vw,480px)] leading-[0.78] tracking-[-0.02em] text-ink opacity-[0.025] pointer-events-none select-none lowercase" aria-hidden="true">TAPE</div>
        <div class="relative z-[1] flex flex-col gap-[18px] max-w-[640px]">
          <p
            class="rise self-start inline-flex items-center gap-2 m-0 font-body text-xs uppercase tracking-[0.18em] text-ink-mute px-[10px] py-[6px] pl-2 border border-border rounded-pill bg-surface"
            style="--d: 60ms"
          >
            <span class="w-[6px] h-[6px] rounded-full bg-accent shadow-[0_0_6px_var(--accent)] animate-pulse-dot" aria-hidden="true"></span>
            LIVE MARKETS TERMINAL · v0.1
          </p>
          <h1 class="hero-title m-0 font-tech font-extrabold text-[clamp(52px,9vw,124px)] leading-[0.92] tracking-[-0.045em] text-ink inline-flex items-baseline flex-wrap gap-x-[18px] lowercase">
            <span class="rise" style="--d: 140ms">markets,</span>
            <em class="hero-live rise relative inline-block text-accent not-italic" style="--d: 320ms">live</em>
            <span class="rise text-accent" style="--d: 460ms">.</span>
          </h1>
          <p class="rise m-0 text-ink-dim text-[clamp(15px,1.4vw,18px)] leading-[1.55] max-w-[56ch]" style="--d: 600ms">
            A streaming terminal for retail traders who want pro-grade signal —
            without the seven-monitor setup. Watch price, momentum, and the order
            book breathe in real time.
          </p>
          <div class="rise inline-flex items-center gap-4 mt-2 flex-wrap" style="--d: 760ms">
            <RouterLink to="/dashboard" class="lp-cta">
              Open the terminal
              <span aria-hidden="true" class="lp-arrow font-mono">→</span>
            </RouterLink>
            <span class="font-mono text-xs text-ink-mute inline-flex items-center gap-[6px]">
              <kbd class="font-mono text-[10px] py-[1px] px-[5px] border border-border rounded-[3px] text-ink-mute bg-bg-elev">⌘</kbd>
              <kbd class="font-mono text-[10px] py-[1px] px-[5px] border border-border rounded-[3px] text-ink-mute bg-bg-elev">K</kbd>
              from anywhere to jump.
            </span>
          </div>
          <ul class="rise inline-flex flex-wrap gap-2 p-0 m-0 mt-2 list-none" style="--d: 900ms" role="list">
            <li class="chip">
              <span class="dot bg-up"></span>
              60 fps target
            </li>
            <li class="chip">
              <span class="dot bg-accent shadow-[0_0_6px_var(--accent)]"></span>
              0 third-party state libs
            </li>
            <li class="chip">
              <span class="dot bg-info"></span>
              Vue 3 · ECharts
            </li>
          </ul>
        </div>
        <div class="rise relative z-[1] max-w-[640px] justify-self-end w-full" style="--d: 520ms">
          <HeroPreview />
          <div class="hero-scan absolute -inset-[2px] pointer-events-none rounded-1 mix-blend-screen opacity-40" aria-hidden="true"></div>
        </div>
      </section>

      <section
        v-reveal
        class="manifesto relative py-[clamp(60px,9vw,120px)] px-[clamp(20px,6vw,80px)] border-t border-b border-rule bg-bg-elev"
      >
        <p class="m-0 mx-auto max-w-[24ch] font-tech font-medium text-[clamp(34px,4.8vw,64px)] leading-[1.1] tracking-[-0.03em] text-ink text-center">
          <span>“Built for the trader who wants </span>
          <em class="not-italic text-accent font-bold">signal over noise</em>
          <span>, at sixty frames a second.”</span>
        </p>
        <p class="mt-[22px] mx-auto text-center uppercase tracking-[0.08em] text-[11px] text-ink-mute font-mono">
          — TAPE · v0.1 · synthetic feed
        </p>
      </section>

      <section id="pillars" v-reveal class="lp-anchor">
        <header class="section-head flex flex-col gap-2 pt-[clamp(48px,7vw,96px)] px-[clamp(20px,4vw,56px)] pb-[clamp(20px,3vw,36px)]">
          <span class="eyebrow">Why TAPE</span>
          <h2 class="section-title m-0 font-tech font-bold text-[clamp(34px,4.6vw,62px)] tracking-[-0.035em] leading-none text-ink lowercase">
            Three rules. No exceptions.
          </h2>
        </header>
        <ol class="pillars-list list-none m-0 px-[clamp(20px,4vw,56px)] pb-[clamp(48px,7vw,96px)] grid grid-cols-3 gap-[clamp(20px,2vw,32px)]" role="list">
          <li
            v-for="p in PILLARS"
            :key="p.n"
            class="pillar relative flex flex-col gap-3 px-[22px] py-7 border border-border bg-surface overflow-hidden transition-[border-color,transform] hover:border-accent hover:-translate-y-[2px]"
          >
            <span class="font-mono text-[11px] tracking-[0.18em] text-ink-faint">{{ p.n }}</span>
            <h3 class="m-0 font-tech font-bold text-[clamp(24px,2.6vw,34px)] tracking-[-0.025em] text-ink lowercase">{{ p.title }}</h3>
            <p class="m-0 text-ink-dim text-md leading-[1.5]">{{ p.body }}</p>
            <span class="pillar-line absolute left-0 right-0 bottom-0 h-px bg-accent shadow-[0_0_8px_var(--accent)]" aria-hidden="true"></span>
          </li>
        </ol>
      </section>

      <section id="capabilities" v-reveal class="lp-anchor bg-bg border-t border-b border-rule">
        <header class="section-head flex flex-col gap-2 pt-[clamp(48px,7vw,96px)] px-[clamp(20px,4vw,56px)] pb-[clamp(20px,3vw,36px)]">
          <span class="eyebrow">In the terminal</span>
          <h2 class="m-0 font-tech font-bold text-[clamp(34px,4.6vw,62px)] tracking-[-0.035em] leading-none text-ink lowercase">
            Everything you need on one screen.
          </h2>
        </header>
        <ul class="caps-grid list-none m-0 px-[clamp(20px,4vw,56px)] pb-[clamp(48px,7vw,96px)] grid grid-cols-3 border-l border-rule" role="list">
          <li
            v-for="(c, i) in CAPABILITIES"
            :key="c.title"
            class="cap flex flex-col gap-2 px-6 pt-7 pb-8 border-r border-b border-rule transition-colors hover:bg-accent-wash"
            :class="i < 3 ? 'border-t border-rule' : ''"
          >
            <span class="font-mono text-[10px] tracking-[0.18em] text-ink-faint">{{ c.eyebrow }}</span>
            <h3 class="m-0 text-xl font-tech font-semibold tracking-[-0.02em] text-ink lowercase">{{ c.title }}</h3>
            <p class="m-0 text-ink-dim text-sm leading-[1.55]">{{ c.desc }}</p>
          </li>
        </ul>
      </section>

      <section id="numbers" ref="statsEl" class="lp-anchor py-[clamp(56px,8vw,96px)] px-[clamp(20px,4vw,56px)]">
        <div class="stats-row grid grid-cols-4 border border-border rounded-1 overflow-hidden bg-surface">
          <div class="stat flex flex-col gap-[6px] px-6 py-7 border-r border-rule last:border-r-0">
            <span class="eyebrow">Frame budget</span>
            <span class="font-tech text-[clamp(40px,4.4vw,56px)] font-bold tracking-[-0.04em] text-ink inline-flex items-baseline gap-[6px] tabular-nums">
              <AnimatedNumber
                v-if="statsVisible"
                :value="60"
                :duration="900"
                :format="(n) => Math.round(n).toString()"
              />
              <span v-else>0</span>
              <span class="text-[0.4em] text-ink-mute font-normal">fps</span>
            </span>
            <span class="text-[11px] tracking-[0.08em] uppercase text-ink-mute">target render rate</span>
          </div>
          <div class="stat flex flex-col gap-[6px] px-6 py-7 border-r border-rule">
            <span class="eyebrow">Decode</span>
            <span class="font-tech text-[clamp(40px,4.4vw,56px)] font-bold tracking-[-0.04em] text-ink inline-flex items-baseline gap-[6px] tabular-nums">
              &lt;<AnimatedNumber
                v-if="statsVisible"
                :value="1"
                :duration="900"
                :format="(n) => n.toFixed(1)"
              />
              <span v-else>0.0</span>
              <span class="text-[0.4em] text-ink-mute font-normal">ms</span>
            </span>
            <span class="text-[11px] tracking-[0.08em] uppercase text-ink-mute">per WS payload</span>
          </div>
          <div class="stat flex flex-col gap-[6px] px-6 py-7 border-r border-rule">
            <span class="eyebrow">Symbols</span>
            <span class="font-tech text-[clamp(40px,4.4vw,56px)] font-bold tracking-[-0.04em] text-ink inline-flex items-baseline gap-[6px] tabular-nums">
              <AnimatedNumber
                v-if="statsVisible"
                :value="24"
                :duration="900"
                :format="(n) => Math.round(n).toString()"
              />
              <span v-else>0</span>
            </span>
            <span class="text-[11px] tracking-[0.08em] uppercase text-ink-mute">streamed concurrently</span>
          </div>
          <div class="stat flex flex-col gap-[6px] px-6 py-7">
            <span class="eyebrow">Deps</span>
            <span class="font-tech text-[clamp(40px,4.4vw,56px)] font-bold tracking-[-0.04em] text-ink inline-flex items-baseline gap-[6px] tabular-nums">
              <AnimatedNumber
                v-if="statsVisible"
                :value="0"
                :duration="900"
                :format="(n) => Math.round(n).toString()"
              />
            </span>
            <span class="text-[11px] tracking-[0.08em] uppercase text-ink-mute">third-party state libs</span>
          </div>
        </div>
      </section>

      <section v-reveal class="close relative py-[clamp(80px,11vw,160px)] px-[clamp(20px,4vw,56px)] text-center border-t border-rule overflow-hidden bg-bg">
        <div class="close-scan absolute inset-0 pointer-events-none mix-blend-overlay" aria-hidden="true"></div>
        <h2 class="m-0 mx-auto font-tech font-extrabold text-[clamp(52px,9.5vw,136px)] tracking-[-0.05em] text-ink leading-[0.94] lowercase">
          Open the <em class="not-italic text-accent">tape</em>.
        </h2>
        <p class="mt-[18px] mx-auto mb-8 max-w-[42ch] text-ink-dim text-lg">
          No sign-up. No friction. The terminal is already running.
        </p>
        <RouterLink to="/dashboard" class="lp-cta lp-cta-lg">
          Enter terminal
          <span aria-hidden="true" class="lp-arrow font-mono">→</span>
        </RouterLink>
      </section>
    </main>

    <footer class="lp-foot flex items-center justify-between gap-4 py-[22px] px-[clamp(20px,4vw,56px)] border-t border-rule bg-bg flex-wrap">
      <div>
        <Brand subtle />
      </div>
      <div class="lp-foot-tech font-tech text-xs tracking-[0.06em] text-ink-mute">
        © Moluno {{ year }}
      </div>
    </footer>
  </div>
</template>

<style scoped>
.lp-anchor {
  scroll-margin-top: 72px;
}
.section-head {
  scroll-margin-top: 84px;
}

.lp-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 16px;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: var(--accent-ink);
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  overflow: hidden;
  isolation: isolate;
  transition: filter var(--t-fast) var(--ease-out);
}
.lp-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(
    40% 80% at 0% 50%,
    rgba(255, 255, 255, 0.18),
    transparent 80%
  );
  transform: translateX(-30%);
  transition: transform 360ms var(--ease-out);
}
.lp-cta:hover {
  filter: brightness(1.06);
}
.lp-cta:hover::before {
  transform: translateX(120%);
}
.lp-cta:hover .lp-arrow {
  transform: translateX(3px);
}
.lp-arrow {
  transition: transform 240ms var(--ease-out);
}
.lp-cta-sm {
  height: 30px;
  padding: 0 12px;
}
.lp-cta-lg {
  height: 56px;
  padding: 0 28px;
  font-size: var(--fs-sm);
}

.hero-grid {
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size:
    64px 64px,
    64px 64px;
  mask-image: radial-gradient(70% 70% at 30% 35%, #000 30%, transparent 80%);
  animation: grid-drift 26s linear infinite;
}
@keyframes grid-drift {
  to {
    background-position:
      64px 64px,
      64px 64px;
  }
}

.hero-live::after {
  content: '';
  position: absolute;
  left: 4%;
  right: 4%;
  bottom: 0.1em;
  height: 2px;
  background: var(--accent);
  opacity: 0.65;
}

.hero-scan {
  background: linear-gradient(
    180deg,
    transparent 0%,
    var(--accent-soft) 50%,
    transparent 100%
  );
  animation: scan 5.6s linear infinite;
  mask-image: linear-gradient(
    180deg,
    transparent 0,
    #000 4%,
    #000 96%,
    transparent 100%
  );
}
@keyframes scan {
  0% {
    transform: translateY(-110%);
  }
  100% {
    transform: translateY(110%);
  }
}

.rise {
  opacity: 0;
  transform: translate3d(0, 14px, 0);
  animation: rise-in 800ms var(--ease-out) forwards;
  animation-delay: var(--d, 0ms);
}
@keyframes rise-in {
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.manifesto::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: clamp(180px, 30vw, 360px);
  height: 1px;
  background: var(--accent);
  opacity: 0.45;
}

.pillar-line {
  transform: translateX(-101%);
  transition: transform 420ms var(--ease-out);
}
.pillar:hover .pillar-line {
  transform: translateX(0);
}

.close::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: clamp(220px, 40vw, 480px);
  height: 1px;
  background: var(--accent);
  opacity: 0.5;
}
.close-scan {
  background: repeating-linear-gradient(
    180deg,
    transparent 0,
    transparent 3px,
    rgba(236, 231, 223, 0.012) 3px,
    rgba(236, 231, 223, 0.012) 4px
  );
}

@media (max-width: 1080px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero > .rise:last-child {
    justify-self: stretch;
  }
}

@media (max-width: 880px) {
  .lp-nav {
    display: none;
  }
  .pillars-list,
  .caps-grid {
    grid-template-columns: 1fr;
  }
  .caps-grid {
    border-left: 0;
  }
  .cap {
    border-right: 0;
  }
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .lp-foot {
    justify-content: center;
    text-align: center;
  }
  .lp-foot > div {
    width: 100%;
    justify-content: center;
  }
}
</style>
