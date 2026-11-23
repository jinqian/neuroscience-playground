import { describe, expect, test } from 'vitest'
import { ANSWER, PRIMARY_OF, STAGES, VESICLES, allMatched, canMatch, drop, type Matches } from './model'

describe('unfolding model', () => {
  test('each secondary vesicle becomes its adult part', () => {
    expect(ANSWER).toEqual({
      telencephalon: 'hemispheres',
      diencephalon: 'thalamus-hypothalamus',
      mesencephalon: 'midbrain',
      metencephalon: 'pons-cerebellum',
      myelencephalon: 'medulla',
    })
  })

  test('each secondary vesicle comes from one of the three primary vesicles', () => {
    expect(PRIMARY_OF).toEqual({
      telencephalon: 'prosencephalon',
      diencephalon: 'prosencephalon',
      mesencephalon: 'mesencephalon',
      metencephalon: 'rhombencephalon',
      myelencephalon: 'rhombencephalon',
    })
  })

  test('a right drop is stored', () => {
    expect(drop({}, 'telencephalon', 'hemispheres')).toEqual({ matches: { telencephalon: 'hemispheres' }, correct: true })
  })

  test('a wrong drop is not stored', () => {
    const before: Matches = { diencephalon: 'thalamus-hypothalamus' }
    const r = drop(before, 'telencephalon', 'medulla')
    expect(r.correct).toBe(false)
    expect(r.matches).toEqual(before)
  })

  test('drop leaves its input untouched', () => {
    const before: Matches = {}
    drop(before, 'mesencephalon', 'midbrain')
    expect(before).toEqual({})
  })

  test('the goal needs all five matched', () => {
    const four: Matches = { ...ANSWER }
    delete four.myelencephalon
    expect(allMatched(four)).toBe(false)
    expect(allMatched({ ...ANSWER })).toBe(true)
  })

  test('matching opens only at the five-vesicle stage', () => {
    expect(STAGES.filter(canMatch)).toEqual(['five'])
    expect(VESICLES).toHaveLength(5)
  })
})
