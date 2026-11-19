import { describe, expect, test } from 'vitest'
import type { Bite, Question } from '../content/schema'
import { isCorrect } from './check'
import { advance, answer, bitePlan, startRun } from './lessonRun'
import { XP } from './xp'

const t = (en: string) => ({ en })
const opt = (id: string) => ({ id, text: t(id) })

const Q: Record<string, Question> = {
  mc: { id: 'q', kind: 'mc', prompt: t('p'), options: [opt('a'), opt('b')], answer: 'a', explain: t('e') },
  gap: { id: 'q', kind: 'gap', prompt: t('p ___'), options: [opt('a'), opt('b')], answer: 'b', explain: t('e') },
  order: { id: 'q', kind: 'order', prompt: t('p'), steps: [opt('s1'), opt('s2'), opt('s3')], explain: t('e') },
  match: { id: 'q', kind: 'match', prompt: t('p'), pairs: ['p1', 'p2', 'p3'].map((id) => ({ id, left: t(id), right: t(id) })), explain: t('e') },
  tfwhy: { id: 'q', kind: 'tfwhy', statement: t('s'), isTrue: false, reasons: [opt('r1'), opt('r2')], answerReason: 'r2', explain: t('e') },
  tap2d: { id: 'q', kind: 'tap2d', prompt: t('p'), figure: 'f', answer: 'soma', explain: t('e') },
  tap3d: { id: 'q', kind: 'tap3d', prompt: t('p'), structure: 'cerebellum', explain: t('e') },
  termmatch: { id: 'q', kind: 'termmatch', terms: ['x', 'y', 'z'], from: 'en', to: 'fr' },
}

describe('isCorrect', () => {
  const cases: Array<[string, unknown, unknown]> = [
    ['mc', { optionId: 'a' }, { optionId: 'b' }],
    ['gap', { optionId: 'b' }, { optionId: 'a' }],
    ['order', { order: ['s1', 's2', 's3'] }, { order: ['s2', 's1', 's3'] }],
    ['match', { pairs: { p1: 'p1', p2: 'p2', p3: 'p3' } }, { pairs: { p1: 'p2', p2: 'p1', p3: 'p3' } }],
    ['tfwhy', { value: false, reasonId: 'r2' }, { value: false, reasonId: 'r1' }],
    ['tap2d', { regionId: 'soma' }, { regionId: 'axon' }],
    ['tap3d', { structureId: 'cerebellum' }, { structureId: 'brainstem' }],
    ['termmatch', { pairs: { x: 'x', y: 'y', z: 'z' } }, { pairs: { x: 'y', y: 'x', z: 'z' } }],
  ]
  test.each(cases)('%s right and wrong', (kind, right, wrong) => {
    expect(isCorrect(Q[kind], right as never)).toBe(true)
    expect(isCorrect(Q[kind], wrong as never)).toBe(false)
  })
  test('match with a missing pair is wrong', () => {
    expect(isCorrect(Q.match, { pairs: { p1: 'p1', p2: 'p2' } })).toBe(false)
  })
  test('tfwhy with the wrong truth value is wrong', () => {
    expect(isCorrect(Q.tfwhy, { value: true, reasonId: 'r2' })).toBe(false)
  })
})

describe('lesson run', () => {
  const bite: Bite = {
    id: 'b', type: 'bite', title: t('B'), sources: [],
    cards: [{ id: 'c1', body: t('card') }],
    questions: [{ ...Q.mc, id: 'q1' }, { ...Q.mc, id: 'q2' }],
  }

  test('bitePlan puts cards before questions', () => {
    const s = startRun(bitePlan(bite))
    expect(s.steps).toEqual([{ kind: 'card', id: 'c1' }, { kind: 'question', id: 'q1' }, { kind: 'question', id: 'q2' }])
    expect(s.index).toBe(0)
    expect(s.done).toBe(false)
  })

  test('a wrong answer re-queues the question at the end and records the miss once', () => {
    let s = startRun(bitePlan(bite))
    s = advance(s)
    s = answer(s, 'q1', false)
    expect(s.steps).toHaveLength(4)
    expect(s.steps[3]).toEqual({ kind: 'question', id: 'q1' })
    expect(s.missed).toEqual(['q1'])
    expect(s.xp).toBe(0)
    s = advance(s)
    s = answer(s, 'q2', true)
    s = advance(s)
    s = answer(s, 'q1', false)
    expect(s.missed).toEqual(['q1'])
    expect(s.steps).toHaveLength(5)
    s = advance(s)
    s = answer(s, 'q1', true)
    expect(s.xp).toBe(2 * XP.correct)
    expect(s.correct.q1).toBe(true)
    expect(s.attempts.q1).toBe(3)
  })

  test('advancing past the last step finishes the run', () => {
    let s = startRun(bitePlan(bite))
    s = advance(advance(advance(s)))
    expect(s.done).toBe(true)
  })

  test('XP constants match the spec', () => {
    expect(XP).toEqual({ correct: 10, labGoal: 20, caseSolved: 50 })
  })
})
