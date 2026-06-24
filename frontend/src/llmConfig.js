export const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', defaultModel: 'gpt-4o', visionModel: 'gpt-4o', supportsVision: true },
  { id: 'deepseek', name: 'DeepSeek', defaultModel: 'deepseek-chat', visionModel: 'deepseek-chat', supportsVision: false },
  { id: 'moonshot', name: 'Moonshot / Kimi', defaultModel: 'moonshot-v1-8k', visionModel: 'moonshot-v1-8k-vision-preview', supportsVision: true },
  { id: 'siliconflow', name: '硅基流动', defaultModel: 'deepseek-ai/DeepSeek-V3', visionModel: 'Qwen/Qwen2-VL-72B-Instruct', supportsVision: true },
  { id: 'custom', name: '自定义端点', defaultModel: 'gpt-4o', visionModel: 'gpt-4o', supportsVision: true, requiresBaseUrl: true },
]

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const STORAGE = 'biolog_llm_config'

const DEFAULT = {
  provider: 'moonshot',
  apiKey: '',
  model: '',
  baseUrl: '',
}

let cachedProviders = null

function mapProvider(p) {
  return {
    id: p.id,
    name: p.name,
    defaultModel: p.default_model || p.defaultModel,
    visionModel: p.vision_model || p.visionModel,
    supportsVision: p.supports_vision ?? p.supportsVision,
    requiresBaseUrl: p.requires_base_url ?? p.requiresBaseUrl ?? false,
  }
}

export async function loadProviders() {
  if (cachedProviders) return cachedProviders
  try {
    const res = await fetch(`${API_BASE}/providers`)
    if (res.ok) {
      const data = await res.json()
      cachedProviders = data.map(mapProvider)
      return cachedProviders
    }
  } catch {
    /* fallback */
  }
  cachedProviders = PROVIDERS
  return cachedProviders
}

export function getLlmConfig() {
  try {
    return { ...DEFAULT, ...JSON.parse(sessionStorage.getItem(STORAGE) || '{}') }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveLlmConfig(config) {
  sessionStorage.setItem(STORAGE, JSON.stringify(config))
}

export function getProvider(id, providers) {
  const list = providers?.length ? providers : PROVIDERS
  return list.find((p) => p.id === id) || list[0]
}

export function hasApiKey() {
  return !!getLlmConfig().apiKey?.trim()
}
