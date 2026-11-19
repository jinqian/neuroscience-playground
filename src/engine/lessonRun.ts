import type { Bite, Lab } from '../content/schema'
import { XP } from './xp'

export type Step = { kind: 'card'; id: string } | { kind: 'question'; id: string }

export type RunState = {
  steps: Step[]
  index: number
  attempts: Record<string, number>
  correct: Record<string, boolean>
  missed: string[]
  xp: number
  done: boolean
}

export function bitePlan(b: Bite): Step[] {
  return [
    ...b.cards.map((c) => ({ kind: 'card' as const, id: c.id })),
    ...b.questions.map((q) => ({ kind: 'question' as const, id: q.id })),
  ]
}

export function labReflectionPlan(l: Lab): Step[] {
  return l.reflection.map((q) => ({ kind: 'question' as const, id: q.id }))
}

export function startRun(steps: Step[]): RunState {
  return { steps, index: 0, attempts: {}, correct: {}, missed: [], xp: 0, done: steps.length === 0 }
}

/** Records an answer. A wrong answer sends the question to the back of the lesson. */
export function answer(s: RunState, questionId: string, correct: boolean): RunState {
  const attempts = { ...s.attempts, [questionId]: (s.attempts[questionId] ?? 0) + 1 }
  if (correct) {
    return { ...s, attempts, correct: { ...s.correct, [questionId]: true }, xp: s.xp + XP.correct }
  }
  return {
    ...s,
    attempts,
    steps: [...s.steps, { kind: 'question', id: questionId }],
    missed: s.missed.includes(questionId) ? s.missed : [...s.missed, questionId],
  }
}

export function advance(s: RunState): RunState {
  const index = s.index + 1
  return { ...s, index, done: index >= s.steps.length }
}
