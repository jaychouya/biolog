import { SCENARIOS } from './scenarios'
import { COMPARE_SNAPSHOT } from './compareSnapshot'

export async function analyzeBoth() {
  await new Promise((r) => setTimeout(r, 600))
  return {
    textOnly: { ...COMPARE_SNAPSHOT.textOnly },
    withImage: { ...COMPARE_SNAPSHOT.withImage },
    isSnapshot: true,
  }
}

export { SCENARIOS }
