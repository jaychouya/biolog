import { useEffect, useState } from 'react'

export default function ConfidenceBar({ score, animate = false, delay = 0 }) {
  const [width, setWidth] = useState(animate ? 0 : score)

  useEffect(() => {
    if (!animate) {
      setWidth(score)
      return
    }
    setWidth(0)
    const t = setTimeout(() => setWidth(score), delay)
    return () => clearTimeout(t)
  }, [score, animate, delay])

  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]" role="progressbar" aria-valuenow={width} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] transition-[width] duration-700 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-numeric text-title min-w-[3rem] text-right font-semibold text-[var(--color-primary)]">{width}%</span>
    </div>
  )
}
