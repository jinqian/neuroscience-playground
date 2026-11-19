import type { Question } from '../../content/schema'
import type { Response } from '../../engine/check'

export type QProps<K extends Question['kind']> = {
  question: Extract<Question, { kind: K }>
  response: Response | undefined
  onChange(r: Response): void
  /** True once the answer was checked. */
  disabled: boolean
  result?: 'correct' | 'wrong'
}

/** Whether a response is complete enough to check. */
export function isComplete(q: Question, r: Response | undefined): boolean {
  if (!r) return false
  switch (q.kind) {
    case 'mc':
    case 'gap':
      return 'optionId' in r
    case 'order':
      return 'order' in r
    case 'match':
      return 'pairs' in r && q.pairs.every((p) => r.pairs[p.id])
    case 'termmatch':
      return 'pairs' in r && q.terms.every((id) => r.pairs[id])
    case 'tfwhy':
      return 'value' in r && !!r.reasonId
    case 'tap2d':
      return 'regionId' in r
    case 'tap3d':
      return 'structureId' in r
  }
}
