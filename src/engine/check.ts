import type { Question } from '../content/schema'

export type Response =
  | { optionId: string }
  | { order: string[] }
  | { pairs: Record<string, string> }
  | { value: boolean; reasonId: string }
  | { regionId: string }
  | { structureId: string }

function allSelfPaired(ids: string[], pairs: Record<string, string>): boolean {
  return ids.every((id) => pairs[id] === id)
}

export function isCorrect(q: Question, r: Response): boolean {
  switch (q.kind) {
    case 'mc':
    case 'gap':
      return 'optionId' in r && r.optionId === q.answer
    case 'order':
      return 'order' in r && r.order.length === q.steps.length && q.steps.every((s, i) => r.order[i] === s.id)
    case 'match':
      return 'pairs' in r && allSelfPaired(q.pairs.map((p) => p.id), r.pairs)
    case 'termmatch':
      return 'pairs' in r && allSelfPaired(q.terms, r.pairs)
    case 'tfwhy':
      return 'value' in r && r.value === q.isTrue && r.reasonId === q.answerReason
    case 'tap2d':
      return 'regionId' in r && r.regionId === q.answer
    case 'tap3d':
      return 'structureId' in r && r.structureId === q.structure
  }
}
