/**
 * Block an artery: read a patient's symptoms, pick the artery and side that failed.
 * Territories are textbook simplifications; real ones vary and overlap at their borders.
 */
import type { Artery } from '../../illustrations/territories'

export type Side = 'left' | 'right'
export type Patient = { id: 'p1' | 'p2' | 'p3'; artery: Artery; side: Side }

export const PATIENTS: Patient[] = [
  { id: 'p1', artery: 'aca', side: 'right' },
  { id: 'p2', artery: 'pca', side: 'left' },
  { id: 'p3', artery: 'mca', side: 'left' },
]

export type ArteryState = { index: number; solved: Patient['id'][] }
/** 'side': the right artery on the wrong side. 'artery': the wrong artery. */
export type Miss = 'side' | 'artery'

export function allSolved(s: ArteryState): boolean {
  return s.solved.length === PATIENTS.length
}

/** Says this artery on this side is blocked, for the current patient. Only a right answer changes the state. */
export function blockAt(s: ArteryState, artery: Artery, side: Side): { state: ArteryState; correct: boolean; miss: Miss | null } {
  if (allSolved(s)) return { state: s, correct: false, miss: null }
  const p = PATIENTS[s.index]
  if (p.artery !== artery) return { state: s, correct: false, miss: 'artery' }
  if (p.side !== side) return { state: s, correct: false, miss: 'side' }
  return { state: { index: Math.min(s.index + 1, PATIENTS.length - 1), solved: [...s.solved, p.id] }, correct: true, miss: null }
}
