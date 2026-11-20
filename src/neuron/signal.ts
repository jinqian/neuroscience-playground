/**
 * When and where the signal is, as a pure function of time. The pulse travels through four
 * phases: down a dendrite, across the soma to the axon hillock, along the axon, and out into
 * the terminals. With myelin it jumps from node to node; without it, it creeps along.
 */
export type Phase = 'dendrite' | 'soma' | 'axon' | 'terminal' | 'done'

export type SignalOptions = {
  myelinated: boolean
  /** Length of each stretch of the route, in model units. */
  lengths: { dendrite: number; soma: number; axon: number; terminal: number }
  /** Distances of the nodes of Ranvier along the axon, in order. */
  nodes: number[]
}

/** Travel speed outside the axon (units per second). */
const SPEED = 2.5
/** Time the pulse spends at each node of Ranvier (seconds). */
const NODE_DWELL = 0.18
/** Speed along a bare, unmyelinated axon (units per second). */
const BARE_SPEED = 0.6

function axonTime(o: SignalOptions) {
  return o.myelinated ? o.nodes.length * NODE_DWELL : o.lengths.axon / BARE_SPEED
}

export function signalDuration(o: SignalOptions): number {
  return (o.lengths.dendrite + o.lengths.soma + o.lengths.terminal) / SPEED + axonTime(o)
}

/** Where the pulse is at time `t` (seconds): its phase and distance `d` within that phase. */
export function signalAt(t: number, o: SignalOptions): { phase: Phase; d: number } {
  let rest = Math.max(0, t)
  const tDendrite = o.lengths.dendrite / SPEED
  if (rest < tDendrite) return { phase: 'dendrite', d: rest * SPEED }
  rest -= tDendrite
  const tSoma = o.lengths.soma / SPEED
  if (rest < tSoma) return { phase: 'soma', d: rest * SPEED }
  rest -= tSoma
  const tAxon = axonTime(o)
  if (rest < tAxon) {
    if (!o.myelinated) return { phase: 'axon', d: rest * BARE_SPEED }
    const i = Math.min(Math.floor(rest / NODE_DWELL), o.nodes.length - 1)
    return { phase: 'axon', d: o.nodes[i] }
  }
  rest -= tAxon
  const tTerminal = o.lengths.terminal / SPEED
  if (rest < tTerminal) return { phase: 'terminal', d: rest * SPEED }
  return { phase: 'done', d: 0 }
}
