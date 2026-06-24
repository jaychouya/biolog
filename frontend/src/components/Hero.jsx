export default function Hero({ onDemo, onAi, onCompare }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 pb-32 pt-12 sm:px-6 sm:pb-28">
      <div className="hero-glow" aria-hidden />

      <div className="relative z-10 w-full max-w-xl text-center">
        <p className="section-label mb-4">生活线索探索</p>
        <h1 className="font-display mb-4 text-4xl font-semibold tracking-tight md:text-5xl">Biolog</h1>
        <p className="text-title mb-2 text-[var(--color-text)] md:text-xl md:leading-snug">
          帮你看清身体不适背后的生活线索
        </p>
        <p className="text-caption mb-6 text-[var(--color-text-muted)]">
          演示体验零门槛 · AI 模式 token 真流式返回
        </p>

        <div
          className="mb-6 rounded-xl border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/8 px-4 py-4"
          role="region"
          aria-label="多模态对比预览"
        >
          <p className="section-label mb-3">多模态对比 · 实录样本</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-caption mb-0.5 text-[var(--color-text-subtle)]">无照片</p>
              <p className="text-numeric text-display font-semibold text-[var(--color-text-muted)]">63%</p>
            </div>
            <span className="text-caption text-[var(--color-primary)]">→ +21%</span>
            <div className="text-center">
              <p className="text-caption mb-0.5 text-[var(--color-text-subtle)]">有照片</p>
              <p className="text-numeric text-display font-semibold text-[var(--color-primary)]">84%</p>
            </div>
          </div>
          <button type="button" onClick={onCompare} className="btn-ghost mt-3 w-full text-caption text-[var(--color-primary)]">
            查看完整对比实验 →
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:mx-auto sm:max-w-sm">
          <button type="button" onClick={onCompare} className="btn-primary w-full">
            看对比实验（推荐）
          </button>
          <button type="button" onClick={onDemo} className="btn-secondary w-full">
            演示体验（无需 Key）
          </button>
          <button type="button" onClick={onAi} className="btn-ghost w-full text-caption">
            AI 真实分析（需 Key）
          </button>
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-1.5 px-5 pb-6 pt-3 sm:px-6 sm:pb-8">
        <p className="text-center text-caption text-[var(--color-text-subtle)]">
          非医疗建议 · Key 仅存会话 · 不存储数据
        </p>
      </footer>
    </div>
  )
}
