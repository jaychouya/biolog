import { useEffect, useRef, useState } from 'react'
import { getLlmConfig, saveLlmConfig, getProvider, loadProviders, PROVIDERS } from '../llmConfig'
import { checkBackendHealth, testConnection } from '../analyzeStream'
import { Modal } from './ui/Layout'
import { IconChevron, IconUpload } from './ui/Icons'

export default function CustomInput({ onSubmit, onBack, loading, aiMode = false, initialSymptom = '', initialImage = null }) {
  const fileRef = useRef(null)
  const [symptom, setSymptom] = useState(initialSymptom)
  const [image, setImage] = useState(initialImage)
  const [dragOver, setDragOver] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(aiMode || !!getLlmConfig().apiKey)
  const [config, setConfig] = useState(getLlmConfig())
  const [providers, setProviders] = useState(PROVIDERS)
  const [backendOk, setBackendOk] = useState(null)
  const [testStatus, setTestStatus] = useState(null)

  const provider = getProvider(config.provider, providers)
  const hasKey = !!config.apiKey?.trim()

  useEffect(() => {
    loadProviders().then(setProviders)
  }, [])

  useEffect(() => {
    if (aiMode) checkBackendHealth().then(setBackendOk)
  }, [aiMode])

  const updateConfig = (patch) => {
    const next = { ...config, ...patch }
    setConfig(next)
    saveLlmConfig(next)
  }

  const handleFile = (file) => {
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setImage(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleTest = async () => {
    setTestStatus('testing')
    try {
      const res = await testConnection(config)
      setTestStatus({ ok: true, msg: `${res.provider} 连接成功` })
    } catch (e) {
      setTestStatus({ ok: false, msg: e.message })
    }
  }

  return (
    <Modal
      title={aiMode ? 'AI 真实分析' : '描述你的情况'}
      description={
        hasKey
          ? `${provider.name} · 流式推理 + 反事实对比`
          : aiMode
            ? '选择提供商并填写 API Key'
            : '未填 Key 时使用演示匹配模式'
      }
      onClose={onBack}
    >
      <div className="space-y-4">
        {aiMode && backendOk === false && (
          <p className="rounded-lg border border-amber-800/40 bg-amber-900/20 px-3 py-2 text-xs text-amber-300" role="alert">
            后端未连接。请运行：<code className="text-amber-200">cd backend && uvicorn main:app --port 8000</code>
          </p>
        )}

        <div>
          <label htmlFor="symptom" className="section-label mb-2 block">哪里不舒服？</label>
          <textarea
            id="symptom"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            placeholder="比如：嗓子疼、腰酸、睡不着..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div>
          <span className="section-label mb-2 block">最近一餐照片（推荐，触发反事实对比）</span>
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition ${
              dragOver ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] hover:border-[#3f3f50]'
            }`}
          >
            {image ? (
              <img src={image} alt="餐食预览" className="max-h-28 rounded-lg object-cover" />
            ) : (
              <>
                <IconUpload className="mb-2 text-[var(--color-text-subtle)]" />
                <span className="text-sm text-[var(--color-text-muted)]">拖拽或点击上传</span>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>
          {image && !provider.supportsVision && (
            <p className="mt-2 text-xs text-amber-400">{provider.name} 不支持视觉，将仅分析文字</p>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn-ghost flex w-full items-center justify-between px-0 text-sm"
            aria-expanded={showAdvanced}
          >
            AI 提供商设置 {aiMode && <span className="text-[var(--color-primary)]">*</span>}
            <IconChevron open={showAdvanced} />
          </button>
          {showAdvanced && (
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="provider" className="section-label mb-2 block">提供商</label>
                <select
                  id="provider"
                  value={config.provider}
                  onChange={(e) => updateConfig({ provider: e.target.value, model: '' })}
                  className="input-field"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="api-key" className="section-label mb-2 block">API Key</label>
                <input
                  id="api-key"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => updateConfig({ apiKey: e.target.value })}
                  placeholder="sk-..."
                  autoComplete="off"
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label htmlFor="model" className="section-label mb-2 block">模型（可选）</label>
                <input
                  id="model"
                  type="text"
                  value={config.model}
                  onChange={(e) => updateConfig({ model: e.target.value })}
                  placeholder={image && provider.supportsVision ? provider.visionModel : provider.defaultModel}
                  className="input-field text-sm"
                />
              </div>
              {provider.requiresBaseUrl && (
                <div>
                  <label htmlFor="base-url" className="section-label mb-2 block">Base URL</label>
                  <input
                    id="base-url"
                    type="url"
                    value={config.baseUrl}
                    onChange={(e) => updateConfig({ baseUrl: e.target.value })}
                    placeholder="https://api.example.com/v1"
                    className="input-field text-sm"
                  />
                </div>
              )}
              <p className="text-xs text-[var(--color-text-subtle)]">Key 仅存于本次会话，经后端转发，不持久化</p>
              {hasKey && (
                <div className="flex items-center gap-3">
                  <button type="button" onClick={handleTest} disabled={testStatus === 'testing'} className="btn-secondary text-xs">
                    {testStatus === 'testing' ? '测试中...' : '测试连接'}
                  </button>
                  {testStatus && testStatus !== 'testing' && (
                    <span className={`text-xs ${testStatus.ok ? 'text-emerald-400' : 'text-orange-400'}`}>
                      {testStatus.msg}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSubmit(symptom.trim(), image, config)}
          disabled={!symptom.trim() || loading || (aiMode && !hasKey)}
          className="btn-primary w-full"
        >
          {loading ? '推理中...' : hasKey ? '开始 AI 分析' : '开始演示分析'}
        </button>
      </div>
    </Modal>
  )
}
