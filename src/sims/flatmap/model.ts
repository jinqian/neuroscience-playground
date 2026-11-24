/**
 * The CNS laid out flat: one line from the spinal cord up to a fan of four lobes,
 * with the cerebellum beside the pons and the hypothalamus beside the thalamus.
 * A teaching layout, not a real map: the real brain bends and folds.
 */

export const SLOTS = ['spinal-cord', 'medulla', 'pons', 'cerebellum', 'midbrain', 'thalamus', 'hypothalamus', 'frontal', 'parietal', 'temporal', 'occipital'] as const
export type Slot = (typeof SLOTS)[number]

/** How far up the axis each part sits, from the spinal cord (0) to the lobes (5). */
export const LEVEL: Record<Slot, number> = {
  'spinal-cord': 0, medulla: 1, pons: 2, cerebellum: 2, midbrain: 3, thalamus: 4, hypothalamus: 4,
  frontal: 5, parietal: 5, temporal: 5, occipital: 5,
}

/** Slot → the label placed on it. Labels share the slot ids. */
export type Placed = Partial<Record<Slot, Slot>>
export type Hint = 'higher' | 'lower' | 'beside' | 'lobe'

const LOBES: Slot[] = ['frontal', 'parietal', 'temporal', 'occipital']

/** Try to put `label` on `slot`. Only a right placement is kept; a wrong one says which way to go. */
export function place(p: Placed, label: Slot, slot: Slot): { placed: Placed; correct: boolean; hint: Hint | null } {
  if (label === slot) return { placed: { ...p, [slot]: label }, correct: true, hint: null }
  const d = LEVEL[label] - LEVEL[slot]
  return { placed: { ...p }, correct: false, hint: d > 0 ? 'higher' : d < 0 ? 'lower' : LOBES.includes(slot) ? 'lobe' : 'beside' }
}

export function allPlaced(p: Placed): boolean {
  return SLOTS.every((s) => p[s] === s)
}
