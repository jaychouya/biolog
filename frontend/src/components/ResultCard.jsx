import { useState } from 'react'
import PhotoAnnotated from './PhotoAnnotated'
import InferenceGraph from './InferenceGraph'
import EvidenceChain from './EvidenceChain'
import CounterfactualCard from './CounterfactualCard'
import ConfidenceBar from './ConfidenceBar'
import { PageHeader } from './ui/Layout'
import { IconChart } from './ui/Icons'
import { shareUrl } from '../routing'

function badgeLabel(result) {
  if (result.is_ai) return 'AI 分析'
  if (result.ai_fallback) return '演示（AI 失败降级）'
  if (result.is_custom) return '自定义演示'
  return '演示场景'
}

function badgeClass(result) {
  if (result.is_ai) return 'badge-ai'
  if (result.ai_fallback) return 'badge-fallback'
  return 'badge-demo'
}

function buildShareText(result) {
  return [
    'Biolog 分析',
    `症状：${result.user_symptom}`,
    `可能关联：${result.primary_cause}`,
    `现在就做：${result.primary_action}`,
    '— 非医疗建议',
  ].join('\n')
}

export default function ResultCard({ result, onReset }) {
  const [showGraph, setShowGraph] = useState(false)
  const [showExtra, setShowExtra] = useState(false)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const handleShare = async () => {
    await navigator.clipboard.writeText(buildShareText(result))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl({ mode: result.is_ai ? 'ai' : 'demo' }))
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <PageHeader onBack={onReset} />

        <article className="card p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge ${badgeClass(result)}`}>{badgeLabel(result)}</span>
              {result.provider && (
                <span className="badge badge-ai text-xs">{result.provider} · {result.model}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleShareLink} className="btn-ghost text-xs">
                {linkCopied ? '链接已复制' : '复制链接'}
              </button>
              <button type="button" onClick={handleShare} className="btn-ghost text-xs">
                {copied ? '已复制' : '复制结果'}
              </button>
            </div>
          </div>

          <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="section-label mb-1.5">你说</p>
            <p className="text-title text-[var(--color-text)]">「{result.user_symptom}」</p>
            {result.is_custom && result.matched_scenario && !result.is_ai && (
              <p className="mt-2 text-xs text-[var(--color-text-subtle)]">
                已匹配最接近场景：{result.matched_scenario}
              </p>
            )}
            {result.vision_skipped && (
              <p className="mt-2 text-xs text-amber-400">当前模型不支持视觉，照片未纳入分析</p>
            )}
            {result.ai_fallback && (
              <p className="mt-2 text-sm text-orange-400" role="alert">
                AI 调用失败，已降级为演示：{result.ai_error}
              </p>
            )}
          </section>

          <section className="mb-6 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-muted)]/40 p-5">
            <p className="section-label mb-2">现在就做</p>
            <p className="text-display font-semibold leading-snug text-emerald-50">{result.primary_action}</p>
            {result.extra_suggestions && (
              <>
                <button
                  type="button"
                  onClick={() => setShowExtra(!showExtra)}
                  className="btn-ghost mt-3 px-0 text-xs text-emerald-600"
                  aria-expanded={showExtra}
                >
                  {showExtra ? '收起更多建议' : '查看更多建议'}
                </button>
                {showExtra && (
                  <p className="mt-2 text-sm text-emerald-200/80">{result.extra_suggestions}</p>
                )}
              </>
            )}
          </section>

          <CounterfactualCard
            score={result.confidence_score}
            scoreWithout={result.confidence_without_image}
            note={result.counterfactual_note}
          />

          <section className="mb-6 rounded-xl bg-[var(--color-surface)] p-5">
            <p className="section-label mb-1.5">可能关联</p>
            <p className="text-title font-semibold">{result.primary_cause}</p>
            <div className="mt-4">
              <ConfidenceBar score={result.confidence_score} animate delay={300} />
            </div>
          </section>

          {result.photo_insights?.length > 0 && (
            <section className="mb-6">
              <div className="flex items-start gap-4">
                {result.image && (
                  <PhotoAnnotated
                    src={result.image}
                    annotations={result.photo_annotations}
                    insights={result.photo_insights}
                    alt="上传的餐食"
                    className="h-28 w-28 shrink-0"
                  />
                )}
                <div>
                  <p className="section-label mb-2">从照片看到</p>
                  <ul className="space-y-1">
                    {result.photo_insights.map((item, i) => (
                      <li key={i} className="text-sm text-[var(--color-text-muted)]">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          <section className="mb-6">
            <p className="section-label mb-3">推理依据</p>
            <EvidenceChain items={result.evidence_chain} animate delayStart={800} />
          </section>

          <section>
            <button
              type="button"
              onClick={() => setShowGraph(!showGraph)}
              className="btn-ghost flex items-center gap-2 px-0 text-sm text-[var(--color-primary)]"
              aria-expanded={showGraph}
            >
              <IconChart />
              推理路径
            </button>
            {showGraph && result.inference_graph && (
              <div className="mt-3">
                <p className="mb-2 text-xs text-[var(--color-text-subtle)]">推理路径示意，非真实统计推断</p>
                <InferenceGraph graph={result.inference_graph} />
              </div>
            )}
          </section>
        </article>

        <p className="mt-6 text-center text-xs text-[var(--color-text-subtle)]">
          非医疗建议 · {result.is_ai ? `${result.provider || 'AI'} 生成` : '演示数据'} · 不存储任何数据
        </p>
      </div>
    </div>
  )
}
