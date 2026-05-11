import { ref } from 'vue'

const paused = ref(false)

export function usePause() {
  function toggle() {
    paused.value = !paused.value
  }
  function pause() {
    paused.value = true
  }
  function resume() {
    paused.value = false
  }
  return { paused, toggle, pause, resume }
}
