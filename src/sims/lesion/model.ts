/**
 * Lesion localizer: read a patient's symptoms, tap where the damage must be.
 * The zones are textbook simplifications; real damage is rarely so neat.
 */

export const ZONES = ['prefrontal', 'motor-strip', 'broca', 'sensory-strip', 'parietal-association', 'wernicke', 'auditory', 'visual', 'cerebellum', 'brainstem'] as const
export type Zone = (typeof ZONES)[number]

export type LesionCase = { id: 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6'; side: 'left' | 'right'; answer: Zone }

export const CASES: LesionCase[] = [
  { id: 'c1', side: 'left', answer: 'broca' },
  { id: 'c2', side: 'left', answer: 'wernicke' },
  { id: 'c3', side: 'right', answer: 'motor-strip' },
  { id: 'c4', side: 'left', answer: 'sensory-strip' },
  { id: 'c5', side: 'right', answer: 'parietal-association' },
  { id: 'c6', side: 'right', answer: 'cerebellum' },
]

export type LesionState = { index: number; solved: string[] }

/** Tap a zone for the current case. A right tap solves it and moves to the next case; a wrong one changes nothing. */
export function tapZone(s: LesionState, zone: Zone): { state: LesionState; correct: boolean } {
  const c = CASES[s.index]
  if (allSolved(s) || c.answer !== zone) return { state: s, correct: false }
  return { state: { index: Math.min(s.index + 1, CASES.length - 1), solved: [...s.solved, c.id] }, correct: true }
}

export function allSolved(s: LesionState): boolean {
  return s.solved.length === CASES.length
}
