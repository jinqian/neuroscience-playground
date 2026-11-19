import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { addDays, localDay } from './dates'
import { recordActivity } from './streak'

describe('local calendar days (Review Focus 3)', () => {
  const original = process.env.TZ
  beforeAll(() => { process.env.TZ = 'Pacific/Auckland' })
  afterAll(() => { process.env.TZ = original })

  test('a 23:30 lesson and a 00:10 lesson the next local day give streak 2', () => {
    const late = new Date('2026-11-19T10:30:00Z') // 23:30 in Auckland (UTC+13)
    const early = new Date('2026-11-19T11:10:00Z') // 00:10 next day in Auckland
    expect(localDay(late)).toBe('2026-11-19')
    expect(localDay(early)).toBe('2026-11-20')
    let s = recordActivity({ current: 0, lastDay: null }, localDay(late))
    s = recordActivity(s, localDay(early))
    expect(s.current).toBe(2)
  })
})

test('addDays crosses month ends', () => {
  expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
  expect(addDays('2026-12-31', 16)).toBe('2027-01-16')
})
