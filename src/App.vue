<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
import { useTheme } from '@/composables/useTheme'

useTheme()
</script>

<template>
  <AppShell />
</template>

<style>
@import './assets/styles/base.css';
</style>
