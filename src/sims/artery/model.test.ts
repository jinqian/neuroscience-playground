import { describe, expect, test } from 'vitest'
import { allSolved, blockAt, PATIENTS, type ArteryState } from './model'

const start: ArteryState = { index: 0, solved: [] }

describe('block-an-artery model', () => {
  test('PATIENTS match the spec', () => {
    expect(PATIENTS.map((p) => [p.id, p.artery, p.side])).toEqual([['p1', 'aca', 'right'], ['p2', 'pca', 'left'], ['p3', 'mca', 'left']])
  })

  test('the right artery and side solves the patient and moves on', () => {
    const r = blockAt(start, 'aca', 'right')
    expect(r).toEqual({ state: { index: 1, solved: ['p1'] }, correct: true, miss: null })
  })

  test('the right artery on the wrong side is a side miss', () => {
    expect(blockAt(start, 'aca', 'left').miss).toBe('side')
  })

  test('a wrong artery is an artery miss whatever the side', () => {
    expect(blockAt(start, 'mca', 'right').miss).toBe('artery')
    expect(blockAt(start, 'pca', 'left').miss).toBe('artery')
  })

  test('a miss changes nothing', () => {
    const r = blockAt(start, 'mca', 'left')
    expect(r.state).toBe(start)
    expect(r.correct).toBe(false)
  })

  test('after all three, more picks change nothing', () => {
    let s = start
    for (const p of PATIENTS) s = blockAt(s, p.artery, p.side).state
    expect(allSolved(s)).toBe(true)
    const r = blockAt(s, 'mca', 'left')
    expect(r.state).toBe(s)
    expect(r.correct).toBe(false)
    expect(r.miss).toBeNull()
  })
})
