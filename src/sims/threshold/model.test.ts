import { describe, expect, test } from 'vitest'
import { minimumFiringStimulus, PEAK, REST, simulate } from './model'

describe('threshold model', () => {
  test('14 mV stays below threshold, 15 mV fires', () => {
    expect(simulate(14).fired).toBe(false)
    expect(simulate(15).fired).toBe(true)
  })
  test('a spike peaks near +40 mV', () => {
    const max = Math.max(...simulate(20).trace.map(([, v]) => v))
    expect(max).toBeGreaterThan(PEAK - 1)
    expect(max).toBeLessThan(PEAK + 1)
  })
  test('a subthreshold bump is back near rest by 25 ms', () => {
    const late = simulate(10).trace.filter(([t]) => t >= 25)
    expect(late.length).toBeGreaterThan(0)
    for (const [, v] of late) expect(Math.abs(v - REST)).toBeLessThan(1)
  })
  test('a spike is the same height whatever the stimulus (all-or-none)', () => {
    const peak = (s: number) => Math.max(...simulate(s).trace.map(([, v]) => v))
    expect(peak(16)).toBeCloseTo(peak(30), 0)
  })
  test('the smallest firing stimulus is 15 mV', () => {
    expect(minimumFiringStimulus()).toBe(15)
  })
})
