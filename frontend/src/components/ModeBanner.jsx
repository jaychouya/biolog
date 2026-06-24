export default function ModeBanner({ mode }) {
  const isAi = mode === 'ai'
  return (
    <div
      className={`fixed left-0 right-0 top-0 z-40 border-b px-4 py-2 text-center text-xs font-medium ${
        isAi
          ? 'border-blue-900/50 bg-blue-950/80 text-blue-300'
          : 'border-[var(--color-border)] bg-[var(--color-surface)]/90 text-[var(--color-text-muted)]'
      }`}
      role="status"
    >
      {isAi ? '● AI 模式 — Key 经后端转发，不存储' : '● 演示模式 — 预设场景，无需 API'}
    </div>
  )
}
