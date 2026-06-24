const API_BASE = import.meta.env.VITE_API_URL || '/api'
const MOCK_DELAY_MS = 400

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function llmPayload(symptom, image, llmConfig) {
  return {
    symptom,
    image: image || null,
    api_key: llmConfig.apiKey?.trim(),
    provider: llmConfig.provider || 'openai',
    model: llmConfig.model?.trim() || null,
    base_url: llmConfig.baseUrl?.trim() || null,
  }
}

async function streamSteps(steps, onStep) {
  for (const text of steps) {
    onStep(text)
    await delay(MOCK_DELAY_MS)
  }
}

function parseSSEChunk(chunk, onEvent) {
  for (const line of chunk.split('\n')) {
    if (!line.startsWith('data: ')) continue
    try {
      onEvent(JSON.parse(line.slice(6)))
    } catch {
      /* partial */
    }
  }
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`)
    return res.ok
  } catch {
    return false
  }
}

export async function testConnection(llmConfig) {
  const res = await fetch(`${API_BASE}/test-connection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: llmConfig.apiKey?.trim(),
      provider: llmConfig.provider || 'openai',
      base_url: llmConfig.baseUrl?.trim() || null,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || '连接失败')
  return data
}

export async function analyzeOnce(symptom, image, llmConfig) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(llmPayload(symptom, image, llmConfig)),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'API 调用失败')
  return { ...data, image: image || null }
}

export async function analyzeCompareAI(llmConfig, onProgress) {
  const { COMPARE_SYMPTOM, IMAGE_MALATANG } = await import('./scenarios')
  onProgress?.('并行运行：纯文本 vs 多模态...')
  const [textOnly, withImage] = await Promise.all([
    analyzeOnce(COMPARE_SYMPTOM, null, llmConfig),
    analyzeOnce(COMPARE_SYMPTOM, IMAGE_MALATANG, llmConfig),
  ])
  return { textOnly, withImage, is_ai: true }
}

export async function analyzeScenarioStream(scenarioId, onStep, llmConfig = null, onToken) {
  const { SCENARIOS } = await import('./scenarios')
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)
  if (!scenario) throw new Error('场景不存在')

  if (llmConfig?.apiKey?.trim()) {
    const result = await analyzeCustomStream(scenario.symptom, scenario.image, llmConfig, onStep, onToken)
    return {
      ...result,
      scenario_id: scenario.id,
      scenario_title: scenario.title,
      image: scenario.image ?? result.image,
    }
  }

  const steps = scenario.mock.reasoning_steps || [
    '连接演示推理引擎...',
    `读懂症状：${scenario.symptom}`,
    '匹配生活方式关联...',
    '生成分析结论',
  ]
  await streamSteps(steps, onStep)

  return {
    ...scenario.mock,
    scenario_id: scenario.id,
    scenario_title: scenario.title,
    image: scenario.image,
  }
}

export async function analyzeCustomStream(symptom, image, llmConfig, onStep, onToken) {
  const hasKey = !!llmConfig.apiKey?.trim()

  if (hasKey) {
    const res = await fetch(`${API_BASE}/analyze/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(llmPayload(symptom, image, llmConfig)),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'API 调用失败')
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let result = null
    let seenSteps = new Set()

    const handleEvent = (ev) => {
      if (ev.type === 'token') onToken?.(ev.text)
      if (ev.type === 'step' && !seenSteps.has(ev.text)) {
        seenSteps.add(ev.text)
        onStep(ev.text)
      }
      if (ev.type === 'done') result = { ...ev.data, image: image || null }
      if (ev.type === 'error') throw new Error(ev.message)
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''
      for (const part of parts) {
        parseSSEChunk(part, handleEvent)
      }
    }
    if (buffer) parseSSEChunk(buffer, handleEvent)
    if (!result) throw new Error('未收到完整分析结果')
    return result
  }

  const { buildCustomResult } = await import('./scenarios')
  const mock = buildCustomResult(symptom, image)
  await streamSteps(mock.reasoning_steps, onStep)
  return mock
}
