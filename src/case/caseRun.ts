import type { Case } from '../content/schema'
import { XP } from '../engine/xp'
import type { LText } from '../i18n/lang'

export type CaseState = {
  unlocked: Set<string>
  missed: string[]
  finalAttempts: number
  solved: boolean
  xp: number
  /** clue id → the id of the question that unlocks it */
  clueQuestion: Record<string, string>
}

export function startCase(c: Case): CaseState {
  return {
    unlocked: new Set(c.clues.filter((k) => !k.unlock).map((k) => k.id)),
    missed: [],
    finalAttempts: 0,
    solved: false,
    xp: 0,
    clueQuestion: Object.fromEntries(c.clues.flatMap((k) => (k.unlock ? [[k.id, k.unlock.id]] : []))),
  }
}

/** Answering a clue's question: right unlocks it (+10 XP); wrong records the miss once. */
export function unlockClue(s: CaseState, clueId: string, correct: boolean): CaseState {
  if (correct) return { ...s, unlocked: new Set([...s.unlocked, clueId]), xp: s.xp + XP.correct }
  const qid = s.clueQuestion[clueId] ?? clueId
  return { ...s, missed: s.missed.includes(qid) ? s.missed : [...s.missed, qid] }
}

export function canMakeFinalCall(c: Case, s: CaseState): boolean {
  return c.clues.every((k) => s.unlocked.has(k.id))
}

export function finalCall(c: Case, s: CaseState, pickedId: string): { state: CaseState; explanation: LText; correct: boolean } {
  const correct = pickedId === c.final.answer
  const state: CaseState = {
    ...s,
    finalAttempts: s.finalAttempts + 1,
    solved: s.solved || correct,
    xp: correct && !s.solved ? s.xp + XP.caseSolved : s.xp,
  }
  return { state, explanation: c.final.explanations[pickedId] ?? { en: '' }, correct }
}
