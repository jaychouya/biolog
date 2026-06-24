import { useEffect, useState } from 'react'

export default function EvidenceChain({ items, animate = false, delayStart = 0 }) {
  const [visible, setVisible] = useState(animate ? 0 : items.length)

  useEffect(() => {
    if (!animate) {
      setVisible(items.length)
      return
    }
    setVisible(0)
    const timers = items.map((_, i) =>
      setTimeout(() => setVisible(i + 1), delayStart + (i + 1) * 600),
    )
    return () => timers.forEach(clearTimeout)
  }, [items, animate, delayStart])

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className={`flex items-start gap-2 text-sm text-[var(--color-text-muted)] transition-[opacity,transform] duration-300 ${
            i < visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <span className="text-[var(--color-text-subtle)]" aria-hidden>{i === items.length - 1 ? '└' : '├'}</span>
          {item}
        </li>
      ))}
    </ul>
  )
}
