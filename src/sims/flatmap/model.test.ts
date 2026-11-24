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
  test('a part next to its partner at the same level is told to use the spot beside it', () => {
    expect(place({}, 'cerebellum', 'pons').hint).toBe('beside')
    expect(place({}, 'hypothalamus', 'thalamus').hint).toBe('beside')
  })
  test("a lobe in another lobe's spot gets a hint about where each lobe goes", () => {
    expect(place({}, 'frontal', 'occipital').hint).toBe('lobe')
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
