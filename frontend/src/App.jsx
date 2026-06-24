import { useState, useEffect } from 'react'
import { SCENARIOS } from './scenarios'
import { analyzeScenarioStream, analyzeCustomStream } from './analyzeStream'
import { buildCustomResult } from './scenarios'
import { getLlmConfig, hasApiKey } from './llmConfig'
import { parseRoute, syncRoute } from './routing'
import Hero from './components/Hero'
import ScenarioPicker from './components/ScenarioPicker'
import CustomInput from './components/CustomInput'
import ResultCard from './components/ResultCard'
import CompareView from './components/CompareView'
import StreamingOverlay from './components/StreamingOverlay'
import ModeBanner from './components/ModeBanner'
import { PageHeader } from './components/ui/Layout'

function AnalyzeErrorView({ error, onRetry, onDemo, onBack }) {
  return (
    <div className="page-shell">
      <div className="page-container">
        <PageHeader onBack={onBack} title="分析失败" />
        <div className="card p-6" role="alert">
          <p className="mb-4 text-orange-400">{error.message}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={onRetry} className="btn-primary">重试</button>
            <button type="button" onClick={onDemo} className="btn-secondary">切换演示模式</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState('hero')
  const [mode, setMode] = useState('demo')
  const [result, setResult] = useState(null)
  const [streamSteps, setStreamSteps] = useState([])
  const [streamLive, setStreamLive] = useState('')
  const [streamingIsAi, setStreamingIsAi] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState(null)
  const [pendingCustom, setPendingCustom] = useState(null)
  const [pendingScenario, setPendingScenario] = useState(null)

  const onStep = (text) => setStreamSteps((prev) => [...prev, text])
  const onToken = (text) => setStreamLive((prev) => prev + text)

  const isAiMode = mode === 'ai'

  useEffect(() => {
    const { view, mode: routeMode } = parseRoute()
    if (view === 'compare') {
      setStep('compare')
      return
    }
    if (routeMode === 'ai') {
      setMode('ai')
      setStep('scenarios')
    } else if (routeMode === 'demo') {
      setMode('demo')
      setStep('scenarios')
    }
  }, [])

  useEffect(() => {
    if (step === 'compare') syncRoute({ view: 'compare' })
    else if (step === 'scenarios') syncRoute({ view: null, mode })
    else if (step === 'hero') syncRoute({ view: null, mode: null })
  }, [step, mode])

  const runScenario = async (scenarioId) => {
    if (isAiMode && !hasApiKey()) {
      setPendingScenario({ scenarioId })
      setStep('custom-ai')
      return
    }

    setAnalyzing(true)
    setStreamSteps([])
    setStreamLive('')
    setStreamingIsAi(isAiMode)
    setAnalyzeError(null)
    setPendingScenario(isAiMode ? { scenarioId } : null)
    setStep('analyzing')
    try {
      const llmConfig = isAiMode ? getLlmConfig() : null
      const data = await analyzeScenarioStream(scenarioId, onStep, llmConfig, onToken)
      setResult(data)
      setStep('result')
      setPendingScenario(null)
    } catch (err) {
      if (isAiMode) {
        setAnalyzeError({ message: err.message })
        setStep('error')
      } else {
        throw err
      }
    } finally {
      setAnalyzing(false)
      setStreamSteps([])
      setStreamLive('')
    }
  }

  const runCustom = async (symptom, image, llmConfig) => {
    const useAi = isAiMode || !!llmConfig.apiKey?.trim()
    setAnalyzing(true)
    setStreamSteps([])
    setStreamLive('')
    setStreamingIsAi(useAi)
    setAnalyzeError(null)
    setPendingCustom({ symptom, image, llmConfig })
    setStep('analyzing')
    try {
      const data = await analyzeCustomStream(symptom, image, llmConfig, onStep, onToken)
      setResult(data)
      setStep('result')
      setPendingCustom(null)
      if (pendingScenario && !symptom) {
        setPendingScenario(null)
      }
    } catch (err) {
      setAnalyzeError({ message: err.message })
      setStep('error')
    } finally {
      setAnalyzing(false)
      setStreamSteps([])
      setStreamLive('')
    }
  }

  const runDemoFallback = async () => {
    if (pendingScenario) {
      const { scenarioId } = pendingScenario
      setAnalyzing(true)
      setStreamSteps([])
      setStreamLive('')
      setStreamingIsAi(false)
      setAnalyzeError(null)
      setMode('demo')
      setStep('analyzing')
      try {
        const data = await analyzeScenarioStream(scenarioId, onStep, null)
        setResult(data)
        setStep('result')
        setPendingScenario(null)
      } finally {
        setAnalyzing(false)
        setStreamSteps([])
        setStreamLive('')
      }
      return
    }

    if (!pendingCustom) return
    const { symptom, image } = pendingCustom
    setAnalyzing(true)
    setStreamSteps([])
    setStreamLive('')
    setStreamingIsAi(false)
    setAnalyzeError(null)
    setMode('demo')
    setStep('analyzing')
    const mock = buildCustomResult(symptom, image)
    for (const text of mock.reasoning_steps) {
      onStep(text)
      await new Promise((r) => setTimeout(r, 400))
    }
    setResult(mock)
    setStep('result')
    setPendingCustom(null)
    setAnalyzing(false)
    setStreamSteps([])
    setStreamLive('')
  }

  const reset = () => {
    setStep('hero')
    setMode('demo')
    setResult(null)
    setStreamSteps([])
    setStreamLive('')
    setStreamingIsAi(false)
    setAnalyzing(false)
    setAnalyzeError(null)
    setPendingCustom(null)
    setPendingScenario(null)
  }

  const showBanner = ['scenarios', 'custom', 'custom-ai', 'analyzing'].includes(step)

  if (step === 'compare') {
    return <CompareView onBack={reset} />
  }

  if (step === 'error' && analyzeError) {
    return (
      <AnalyzeErrorView
        error={analyzeError}
        onRetry={() => {
          if (pendingCustom) {
            runCustom(pendingCustom.symptom, pendingCustom.image, pendingCustom.llmConfig)
          } else if (pendingScenario) {
            runScenario(pendingScenario.scenarioId)
          }
        }}
        onDemo={runDemoFallback}
        onBack={reset}
      />
    )
  }

  if (step === 'result' && result) {
    return <ResultCard result={result} onReset={reset} />
  }

  if (step === 'analyzing') {
    return (
      <>
        {showBanner && <ModeBanner mode={mode} />}
        <div className={showBanner ? 'pt-8' : ''}>
          <StreamingOverlay steps={streamSteps} isAi={streamingIsAi} liveText={streamLive} />
        </div>
      </>
    )
  }

  return (
    <>
      {showBanner && <ModeBanner mode={mode} />}
      <div className={showBanner ? 'pt-8' : ''}>
        <Hero
          onDemo={() => { setMode('demo'); setStep('scenarios') }}
          onAi={() => { setMode('ai'); setStep('scenarios') }}
          onCompare={() => setStep('compare')}
        />
        {step === 'scenarios' && (
          <ScenarioPicker
            scenarios={SCENARIOS}
            onSelect={runScenario}
            onCustom={() => setStep(isAiMode ? 'custom-ai' : 'custom')}
            onConfigureKey={isAiMode ? () => setStep('custom-ai') : undefined}
            onClose={reset}
            loading={analyzing}
            aiMode={isAiMode}
          />
        )}
        {(step === 'custom' || step === 'custom-ai') && (
          <CustomInput
            aiMode={step === 'custom-ai'}
            initialSymptom={
              pendingScenario
                ? SCENARIOS.find((s) => s.id === pendingScenario.scenarioId)?.symptom ?? ''
                : ''
            }
            initialImage={
              pendingScenario
                ? SCENARIOS.find((s) => s.id === pendingScenario.scenarioId)?.image ?? null
                : null
            }
            onSubmit={runCustom}
            onBack={() => {
              if (pendingScenario && step === 'custom-ai') {
                setStep('scenarios')
              } else {
                setStep(step === 'custom-ai' ? 'scenarios' : 'scenarios')
              }
            }}
            loading={analyzing}
          />
        )}
      </div>
    </>
  )
}
