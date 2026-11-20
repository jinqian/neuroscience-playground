/** The parts the 3D neuron draws, from the dendrites to the axon terminals. */
export const NEURON_PART_IDS = ['dendrites', 'soma', 'nucleus', 'axon-hillock', 'axon', 'myelin', 'node-of-ranvier', 'axon-terminal'] as const

export type NeuronPartId = (typeof NEURON_PART_IDS)[number]
