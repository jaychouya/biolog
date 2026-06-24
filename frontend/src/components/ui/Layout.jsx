import { IconBack, IconClose } from './Icons'

export function PageHeader({ onBack, title, subtitle }) {
  return (
    <header className="mb-8">
      <button type="button" onClick={onBack} className="btn-ghost -ml-2 mb-4" aria-label="返回首页">
        <IconBack />
        返回
      </button>
      {title && <h1 className="text-2xl font-semibold text-[var(--color-text)] md:text-3xl">{title}</h1>}
      {subtitle && <p className="mt-2 text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
    </header>
  )
}

export function Modal({ title, description, onClose, children }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-panel card">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="btn-icon shrink-0" aria-label="关闭">
            <IconClose />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function LoadingBlock({ label = '分析中...' }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-pulse-glow rounded-full bg-[var(--color-primary)]" />
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
    </div>
  )
}
