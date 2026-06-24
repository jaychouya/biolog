import { IconSparkle } from './ui/Icons'

function StreamProgress({ tokenCount, stepCount }) {
  const parsing = stepCount > 0 && tokenCount > 0
  const pct = parsing
    ? 100
    : tokenCount > 0
      ? Math.min(85, 10 + Math.floor(tokenCount / 12))
      : 8

  return (
    <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-2 flex items-center justify-between text-[10px] text-[var(--color-text-subtle)]">
        <span>{parsing ? '正在整理推理步骤…' : tokenCount > 0 ? '模型思考中' : '连接模型…'}</span>
        {tokenCount > 0 && !parsing && (
          <span className="tabular-nums text-[var(--color-primary)]">{Math.floor(tokenCount / 4)} tokens</span>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function StreamingOverlay({ steps, isAi, liveText = '' }) {
  const tokenCount = liveText.length

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--color-bg)]/95 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
            <IconSparkle className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold">{isAi ? 'AI 推理中' : '演示分析中'}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {isAi ? '实时接收模型输出' : '演示步骤回放'}
            </p>
          </div>
        </div>

        <ul className="space-y-3" aria-live="polite" role="log">
          {steps.map((step, i) => (
            <li
              key={`${i}-${step}`}
              className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm transition-all duration-300"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-xs font-medium text-[var(--color-primary)]">
                {i + 1}
              </span>
              <span className="text-[var(--color-text-muted)]">{step}</span>
            </li>
          ))}
          {steps.length === 0 && !isAi && <li className="skeleton h-12 rounded-lg" />}
        </ul>

        {isAi && <StreamProgress tokenCount={tokenCount} stepCount={steps.length} />}

        <div className="mt-6 flex items-center gap-2 text-xs text-[var(--color-text-subtle)]">
          <span className="h-2 w-2 animate-pulse-glow rounded-full bg-[var(--color-primary)]" />
          {isAi && tokenCount > 0 && steps.length === 0 ? '生成分析结果…' : '正在推理…'}
        </div>
      </div>
    </div>
  )
}
