/**
 * How the brain unfolds from the neural tube. A teaching sketch, not an embryology atlas:
 *
 * - Stages: neural plate → neural groove → closed neural tube (about weeks 3–4)
 *   → 3 primary vesicles (about week 4) → 5 secondary vesicles (about week 5).
 *   Real development overlaps these stages, and the tube also bends (flexures).
 * - Each of the 5 secondary vesicles becomes a part of the adult brain.
 */

export const STAGES = ['plate', 'groove', 'tube', 'three', 'five'] as const
export type Stage = (typeof STAGES)[number]

export const VESICLES = ['telencephalon', 'diencephalon', 'mesencephalon', 'metencephalon', 'myelencephalon'] as const
export type Vesicle = (typeof VESICLES)[number]

export const TARGETS = ['hemispheres', 'thalamus-hypothalamus', 'midbrain', 'pons-cerebellum', 'medulla'] as const
export type Target = (typeof TARGETS)[number]

export const PRIMARY = ['prosencephalon', 'mesencephalon', 'rhombencephalon'] as const
export type Primary = (typeof PRIMARY)[number]

/** The adult part each secondary vesicle becomes. */
export const ANSWER: Record<Vesicle, Target> = {
  telencephalon: 'hemispheres',
  diencephalon: 'thalamus-hypothalamus',
  mesencephalon: 'midbrain',
  metencephalon: 'pons-cerebellum',
  myelencephalon: 'medulla',
}

/** The primary vesicle each secondary vesicle comes from. */
export const PRIMARY_OF: Record<Vesicle, Primary> = {
  telencephalon: 'prosencephalon',
  diencephalon: 'prosencephalon',
  mesencephalon: 'mesencephalon',
  metencephalon: 'rhombencephalon',
  myelencephalon: 'rhombencephalon',
}

export type Matches = Partial<Record<Vesicle, Target>>

/** Try to place vesicle `v` on target `t`. Only a right answer is kept. */
export function drop(m: Matches, v: Vesicle, t: Target): { matches: Matches; correct: boolean } {
  const correct = ANSWER[v] === t
  return { matches: correct ? { ...m, [v]: t } : { ...m }, correct }
}

export function allMatched(m: Matches): boolean {
  return VESICLES.every((v) => m[v] === ANSWER[v])
}

/** Matching only makes sense once all five vesicles exist. */
export function canMatch(stage: Stage): boolean {
  return stage === 'five'
}
