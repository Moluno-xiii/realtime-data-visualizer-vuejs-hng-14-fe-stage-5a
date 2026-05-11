import type { Directive } from 'vue'

const observers = new WeakMap<Element, IntersectionObserver>()

export const vReveal: Directive<HTMLElement, void> = {
  mounted(el) {
    el.classList.add('reveal')
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--in')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    observers.set(el, io)
  },
  unmounted(el) {
    observers.get(el)?.disconnect()
    observers.delete(el)
  },
}
