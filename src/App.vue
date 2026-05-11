<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import { useTheme } from '@/composables/useTheme'

useTheme()

const route = useRoute()
const isLanding = computed(() => route.meta?.layout === 'landing')
</script>

<template>
  <AppShell v-if="!isLanding" />
  <RouterView v-else />
</template>

<style>
@import './assets/styles/base.css';
</style>
