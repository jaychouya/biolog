import { COMPARE_SYMPTOM, IMAGE_MALATANG } from './scenarios'

export const COMPARE_SNAPSHOT_META = {
  provider: 'OpenAI',
  model: 'gpt-4o',
  recordedAt: '2026-06-22',
}

export const COMPARE_SNAPSHOT = {
  textOnly: {
    user_symptom: COMPARE_SYMPTOM,
    primary_cause: '睡眠不足叠加轻度脱水，饮食因素不确定',
    confidence_score: 63,
    primary_action: '今晚提前 1 小时入睡，并补充 500ml 温水',
    photo_insights: null,
    evidence_chain: [
      '症状：头疼、疲劳，信息维度较少',
      '无餐食图像，无法判断钠/辣摄入',
      '常见关联：睡眠 <6h 与日间头痛相关',
    ],
  },
  withImage: {
    user_symptom: COMPARE_SYMPTOM,
    primary_cause: '高盐辛辣晚餐 + 睡眠不足',
    confidence_score: 84,
    primary_action: '立即喝 500ml 温水，今晚少盐早睡',
    photo_insights: ['红油辣汤底色', '加工肉制品偏咸', '汤底钠含量可能偏高'],
    photo_annotations: [
      { x: 18, y: 28, w: 64, h: 44, label: '红油汤底' },
      { x: 32, y: 52, w: 36, h: 22, label: '高钠食材' },
    ],
    image: IMAGE_MALATANG,
    evidence_chain: [
      '症状：头疼、疲劳',
      '图像：麻辣烫、红油汤底、高钠配菜',
      '关联：高盐→体液流失→头痛加重',
      '睡眠因素仍可能叠加影响',
    ],
  },
}
