<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  eyebrow?: string
}>()
</script>

<template>
  <section class="cc">
    <header class="cc__head">
      <div class="cc__titles">
        <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
        <h3 class="cc__title">{{ title }}</h3>
        <p v-if="subtitle" class="cc__sub">{{ subtitle }}</p>
      </div>
      <div class="cc__tools">
        <slot name="tools" />
      </div>
    </header>
    <hr class="rule" />
    <div class="cc__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="cc__foot">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.cc {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-1);
  box-shadow: var(--shadow-lift);
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
.cc__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
}
.cc__titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.cc__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.05;
  color: var(--ink);
  font-style: italic;
}
.cc__sub {
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--ink-mute);
}
.cc__tools {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.cc__body {
  padding: var(--s-3) var(--s-4) var(--s-4);
  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.cc__body > * {
  min-height: 0;
}
.cc__foot {
  padding: var(--s-3) var(--s-4);
  border-top: 1px solid var(--rule);
}
</style>
