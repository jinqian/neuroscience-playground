import type { NeuronPartId } from './parts'
import type { SignalOptions } from './signal'

/** A point in model space. */
export type Vec3 = [number, number, number]

/** Each part's own colour, shown when it is selected. */
export const PART_COLORS: Record<NeuronPartId, string> = {
  dendrites: '#3dbe5a',
  soma: '#1cb0f6',
  nucleus: '#7b5cf0',
  'axon-hillock': '#ff4b6e',
  axon: '#ff8a3d',
  myelin: '#ffc93c',
  'node-of-ranvier': '#c04cd9',
  'axon-terminal': '#14b8a6',
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k]
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2])
const norm = (a: Vec3): Vec3 => scale(a, 1 / (len(a) || 1))

export function polylineLength(points: Vec3[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) total += len(sub(points[i], points[i - 1]))
  return total
}

/** The point at distance `d` along a polyline (clamped to its ends). */
export function pointAlong(points: Vec3[], d: number): Vec3 {
  let rest = Math.max(0, d)
  for (let i = 1; i < points.length; i++) {
    const seg = len(sub(points[i], points[i - 1]))
    if (rest <= seg) return add(points[i - 1], scale(sub(points[i], points[i - 1]), seg ? rest / seg : 0))
    rest -= seg
  }
  return points[points.length - 1]
}

/** Small seeded random generator, so the neuron has the same shape every time. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A wandering branch from `start` heading roughly along `dir`. */
function branch(rand: () => number, start: Vec3, dir: Vec3, length: number, steps: number): Vec3[] {
  const pts: Vec3[] = [start]
  let d = norm(dir)
  for (let i = 0; i < steps; i++) {
    d = norm(add(d, [(rand() - 0.5) * 0.6, (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.6]))
    pts.push(add(pts[pts.length - 1], scale(d, length / steps)))
  }
  return pts
}

function buildNeuron() {
  const rand = seeded(7)
  const soma = { center: [0, 0, 0] as Vec3, radius: 0.55 }
  const nucleus = { center: [-0.05, 0.06, 0] as Vec3, radius: 0.22 }
  const hillock = { from: [0.42, 0, 0] as Vec3, to: [0.95, 0, 0] as Vec3, r0: 0.26, r1: 0.075 }

  // The axon: a gently curving line heading away along +x.
  const axon: Vec3[] = []
  for (let i = 0; i <= 40; i++) {
    const u = i / 40
    axon.push([0.95 + u * 6.4, 0.3 * Math.sin(Math.PI * u), 0.18 * Math.sin(2 * Math.PI * u)])
  }
  const axonLength = polylineLength(axon)

  // Myelin segments with bare nodes of Ranvier between them; the first stretch stays bare.
  const SEGMENT = 0.85, GAP = 0.12, START = 0.45
  const myelin: { from: number; to: number }[] = []
  const nodes: number[] = []
  for (let from = START; from + SEGMENT + GAP < axonLength - 0.3; from += SEGMENT + GAP) {
    myelin.push({ from, to: from + SEGMENT })
    nodes.push(from + SEGMENT + GAP / 2)
  }

  // Dendrites: primary branches leaving the soma away from the axon, each with two side branches.
  const dirs: Vec3[] = [[-1, 0.2, 0], [-0.6, 0.9, 0.3], [-0.5, -0.9, 0.2], [-0.4, 0.3, 1], [-0.4, -0.2, -1], [0.1, 1, -0.4], [0.1, -1, 0.5]]
  const dendrites: Vec3[][] = []
  dirs.forEach((dir) => {
    const base = scale(norm(dir), soma.radius * 0.92)
    const main = branch(rand, base, dir, 1.7, 5)
    dendrites.push(main)
    for (const k of [2, 3]) dendrites.push(branch(rand, main[k], add(norm(dir), [(rand() - 0.5) * 1.6, (rand() - 0.5) * 1.6, (rand() - 0.5) * 1.6]), 0.8, 3))
  })

  // Axon terminals: a few short branches fanning out from the axon's end.
  const end = axon[axon.length - 1]
  const tip = norm(sub(end, axon[axon.length - 2]))
  const spreads: Vec3[] = [[0, 0.7, 0], [0, -0.7, 0], [0, 0, 0.7], [0, 0, -0.7], [0, 0.35, 0.35]]
  const terminals: Vec3[][] = spreads.map((spread) => {
    const dir = add(tip, spread)
    return [end, add(end, scale(norm(dir), 0.35)), add(end, scale(norm(add(dir, spread)), 0.75))]
  })

  // The signal's route: in along the first dendrite, across the soma, then the axon and terminals.
  const routeDendrite = [...dendrites[0]].reverse()
  const routeSoma: Vec3[] = [dendrites[0][0], soma.center, hillock.to]
  return { soma, nucleus, hillock, axon, myelin, nodes, dendrites, terminals, route: { dendrite: routeDendrite, soma: routeSoma } }
}

/** The typical neuron, described as simple shapes. Distances along the axon start at its first point. */
export const NEURON = buildNeuron()

/** The signal's route lengths and node positions on this neuron. */
export function signalOptions(myelinated: boolean): SignalOptions {
  return {
    myelinated,
    lengths: {
      dendrite: polylineLength(NEURON.route.dendrite),
      soma: polylineLength(NEURON.route.soma),
      axon: polylineLength(NEURON.axon),
      terminal: Math.max(...NEURON.terminals.map(polylineLength)),
    },
    nodes: NEURON.nodes,
  }
}
