export default function Hero({ onDemo, onAi, onCompare }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 pb-28 pt-12">
      <div className="hero-glow" aria-hidden />

      <div className="relative z-10 w-full max-w-xl text-center">
        <p className="section-label mb-4">生活线索探索</p>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">Biolog</h1>
        <p className="mb-2 text-lg text-[var(--color-text)] md:text-xl">
          帮你看清身体不适背后的生活线索
        </p>
        <p className="mb-8 text-sm text-[var(--color-text-muted)]">
          演示体验零门槛 · AI 模式 token 真流式返回
        </p>

        <div className="flex flex-col gap-3 sm:mx-auto sm:max-w-sm">
          <button type="button" onClick={onAi} className="btn-primary w-full">
            AI 真实分析
          </button>
          <button type="button" onClick={onDemo} className="btn-secondary w-full">
            演示体验（无需 Key）
          </button>
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 px-6 pb-8 pt-4">
        <button type="button" onClick={onCompare} className="btn-ghost text-xs">
          技术对比：多模态置信度跃升
        </button>
        <p className="text-center text-xs text-[var(--color-text-subtle)]">
          非医疗建议 · Key 仅存会话 · 不存储数据
        </p>
      </footer>
    </div>
  )
}
