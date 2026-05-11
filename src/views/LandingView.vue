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
  <div class="lp">
    <TickerTape />

    <header class="lp__bar">
      <Brand />
      <nav class="lp__nav" aria-label="Page sections">
        <a href="#pillars" class="lp__nav-item">Why</a>
        <a href="#capabilities" class="lp__nav-item">Capabilities</a>
        <a href="#numbers" class="lp__nav-item">Numbers</a>
      </nav>
      <div class="lp__bar-r">
        <ThemeToggle />
        <RouterLink to="/dashboard" class="lp__cta lp__cta--sm">
          Open terminal
          <span aria-hidden="true" class="lp__cta-arrow">→</span>
        </RouterLink>
      </div>
    </header>

    <main class="lp__main">
      <section class="hero">
        <div class="hero__grid" aria-hidden="true"></div>
        <div class="hero__mark" aria-hidden="true">TAPE</div>
        <div class="hero__copy">
          <p class="hero__eyebrow rise" style="--d: 60ms">
            <span class="hero__eyebrow-dot" aria-hidden="true"></span>
            LIVE MARKETS TERMINAL · v0.1
          </p>
          <h1 class="hero__title">
            <span class="rise" style="--d: 140ms">Markets,</span>
            <em class="hero__live rise" style="--d: 320ms">live</em>
            <span class="hero__period rise" style="--d: 460ms">.</span>
          </h1>
          <p class="hero__sub rise" style="--d: 600ms">
            A streaming terminal for retail traders who want pro-grade signal —
            without the seven-monitor setup. Watch price, momentum, and the order
            book breathe in real time.
          </p>
          <div class="hero__cta-row rise" style="--d: 760ms">
            <RouterLink to="/dashboard" class="lp__cta">
              Open the terminal
              <span aria-hidden="true" class="lp__cta-arrow">→</span>
            </RouterLink>
            <span class="hero__hint">
              <kbd>⌘</kbd><kbd>K</kbd> from anywhere to jump.
            </span>
          </div>
          <ul class="hero__chips rise" style="--d: 900ms" role="list">
            <li class="chip">
              <span class="dot" style="background: var(--up)"></span>
              60 fps target
            </li>
            <li class="chip">
              <span class="dot" style="background: var(--accent); box-shadow: 0 0 6px var(--accent)"></span>
              0 third-party state libs
            </li>
            <li class="chip">
              <span class="dot" style="background: var(--info)"></span>
              Vue 3 · ECharts
            </li>
          </ul>
        </div>
        <div class="hero__preview rise" style="--d: 520ms">
          <HeroPreview />
          <div class="hero__scan" aria-hidden="true"></div>
        </div>
      </section>

      <section v-reveal class="manifesto">
        <p class="manifesto__quote">
          <span>“Built for the trader who wants </span>
          <em>signal over noise</em>
          <span>, at sixty frames a second.”</span>
        </p>
        <p class="manifesto__sig mono">— TAPE · v0.1 · synthetic feed</p>
      </section>

      <section id="pillars" v-reveal class="pillars">
        <header class="section__head">
          <span class="eyebrow">Why TAPE</span>
          <h2 class="section__title display">Three rules. No exceptions.</h2>
        </header>
        <ol class="pillars__list" role="list">
          <li v-for="p in PILLARS" :key="p.n" class="pillar">
            <span class="pillar__n mono">{{ p.n }}</span>
            <h3 class="pillar__t display">{{ p.title }}</h3>
            <p class="pillar__b">{{ p.body }}</p>
            <span class="pillar__line" aria-hidden="true"></span>
          </li>
        </ol>
      </section>

      <section id="capabilities" v-reveal class="caps">
        <header class="section__head">
          <span class="eyebrow">In the terminal</span>
          <h2 class="section__title display">Everything you need on one screen.</h2>
        </header>
        <ul class="caps__grid" role="list">
          <li v-for="c in CAPABILITIES" :key="c.title" class="cap">
            <span class="cap__eyebrow mono">{{ c.eyebrow }}</span>
            <h3 class="cap__t">{{ c.title }}</h3>
            <p class="cap__d">{{ c.desc }}</p>
          </li>
        </ul>
      </section>

      <section id="numbers" ref="statsEl" class="stats">
        <div class="stats__row">
          <div class="stat">
            <span class="eyebrow">Frame budget</span>
            <span class="stat__v mono">
              <AnimatedNumber
                v-if="statsVisible"
                :value="60"
                :duration="900"
                :format="(n) => Math.round(n).toString()"
              />
              <span v-else>0</span>
              <span class="stat__u">fps</span>
            </span>
            <span class="stat__d">target render rate</span>
          </div>
          <div class="stat">
            <span class="eyebrow">Decode</span>
            <span class="stat__v mono">
              &lt;<AnimatedNumber
                v-if="statsVisible"
                :value="1"
                :duration="900"
                :format="(n) => n.toFixed(1)"
              />
              <span v-else>0.0</span>
              <span class="stat__u">ms</span>
            </span>
            <span class="stat__d">per WS payload</span>
          </div>
          <div class="stat">
            <span class="eyebrow">Symbols</span>
            <span class="stat__v mono">
              <AnimatedNumber
                v-if="statsVisible"
                :value="24"
                :duration="900"
                :format="(n) => Math.round(n).toString()"
              />
              <span v-else>0</span>
            </span>
            <span class="stat__d">streamed concurrently</span>
          </div>
          <div class="stat">
            <span class="eyebrow">Deps</span>
            <span class="stat__v mono">
              <AnimatedNumber
                v-if="statsVisible"
                :value="0"
                :duration="900"
                :format="(n) => Math.round(n).toString()"
              />
            </span>
            <span class="stat__d">third-party state libs</span>
          </div>
        </div>
      </section>

      <section v-reveal class="close">
        <div class="close__scan" aria-hidden="true"></div>
        <h2 class="close__title display">
          Open the <em>tape</em>.
        </h2>
        <p class="close__sub">No sign-up. No friction. The terminal is already running.</p>
        <RouterLink to="/dashboard" class="lp__cta lp__cta--lg">
          Enter terminal
          <span aria-hidden="true" class="lp__cta-arrow">→</span>
        </RouterLink>
      </section>
    </main>

    <footer class="lp__foot">
      <div class="lp__foot-l">
        <Brand subtle />
      </div>
      <div class="lp__foot-r tech">
        © Moluno {{ year }}
      </div>
    </footer>
  </div>
</template>

<style scoped>
.lp {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  position: relative;
  font-family: var(--font-body);
}
.tech {
  font-family: var(--font-tech);
  font-feature-settings:
    'ss01' on,
    'ss02' on,
    'zero' on;
  letter-spacing: -0.005em;
}

.lp__bar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-5);
  padding: 12px var(--s-6);
  background: color-mix(in srgb, var(--bg) 80%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--rule);
}
.lp__nav {
  display: inline-flex;
  gap: 2px;
}
.lp__nav-item {
  padding: 6px 10px;
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--ink-mute);
  transition: color var(--t-fast) var(--ease-out);
}
.lp__nav-item:hover {
  color: var(--ink);
}
.lp__bar-r {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.lp__cta {
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
.lp__cta::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(40% 80% at 0% 50%, rgba(255, 255, 255, 0.18), transparent 80%);
  transform: translateX(-30%);
  transition: transform 360ms var(--ease-out);
}
.lp__cta:hover {
  filter: brightness(1.06);
}
.lp__cta:hover::before {
  transform: translateX(120%);
}
.lp__cta:hover .lp__cta-arrow {
  transform: translateX(3px);
}
.lp__cta-arrow {
  font-family: var(--font-mono);
  transition: transform 240ms var(--ease-out);
}
.lp__cta--sm {
  height: 30px;
  padding: 0 12px;
}
.lp__cta--lg {
  height: 56px;
  padding: 0 28px;
  font-size: var(--fs-sm);
}

.lp__main {
  flex: 1;
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(28px, 4vw, 56px);
  padding: clamp(36px, 8vw, 96px) clamp(20px, 4vw, 56px) clamp(48px, 9vw, 120px);
  overflow: hidden;
}
.hero__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.55;
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 64px 64px, 64px 64px;
  background-position: 0 0, 0 0;
  mask-image: radial-gradient(70% 70% at 30% 35%, #000 30%, transparent 80%);
  animation: grid-drift 26s linear infinite;
}
@keyframes grid-drift {
  to {
    background-position: 64px 64px, 64px 64px;
  }
}
.hero__mark {
  position: absolute;
  bottom: -2vw;
  right: -3vw;
  font-family: var(--font-glyph);
  font-size: clamp(200px, 24vw, 480px);
  line-height: 0.78;
  letter-spacing: -0.02em;
  color: var(--ink);
  opacity: 0.025;
  pointer-events: none;
  user-select: none;
  text-transform: lowercase;
}

.hero__copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 640px;
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--fs-xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--ink-mute);
  align-self: flex-start;
  padding: 6px 10px 6px 8px;
  border: 1px solid var(--border);
  border-radius: var(--r-pill);
  background: var(--surface);
}
.hero__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent);
  animation: pulse-dot 1.6s ease-in-out infinite;
}

.hero__title {
  margin: 0;
  font-family: var(--font-tech);
  font-weight: 800;
  font-size: clamp(52px, 9vw, 124px);
  line-height: 0.92;
  letter-spacing: -0.045em;
  color: var(--ink);
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0 18px;
  text-transform: lowercase;
  font-feature-settings:
    'ss01' on,
    'ss02' on,
    'zero' on;
}
.hero__live {
  color: var(--accent);
  position: relative;
  display: inline-block;
  font-style: normal;
}
.hero__live::after {
  content: '';
  position: absolute;
  left: 4%;
  right: 4%;
  bottom: 0.1em;
  height: 2px;
  background: var(--accent);
  opacity: 0.65;
}
.hero__period {
  color: var(--accent);
}

.hero__sub {
  margin: 0;
  color: var(--ink-dim);
  font-size: clamp(15px, 1.4vw, 18px);
  line-height: 1.55;
  max-width: 56ch;
}

.hero__cta-row {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.hero__hint {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  color: var(--ink-mute);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.hero__hint kbd {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 5px;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--ink-mute);
  background: var(--bg-elev);
}

.hero__chips {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 8px 0 0;
  list-style: none;
}

.hero__preview {
  position: relative;
  z-index: 1;
  max-width: 640px;
  justify-self: end;
  width: 100%;
}
.hero__scan {
  position: absolute;
  inset: -2px;
  pointer-events: none;
  border-radius: var(--r-1);
  background:
    linear-gradient(180deg, transparent 0%, var(--accent-wash) 50%, transparent 100%);
  mix-blend-mode: screen;
  opacity: 0.4;
  animation: scan 7s linear infinite;
  mask-image: linear-gradient(180deg, transparent 0, #000 4%, #000 96%, transparent 100%);
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

.manifesto {
  position: relative;
  padding: clamp(60px, 9vw, 120px) clamp(20px, 6vw, 80px);
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  background: var(--bg-elev);
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
.manifesto__quote {
  margin: 0 auto;
  max-width: 24ch;
  font-family: var(--font-tech);
  font-weight: 500;
  font-size: clamp(34px, 4.8vw, 64px);
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--ink);
  text-align: center;
}
.manifesto__quote em {
  font-style: normal;
  color: var(--accent);
  font-weight: 700;
}
.manifesto__sig {
  margin: 22px auto 0;
  text-align: center;
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  font-size: 11px;
  color: var(--ink-mute);
}

.section__head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: clamp(48px, 7vw, 96px) clamp(20px, 4vw, 56px) clamp(20px, 3vw, 36px);
}
.section__title {
  margin: 0;
  font-family: var(--font-tech);
  font-weight: 700;
  font-size: clamp(34px, 4.6vw, 62px);
  letter-spacing: -0.035em;
  line-height: 1;
  color: var(--ink);
  text-transform: lowercase;
}

.pillars__list {
  list-style: none;
  margin: 0;
  padding: 0 clamp(20px, 4vw, 56px) clamp(48px, 7vw, 96px);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(20px, 2vw, 32px);
}
.pillar {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 28px 22px;
  border: 1px solid var(--border);
  background: var(--surface);
  overflow: hidden;
  transition: border-color var(--t-mid) var(--ease-out), transform var(--t-mid) var(--ease-out);
}
.pillar:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}
.pillar:hover .pillar__line {
  transform: translateX(0);
}
.pillar__n {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--ink-faint);
}
.pillar__t {
  margin: 0;
  font-family: var(--font-tech);
  font-weight: 700;
  font-size: clamp(24px, 2.6vw, 34px);
  letter-spacing: -0.025em;
  color: var(--ink);
  text-transform: lowercase;
}
.pillar__b {
  margin: 0;
  color: var(--ink-dim);
  font-size: var(--fs-md);
  line-height: 1.5;
}
.pillar__line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  transform: translateX(-101%);
  transition: transform 420ms var(--ease-out);
}

.caps {
  background: var(--bg);
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}
.caps__grid {
  list-style: none;
  margin: 0;
  padding: 0 clamp(20px, 4vw, 56px) clamp(48px, 7vw, 96px);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-left: 1px solid var(--rule);
}
.cap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 28px 24px 32px;
  border-right: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  background: transparent;
  transition: background var(--t-mid) var(--ease-out);
}
.cap:hover {
  background: var(--accent-wash);
}
.cap:nth-child(-n + 3) {
  border-top: 1px solid var(--rule);
}
.cap__eyebrow {
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--ink-faint);
}
.cap__t {
  margin: 0;
  font-size: 20px;
  font-family: var(--font-tech);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ink);
  text-transform: lowercase;
}
.cap__d {
  margin: 0;
  color: var(--ink-dim);
  font-size: var(--fs-sm);
  line-height: 1.55;
}

.stats {
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 56px);
}
.stats__row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  overflow: hidden;
  background: var(--surface);
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 28px 24px;
  border-right: 1px solid var(--rule);
}
.stat:last-child {
  border-right: 0;
}
.stat__v {
  font-family: var(--font-tech);
  font-size: clamp(40px, 4.4vw, 56px);
  font-weight: 700;
  color: var(--ink);
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}
.stat__u {
  font-size: 0.4em;
  color: var(--ink-mute);
  font-weight: 400;
}
.stat__d {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-mute);
}

.close {
  position: relative;
  padding: clamp(80px, 11vw, 160px) clamp(20px, 4vw, 56px);
  text-align: center;
  border-top: 1px solid var(--rule);
  overflow: hidden;
  background: var(--bg);
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
.close__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 3px,
      rgba(236, 231, 223, 0.012) 3px,
      rgba(236, 231, 223, 0.012) 4px
    );
  mix-blend-mode: overlay;
}
.close__title {
  margin: 0 auto;
  font-family: var(--font-tech);
  font-weight: 800;
  font-size: clamp(52px, 9.5vw, 136px);
  letter-spacing: -0.05em;
  color: var(--ink);
  line-height: 0.94;
  text-transform: lowercase;
}
.close__title em {
  font-style: normal;
  color: var(--accent);
}
.close__sub {
  margin: 18px auto 32px;
  max-width: 42ch;
  color: var(--ink-dim);
  font-size: var(--fs-lg);
}

.lp__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-4);
  padding: 22px clamp(20px, 4vw, 56px);
  border-top: 1px solid var(--rule);
  background: var(--bg);
  flex-wrap: wrap;
}
.lp__foot-r {
  font-size: var(--fs-xs);
  letter-spacing: 0.06em;
  color: var(--ink-mute);
}

@media (max-width: 1080px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero__preview {
    justify-self: stretch;
  }
}

@media (max-width: 880px) {
  .lp__nav {
    display: none;
  }
  .pillars__list,
  .caps__grid {
    grid-template-columns: 1fr;
  }
  .caps__grid {
    border-left: 0;
  }
  .cap {
    border-right: 0;
  }
  .stats__row {
    grid-template-columns: repeat(2, 1fr);
  }
  .stat:nth-child(2) {
    border-right: 0;
  }
  .stat:nth-child(-n + 2) {
    border-bottom: 1px solid var(--rule);
  }
}

@media (max-width: 480px) {
  .hero__chips {
    width: 100%;
  }
  .lp__foot {
    justify-content: center;
    text-align: center;
  }
  .lp__foot-r {
    width: 100%;
    justify-content: center;
  }
}
</style>
