import { describe, expect, test } from 'vitest'
import { allSolved, CASES, tapZone, type LesionState } from './model'

const start: LesionState = { index: 0, solved: [] }

describe('lesion localizer model', () => {
  test('six cases with their sides and answers', () => {
    expect(CASES.map((c) => [c.id, c.side, c.answer])).toEqual([
      ['c1', 'left', 'broca'],
      ['c2', 'left', 'wernicke'],
      ['c3', 'right', 'motor-strip'],
      ['c4', 'left', 'sensory-strip'],
      ['c5', 'right', 'parietal-association'],
      ['c6', 'right', 'cerebellum'],
    ])
  })
  test('the right zone solves the case and moves on', () => {
    expect(tapZone(start, 'broca')).toEqual({ state: { index: 1, solved: ['c1'] }, correct: true })
  })
  test('a wrong zone changes nothing', () => {
    expect(tapZone(start, 'wernicke')).toEqual({ state: start, correct: false })
  })
  test('solving all six finishes without running past the last case', () => {
    let s = start
    for (const c of CASES) s = tapZone(s, c.answer).state
    expect(allSolved(s)).toBe(true)
    expect(s.index).toBe(5)
    expect(tapZone(s, 'cerebellum').state).toEqual(s)
  })
})
