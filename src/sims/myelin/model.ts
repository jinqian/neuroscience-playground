/**
 * How fast does a nerve impulse travel? Teaching approximations, not exact physiology:
 *
 * - Bare (unmyelinated) axon: speed grows with the square root of its diameter.
 *   velocity ≈ 1.1 × √d   (m/s, d in micrometres)
 * - Myelinated axon: the signal jumps between gaps in the myelin (nodes of Ranvier),
 *   so speed grows in proportion to diameter (Hursh's factor of about 6).
 *   velocity ≈ 6 × d
 * - Demyelination (as in multiple sclerosis or Guillain-Barré) strips some segments.
 *   Here we blend the two speeds by the fraction lost, and treat 60 % or more as a
 *   conduction block. Real demyelination is patchy and messier than this.
 */

export type AxonParams = {
  diameterUm: number // 0.5–20 µm
  myelinated: boolean
  demyelinatedFraction: number // 0–1: share of the myelin that is damaged
}

export const BLOCK_AT = 0.6
export const GOAL_MS = 20

const bareSpeed = (d: number) => 1.1 * Math.sqrt(d)
const myelinSpeed = (d: number) => 6 * d

/** Conduction speed in m/s, or null when the signal can't get through. */
export function velocity({ diameterUm: d, myelinated, demyelinatedFraction: f }: AxonParams): number | null {
  if (!myelinated) return bareSpeed(d)
  if (f >= BLOCK_AT) return null
  return myelinSpeed(d) * (1 - f) + bareSpeed(d) * f
}

/** Milliseconds for the impulse to travel `distanceM` metres (spinal cord to big toe ≈ 1 m). */
export function travelTimeMs(p: AxonParams, distanceM = 1.0): number | null {
  const v = velocity(p)
  return v === null ? null : (distanceM / v) * 1000
}

/** The lab's goal: a healthy myelinated axon that reaches the toe in under 20 ms. */
export function goalMet(p: AxonParams): boolean {
  const ms = travelTimeMs(p)
  return p.myelinated && p.demyelinatedFraction === 0 && ms !== null && ms < GOAL_MS
}
