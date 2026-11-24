import { describe, expect, test } from 'vitest'
import { allPlaced, place, SLOTS, type Placed } from './model'

describe('flat map model', () => {
  test('a label on its own slot is placed', () => {
    expect(place({}, 'pons', 'pons')).toEqual({ placed: { pons: 'pons' }, correct: true, hint: null })
  })
  test('a label dropped too low is told to go higher, and nothing is stored', () => {
    const r = place({}, 'thalamus', 'medulla')
    expect(r.correct).toBe(false)
    expect(r.hint).toBe('higher')
    expect(r.placed).toEqual({})
  })
  test('a label dropped too high is told to go lower', () => {
    expect(place({}, 'medulla', 'thalamus').hint).toBe('lower')
  })
  test('a label on the wrong slot at its own level gets a same-level hint', () => {
    expect(place({}, 'cerebellum', 'pons').hint).toBe('same-level')
  })
  test('the goal needs all 11 slots', () => {
    const all = Object.fromEntries(SLOTS.map((s) => [s, s])) as Placed
    expect(SLOTS).toHaveLength(11)
    expect(allPlaced(all)).toBe(true)
    const ten = { ...all }
    delete ten.occipital
    expect(allPlaced(ten)).toBe(false)
  })
  test('place leaves its input untouched', () => {
    const before: Placed = {}
    place(before, 'pons', 'pons')
    expect(before).toEqual({})
  })
})
