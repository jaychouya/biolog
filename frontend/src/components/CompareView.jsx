import { useEffect, useState } from 'react'
import { analyzeBoth } from '../api'
import { analyzeCompareAI } from '../analyzeStream'
import { COMPARE_SYMPTOM, IMAGE_MALATANG } from '../scenarios'
import { COMPARE_SNAPSHOT_META } from '../compareSnapshot'
import { getLlmConfig, hasApiKey } from '../llmConfig'
import { shareUrl } from '../routing'
import EvidenceChain from './EvidenceChain'
import ConfidenceBar from './ConfidenceBar'
import PhotoAnnotated from './PhotoAnnotated'
import { PageHeader } from './ui/Layout'

function MiniResult({ result, label, badge, animate, delay, showImage }) {
  return (
    <article className="card p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[var(--color-text-muted)]">{label}</span>
        <span className={`badge text-xs ${badge.className}`}>{badge.text}</span>
      </div>
      {showImage && result.image && (
        <div className="mb-4">
          <PhotoAnnotated
            src={result.image}
            annotations={result.photo_annotations}
            insights={result.photo_insights}
            alt="对比餐食"
            className="w-full max-h-36"
          />
        </div>
      )}
      <p className="section-label mb-1">主因推测</p>
      <p className="mb-4 text-base font-semibold">{result.primary_cause}</p>
      <p className="section-label mb-2">置信度</p>
      <div className="mb-4">
        <ConfidenceBar score={result.confidence_score} animate={animate} delay={delay} />
      </div>
      <p className="section-label mb-2">证据链</p>
      <EvidenceChain items={result.evidence_chain} animate={animate} delayStart={delay + 400} />
    </article>
  )
}

function CompareSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="card space-y-4 p-5">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-6 w-full rounded" />
          <div className="skeleton h-2 w-full rounded-full" />
          <div className="skeleton h-16 w-full rounded" />
        </div>
      ))}
    </div>
  )
}

export default function CompareView({ onBack }) {
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [data, setData] = useState(null)
  const [source, setSource] = useState('snapshot')
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const canAi = hasApiKey()

  useEffect(() => {
    analyzeBoth().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  const runAi = async () => {
    setAiLoading(true)
    setError(null)
    setProgress('')
    try {
      const d = await analyzeCompareAI(getLlmConfig(), setProgress)
      setData({
        textOnly: { ...d.textOnly, image: null },
        withImage: { ...d.withImage, image: IMAGE_MALATANG },
      })
      setSource('ai')
    } catch (e) {
      setError(e.message)
    } finally {
      setAiLoading(false)
      setProgress('')
    }
  }

  const sourceLabel =
    source === 'ai' ? 'AI 实测' : `${COMPARE_SNAPSHOT_META.provider} 实录样本`

  const copyShareLink = async () => {
    const text = [
      'Biolog 多模态对比实验',
      `同症状：${COMPARE_SYMPTOM}`,
      data
        ? `置信度 ${data.textOnly.confidence_score}% → ${data.withImage.confidence_score}%`
        : '加一张照片，置信度跃升',
      shareUrl({ view: 'compare' }),
    ].join('\n')
    await navigator.clipboard.writeText(text)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const subtitle = data
    ? `「${COMPARE_SYMPTOM}」· ${data.textOnly.confidence_score}% → ${data.withImage.confidence_score}%（${sourceLabel}）`
    : `同一段症状「${COMPARE_SYMPTOM}」· 加一张照片，置信度跃升`

  return (
    <div className="page-shell">
      <div className="page-container-wide">
        <PageHeader onBack={onBack} title="多模态对比实验" subtitle={subtitle} />

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className={`badge text-xs ${source === 'ai' ? 'badge-ai' : 'badge-demo'}`}>{sourceLabel}</span>
          <button type="button" onClick={copyShareLink} className="btn-secondary text-sm">
            {linkCopied ? '已复制分享' : '复制分享链接'}
          </button>
          {canAi && (
            <button
              type="button"
              onClick={runAi}
              disabled={loading || aiLoading}
              className="btn-primary text-sm"
            >
              {aiLoading ? 'AI 分析中...' : '用 AI 重跑对比'}
            </button>
          )}
          {progress && <span className="text-xs text-[var(--color-text-muted)]">{progress}</span>}
          {error && <span className="text-xs text-orange-400" role="alert">{error}</span>}
        </div>

        {loading || aiLoading ? (
          <CompareSkeleton />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <MiniResult
              result={data.textOnly}
              label="纯文本输入"
              badge={{ text: '无图像', className: 'badge-demo' }}
              animate
              delay={200}
            />
            <MiniResult
              result={data.withImage}
              label="文本 + 餐食照片"
              badge={{ text: '多模态', className: 'badge-ai' }}
              animate
              delay={600}
              showImage
            />
          </div>
        )}

        {!loading && !aiLoading && (
          <p className="card mt-8 p-4 text-center text-sm text-[var(--color-primary)]">
            {source === 'ai'
              ? '以上为你的 Key 实时分析结果'
              : '默认展示实录样本；自备 Key 可一键重跑验证'}
          </p>
        )}
      </div>
    </div>
  )
}
