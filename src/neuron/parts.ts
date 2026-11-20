/** The parts the 3D neuron draws, from the dendrites to the axon terminals. */
export const NEURON_PART_IDS = ['dendrites', 'soma', 'nucleus', 'axon-hillock', 'axon', 'myelin', 'node-of-ranvier', 'axon-terminal'] as const

export type NeuronPartId = (typeof NEURON_PART_IDS)[number]

/** Parts that disappear when the myelin is removed (a bare axon has no nodes either). */
export const MYELIN_PARTS: readonly string[] = ['myelin', 'node-of-ranvier']

/**
 * Which part a tap means, given every part under the pointer, nearest first. The soma is drawn
 * see-through so the nucleus shows; a tap that goes through both means the nucleus.
 */
export function choosePart(hits: string[]): string | undefined {
  if (hits[0] === 'soma' && hits.includes('nucleus')) return 'nucleus'
  return hits[0]
}
