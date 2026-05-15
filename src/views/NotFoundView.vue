<script setup lang="ts">
import { useRoute } from 'vue-router'
import Brand from '@/components/layout/Brand.vue'
import ThemeToggle from '@/components/controls/ThemeToggle.vue'

const route = useRoute()
const path = String(route.fullPath || '/').slice(0, 64)
</script>

<template>
  <div class="nf min-h-dvh flex flex-col bg-bg relative font-body overflow-hidden">
    <header class="nf-bar relative z-20 flex items-center justify-between gap-5 px-6 py-3 border-b border-rule">
      <Brand />
      <div class="inline-flex items-center gap-3">
        <ThemeToggle />
        <RouterLink to="/dashboard" class="nf-cta nf-cta-sm">
          Open terminal
          <span aria-hidden="true" class="nf-arrow font-mono">→</span>
        </RouterLink>
      </div>
    </header>

    <main class="flex-1 relative grid place-items-center px-[clamp(20px,4vw,56px)] py-[clamp(36px,7vw,96px)]">
      <div class="nf-grid absolute inset-0 pointer-events-none opacity-55" aria-hidden="true"></div>
      <div class="nf-mark absolute -bottom-[3vw] -right-[2vw] font-glyph text-[clamp(220px,28vw,560px)] leading-[0.78] tracking-[-0.02em] text-ink opacity-[0.025] pointer-events-none select-none lowercase" aria-hidden="true">404</div>

      <div class="relative z-[1] flex flex-col gap-5 items-start max-w-[680px]">
        <p
          class="rise self-start inline-flex items-center gap-2 m-0 font-body text-xs uppercase tracking-[0.18em] text-ink-mute px-[10px] py-[6px] pl-2 border border-border rounded-pill bg-surface"
          style="--d: 60ms"
        >
          <span class="w-[6px] h-[6px] rounded-full bg-down shadow-[0_0_6px_var(--down,#ef5350)] animate-pulse-dot" aria-hidden="true"></span>
          SIGNAL LOST · 404
        </p>

        <h1 class="nf-title m-0 font-tech font-extrabold text-[clamp(56px,10vw,140px)] leading-[0.92] tracking-[-0.045em] text-ink inline-flex items-baseline flex-wrap gap-x-[18px] lowercase">
          <span class="rise" style="--d: 140ms">off the</span>
          <em class="nf-live rise relative inline-block text-accent not-italic" style="--d: 320ms">tape</em>
          <span class="rise text-accent" style="--d: 460ms">.</span>
        </h1>

        <p class="rise m-0 text-ink-dim text-[clamp(15px,1.4vw,18px)] leading-[1.55] max-w-[56ch]" style="--d: 600ms">
          The route you requested isn’t listed on this exchange. No quote, no book,
          no candles, just static. Pick a destination below and we’ll route you
          back to a live market.
        </p>

        <dl class="rise nf-meta grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-2 mt-1 font-mono text-[12px] tracking-[0.04em]" style="--d: 720ms">
          <dt class="text-ink-mute uppercase tracking-[0.12em] text-[10px]">Code</dt>
          <dd class="m-0 text-ink">404 · NOT_FOUND</dd>
          <dt class="text-ink-mute uppercase tracking-[0.12em] text-[10px]">Path</dt>
          <dd class="m-0 text-ink-dim truncate max-w-[52ch]">{{ path }}</dd>
          <dt class="text-ink-mute uppercase tracking-[0.12em] text-[10px]">Status</dt>
          <dd class="m-0 inline-flex items-center gap-[6px] text-ink">
            <span class="w-[6px] h-[6px] rounded-full bg-down shadow-[0_0_6px_var(--down,#ef5350)]" aria-hidden="true"></span>
            no upstream
          </dd>
        </dl>

        <div class="rise inline-flex items-center gap-4 mt-4 flex-wrap" style="--d: 880ms">
          <RouterLink to="/dashboard" class="nf-cta nf-cta-lg">
            Return to terminal
            <span aria-hidden="true" class="nf-arrow font-mono">→</span>
          </RouterLink>
          <RouterLink to="/" class="nf-link">
            <span aria-hidden="true" class="font-mono">←</span>
            Landing
          </RouterLink>
          <span class="font-mono text-xs text-ink-mute inline-flex items-center gap-[6px]">
            <kbd class="font-mono text-[10px] py-[1px] px-[5px] border border-border rounded-[3px] text-ink-mute bg-bg-elev">⌘</kbd>
            <kbd class="font-mono text-[10px] py-[1px] px-[5px] border border-border rounded-[3px] text-ink-mute bg-bg-elev">K</kbd>
            from any live page to jump.
          </span>
        </div>
      </div>

      <div class="nf-scan absolute inset-0 pointer-events-none mix-blend-screen opacity-30" aria-hidden="true"></div>
    </main>

    <footer class="nf-foot flex items-center justify-between gap-4 py-[18px] px-[clamp(20px,4vw,56px)] border-t border-rule bg-bg flex-wrap">
      <span class="font-mono text-xs text-ink-mute tracking-[0.08em] uppercase">tape · v0.1 · error channel</span>
      <span class="font-mono text-xs text-ink-faint tracking-[0.08em] uppercase">if this keeps happening, the route table moved</span>
    </footer>
  </div>
</template>

<style scoped>
.nf-cta {
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
.nf-cta::before {
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
.nf-cta:hover {
  filter: brightness(1.06);
}
.nf-cta:hover::before {
  transform: translateX(120%);
}
.nf-cta:hover .nf-arrow {
  transform: translateX(3px);
}
.nf-arrow {
  transition: transform 240ms var(--ease-out);
}
.nf-cta-sm {
  height: 30px;
  padding: 0 12px;
}
.nf-cta-lg {
  height: 52px;
  padding: 0 26px;
  font-size: var(--fs-sm);
}

.nf-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: var(--fs-xs);
  text-transform: uppercase;
  letter-spacing: var(--tracking-mid);
  color: var(--ink-dim);
  padding: 0 8px;
  height: 30px;
  border-bottom: 1px solid transparent;
  transition:
    color var(--t-fast) var(--ease-out),
    border-color var(--t-fast) var(--ease-out);
}
.nf-link:hover {
  color: var(--ink);
  border-bottom-color: var(--accent);
}

.nf-grid {
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size:
    64px 64px,
    64px 64px;
  mask-image: radial-gradient(60% 60% at 30% 40%, #000 30%, transparent 80%);
  animation: nf-grid-drift 26s linear infinite;
}
@keyframes nf-grid-drift {
  to {
    background-position:
      64px 64px,
      64px 64px;
  }
}

.nf-live::after {
  content: '';
  position: absolute;
  left: 4%;
  right: 4%;
  bottom: 0.1em;
  height: 2px;
  background: var(--accent);
  opacity: 0.65;
}

.nf-scan {
  background: repeating-linear-gradient(
    180deg,
    transparent 0,
    transparent 3px,
    rgba(236, 231, 223, 0.018) 3px,
    rgba(236, 231, 223, 0.018) 4px
  );
}

.rise {
  opacity: 0;
  transform: translate3d(0, 14px, 0);
  animation: nf-rise-in 800ms var(--ease-out) forwards;
  animation-delay: var(--d, 0ms);
}
@keyframes nf-rise-in {
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@media (max-width: 640px) {
  .nf-foot {
    justify-content: center;
    text-align: center;
  }
  .nf-meta {
    grid-template-columns: 1fr;
  }
  .nf-meta dt {
    margin-top: 8px;
  }
}
</style>
