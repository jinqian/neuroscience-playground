import { describe, expect, test } from 'vitest'
import { GOAL_MS, goalMet, travelTimeMs, velocity } from './model'

const axon = (diameterUm: number, myelinated: boolean, demyelinatedFraction = 0) => ({ diameterUm, myelinated, demyelinatedFraction })

describe('myelin model', () => {
  test('a thin bare axon is slow: about 1.1 m/s at 1 µm', () => {
    expect(velocity(axon(1, false))).toBeCloseTo(1.1, 5)
  })
  test('a myelinated 10 µm axon conducts at 60 m/s', () => {
    expect(velocity(axon(10, true))).toBe(60)
  })
  test('1 m at 60 m/s takes about 16.7 ms', () => {
    expect(travelTimeMs(axon(10, true))).toBeCloseTo(16.67, 1)
  })
  test('the goal needs a thick, healthy myelinated axon', () => {
    expect(GOAL_MS).toBe(20)
    expect(goalMet(axon(10, true))).toBe(true)
    expect(goalMet(axon(3, true))).toBe(false)
    expect(travelTimeMs(axon(3, true))).toBeCloseTo(55.6, 1)
    expect(goalMet(axon(20, false))).toBe(false)
  })
  test('heavy demyelination blocks conduction', () => {
    expect(velocity(axon(10, true, 0.6))).toBeNull()
    expect(travelTimeMs(axon(10, true, 0.6))).toBeNull()
    expect(goalMet(axon(20, true, 0.6))).toBe(false)
  })
  test('partial demyelination slows the signal to between bare and healthy', () => {
    const v = velocity(axon(10, true, 0.3))!
    expect(v).toBeLessThan(60)
    expect(v).toBeGreaterThan(velocity(axon(10, false))!)
  })
  test('any demyelination misses the goal', () => {
    expect(goalMet(axon(20, true, 0.1))).toBe(false)
  })
})
