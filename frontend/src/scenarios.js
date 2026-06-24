const MALATANG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect fill="#1a1a2e" width="400" height="300"/>
  <ellipse cx="200" cy="150" rx="120" ry="80" fill="#c0392b" opacity="0.8"/>
  <text x="200" y="140" text-anchor="middle" fill="#fff" font-size="24" font-family="sans-serif">麻辣烫</text>
  <text x="200" y="170" text-anchor="middle" fill="#e74c3c" font-size="14" font-family="sans-serif">高盐 · 辛辣</text>
</svg>`

const TEA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect fill="#1a1a2e" width="400" height="300"/>
  <rect x="130" y="80" width="140" height="180" rx="12" fill="#d4a574" opacity="0.9"/>
  <ellipse cx="200" cy="80" rx="70" ry="15" fill="#8b6914"/>
  <circle cx="200" cy="60" r="25" fill="#f5e6d3"/>
  <text x="200" y="250" text-anchor="middle" fill="#fff" font-size="22" font-family="sans-serif">珍珠奶茶</text>
  <text x="200" y="275" text-anchor="middle" fill="#e8b86d" font-size="13" font-family="sans-serif">高糖 · 奶盖</text>
</svg>`

export const IMAGE_MALATANG = `data:image/svg+xml,${encodeURIComponent(MALATANG_SVG)}`
export const IMAGE_TEA = `data:image/svg+xml,${encodeURIComponent(TEA_SVG)}`

export const SCENARIOS = [
  {
    id: 'headache-malatang',
    emoji: '🤕',
    title: '头疼 · 昨晚吃了麻辣烫',
    subtitle: '有餐食照片',
    symptom: '我头疼，有点疲劳',
    image: IMAGE_MALATANG,
    mock: {
      user_symptom: '我头疼，有点疲劳',
      primary_cause: '高盐饮食 + 睡眠不足',
      confidence_score: 87,
      primary_action: '立即喝 500ml 温水',
      extra_suggestions: '今晚提前1小时睡，明日饮食少盐',
      photo_insights: ['辛辣红油汤底', '高钠加工肉制品', '汤底含盐量偏高'],
      photo_annotations: [
        { x: 18, y: 28, w: 64, h: 44, label: '红油汤底' },
        { x: 32, y: 52, w: 36, h: 22, label: '高钠食材' },
      ],
      evidence_chain: [
        '19:30 晚餐：麻辣烫（高盐）',
        '图像识别：辛辣汤底 + 高钠食材',
        '23:00 睡眠：仅 4.2 小时',
      ],
      reasoning_steps: [
        '读懂症状：头疼、疲劳',
        '分析照片：识别麻辣烫、红油汤底',
        '建立关联：高盐摄入可能导致脱水',
        '脱水与睡眠不足共同加重头痛',
      ],
      confidence_without_image: 65,
      counterfactual_note: '若不上传照片，把握度约从 87% 降至 65%',
      inference_graph: {
        nodes: [
          { id: 'photo', label: '麻辣烫照片', type: 'input' },
          { id: 'salt', label: '高盐摄入', type: 'factor' },
          { id: 'dehydration', label: '脱水', type: 'factor' },
          { id: 'sleep', label: '睡眠不足', type: 'factor' },
          { id: 'headache', label: '头痛', type: 'outcome' },
        ],
        edges: [
          { source: 'photo', target: 'salt' },
          { source: 'salt', target: 'dehydration' },
          { source: 'dehydration', target: 'headache' },
          { source: 'sleep', target: 'headache' },
        ],
      },
    },
  },
  {
    id: 'bloating-tea',
    emoji: '🫃',
    title: '胃胀 · 下午喝了奶茶',
    subtitle: '有餐食照片',
    symptom: '肚子胀，感觉有点腻',
    image: IMAGE_TEA,
    mock: {
      user_symptom: '肚子胀，感觉有点腻',
      primary_cause: '高糖饮食 + 进食过晚',
      confidence_score: 82,
      primary_action: '今晚清淡饮食，睡前3小时不再进食',
      extra_suggestions: '明天早餐前避免含糖饮料，多喝温水',
      photo_insights: ['厚奶盖层', '珍珠 + 高糖糖浆', '大杯含糖量约 50g+'],
      photo_annotations: [
        { x: 28, y: 12, w: 44, h: 18, label: '厚奶盖' },
        { x: 35, y: 55, w: 30, h: 35, label: '珍珠糖浆' },
      ],
      evidence_chain: [
        '15:00 下午茶：珍珠奶茶（高糖）',
        '图像识别：厚奶盖 + 珍珠配料',
        '高糖 + 乳糖可能减缓胃排空',
      ],
      reasoning_steps: [
        '读懂症状：胃胀、腻',
        '分析照片：识别奶茶、奶盖、珍珠',
        '高糖摄入可能减缓胃排空',
        '推断与当前胃胀症状的关联',
      ],
      confidence_without_image: 68,
      counterfactual_note: '若不上传照片，把握度约从 82% 降至 68%',
      inference_graph: {
        nodes: [
          { id: 'photo', label: '奶茶照片', type: 'input' },
          { id: 'sugar', label: '高糖摄入', type: 'factor' },
          { id: 'digest', label: '胃排空延迟', type: 'factor' },
          { id: 'bloating', label: '胃胀', type: 'outcome' },
        ],
        edges: [
          { source: 'photo', target: 'sugar' },
          { source: 'sugar', target: 'digest' },
          { source: 'digest', target: 'bloating' },
        ],
      },
    },
  },
  {
    id: 'fatigue-none',
    emoji: '😴',
    title: '疲劳 · 没拍照片',
    subtitle: '仅文字描述',
    symptom: '这两天特别累，提不起精神',
    image: null,
    mock: {
      user_symptom: '这两天特别累，提不起精神',
      primary_cause: '睡眠不足 + 连续久坐',
      confidence_score: 62,
      primary_action: '今晚提前 1 小时入睡',
      extra_suggestions: '每小时起身活动 5 分钟，下午避免咖啡因',
      photo_insights: null,
      evidence_chain: [
        '症状描述：持续疲劳、精神不振',
        '缺少饮食图像，无法分析摄入因素',
        '常见关联：睡眠 < 6h 易导致日间疲劳',
      ],
      reasoning_steps: [
        '读懂症状：持续疲劳、精神不振',
        '无餐食照片，信息有限',
        '匹配睡眠与久坐相关模式',
        '生成生活方式关联建议',
      ],
      inference_graph: {
        nodes: [
          { id: 'symptom', label: '疲劳', type: 'input' },
          { id: 'sleep', label: '睡眠不足', type: 'factor' },
          { id: 'sedentary', label: '久坐', type: 'factor' },
          { id: 'fatigue', label: '精神不振', type: 'outcome' },
        ],
        edges: [
          { source: 'symptom', target: 'fatigue' },
          { source: 'sleep', target: 'fatigue' },
          { source: 'sedentary', target: 'fatigue' },
        ],
      },
    },
  },
]

export const MOCK_WITH_IMAGE = SCENARIOS[0].mock
export const MOCK_TEXT_ONLY = SCENARIOS[2].mock

export const COMPARE_SYMPTOM = SCENARIOS[0].symptom

export const COMPARE_TEXT_ONLY = {
  user_symptom: COMPARE_SYMPTOM,
  primary_cause: '睡眠不足 + 轻度脱水',
  confidence_score: 65,
  primary_action: '今晚提前1小时入睡',
  extra_suggestions: '喝500ml温水，减少屏幕时间',
  photo_insights: null,
  evidence_chain: [
    '症状描述：头疼、疲劳',
    '缺少饮食图像，无法分析钠摄入',
    '常见关联：睡眠 < 6h 易引发头痛',
  ],
  inference_graph: SCENARIOS[2].mock.inference_graph,
}

export const COMPARE_WITH_IMAGE = SCENARIOS[0].mock

function pickScenarioId(symptom, hasImage) {
  if (/胃|胀|腻|肚子|恶心|反酸/.test(symptom)) return 'bloating-tea'
  if (/头|疼|痛|晕/.test(symptom)) return hasImage ? 'headache-malatang' : 'fatigue-none'
  if (/累|疲|困|没精神|失眠|睡不着/.test(symptom)) return 'fatigue-none'
  return hasImage ? 'headache-malatang' : 'fatigue-none'
}

export function buildCustomResult(symptom, image) {
  const hasImage = !!image
  const id = pickScenarioId(symptom, hasImage)
  const scenario = SCENARIOS.find((s) => s.id === id)
  const base = scenario.mock

  return {
    ...base,
    user_symptom: symptom,
    is_custom: true,
    matched_scenario: scenario.title,
    image: hasImage ? image : null,
    confidence_score: Math.max(base.confidence_score - (hasImage ? 5 : 12), 52),
    confidence_without_image: hasImage
      ? Math.max((base.confidence_without_image || base.confidence_score - 22) - 5, 52)
      : null,
    counterfactual_note: hasImage
      ? `若不上传照片，把握度约降至 ${Math.max((base.confidence_without_image || 65) - 5, 52)}%`
      : null,
    reasoning_steps: hasImage
      ? [
          `读懂症状：${symptom}`,
          '分析餐食照片特征...',
          '建立饮食与症状的关联',
          '综合推断可能的生活方式因素',
        ]
      : [
          `读懂症状：${symptom}`,
          '缺少照片，仅基于文字推断',
          '匹配常见生活方式关联模式',
          '生成演示级分析结论',
        ],
    photo_insights: hasImage
      ? ['已收到餐食照片', ...(base.photo_insights || []).slice(1)]
      : null,
    evidence_chain: [
      `你的描述：${symptom}`,
      hasImage ? '已上传餐食照片，纳入分析' : '未提供照片，仅基于文字推断',
      ...base.evidence_chain.slice(1),
    ],
  }
}
