import { describe, expect, test } from 'vitest'
import { back, canGoBack, emptyHistory, forward, leave, reviewing, type Page } from './history'

const c1: Page = { kind: 'card', id: 'c1' }
const q1: Page = { kind: 'question', id: 'q1', response: { optionId: 'a' }, result: 'correct' }

describe('history of pages seen', () => {
  test('back from live goes to the last page', () => {
    const h = back(leave(leave(emptyHistory, c1), q1))
    expect(h.at).toBe(1)
    expect(reviewing(h)).toEqual(q1)
  })

  test('back stops at the first page', () => {
    const h = back(back(back(leave(leave(emptyHistory, c1), q1))))
    expect(h.at).toBe(0)
    expect(canGoBack(h)).toBe(false)
  })

  test('forward past the last page returns to live', () => {
    const h = back(leave(leave(emptyHistory, c1), q1))
    expect(forward(h).at).toBeNull()
    expect(reviewing(forward(h))).toBeNull()
    expect(forward(back(h)).at).toBe(1)
  })

  test('a question answered twice is two pages', () => {
    const wrong: Page = { ...q1, response: { optionId: 'b' }, result: 'wrong' }
    const h = leave(leave(emptyHistory, wrong), q1)
    expect(h.pages).toHaveLength(2)
    expect(h.pages.map((p) => (p.kind === 'question' ? p.result : null))).toEqual(['wrong', 'correct'])
  })

  test('no history means no back', () => {
    expect(canGoBack(emptyHistory)).toBe(false)
    expect(canGoBack(leave(emptyHistory, c1))).toBe(true)
  })
})
