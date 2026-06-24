import ConfidenceBar from './ConfidenceBar'

export default function CounterfactualCard({ score, scoreWithout, note }) {
  if (scoreWithout == null) return null

  const delta = score - scoreWithout

  return (
    <section className="mb-6 rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 p-5">
      <p className="section-label mb-3">反事实对比 · 多模态价值</p>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-xs text-[var(--color-text-subtle)]">无照片</p>
          <p className="text-numeric text-display font-semibold text-[var(--color-text-muted)]">{scoreWithout}%</p>
        </div>
        <div>
          <p className="mb-1 text-xs text-[var(--color-text-subtle)]">有照片</p>
          <p className="text-numeric text-display font-semibold text-[var(--color-primary)]">{score}%</p>
        </div>
      </div>
      <ConfidenceBar score={score} animate={false} />
      <p className="mt-3 text-sm text-[var(--color-primary)]">
        照片带来 +{delta}% 把握度
        {note && <span className="mt-1 block text-xs text-[var(--color-text-muted)]">{note}</span>}
      </p>
    </section>
  )
}
