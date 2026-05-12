import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: true,
    allowedHosts: [
      'italicize-dynamic-harness.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io',
      '.ngrok.app',
    ],
  },
  preview: {
    host: true,
    allowedHosts: [
      'italicize-dynamic-harness.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io',
      '.ngrok.app',
    ],
  },
})
