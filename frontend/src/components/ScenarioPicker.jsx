import { Modal, LoadingBlock } from './ui/Layout'
import { ScenarioIcon } from './ui/Icons'

export default function ScenarioPicker({ scenarios, onSelect, onCustom, onConfigureKey, onClose, loading, aiMode = false }) {
  return (
    <Modal
      title={aiMode ? 'AI 分析 · 选择场景' : '选择你的情况'}
      description={
        aiMode
          ? '预设场景将调用真实 API · Key 仅存本次会话'
          : '演示场景 · 选一个最接近你状态的'
      }
      onClose={onClose}
    >
      {aiMode && onConfigureKey && (
        <button type="button" onClick={onConfigureKey} className="btn-secondary mb-4 w-full text-sm">
          配置 API Key / 提供商
        </button>
      )}

      <ul className="space-y-3" role="list">
        {scenarios.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              disabled={loading}
              className="flex w-full cursor-pointer items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                <ScenarioIcon id={s.id} className="w-6 h-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-[var(--color-text)]">{s.title}</span>
                <span className="mt-0.5 block truncate text-sm text-[var(--color-text-muted)]">「{s.symptom}」</span>
              </span>
              <span className="shrink-0 text-xs text-[var(--color-text-subtle)]">{s.subtitle}</span>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onCustom}
        disabled={loading}
        className="btn-secondary mt-4 w-full"
      >
        {aiMode ? '自定义症状分析' : '没有符合的？描述我的情况'}
      </button>

      {loading && <LoadingBlock />}
    </Modal>
  )
}
