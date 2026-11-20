import { describe, expect, test } from 'vitest'
import { BASE } from '../brain/visual'
import { NEURON_PART_IDS } from './parts'
import { NEURON, PART_COLORS, pointAlong, polylineLength } from './shape'
import { signalAt, signalDuration, type SignalOptions } from './signal'

const lengths = { dendrite: 2, soma: 1, axon: 6, terminal: 1 }
const nodes = [1, 2, 3, 4, 5, 6]
const myelinated: SignalOptions = { myelinated: true, lengths, nodes }
const bare: SignalOptions = { myelinated: false, lengths, nodes }

function samples(opts: SignalOptions, step = 0.01) {
  const out = []
  for (let t = 0; t <= signalDuration(opts) + 0.5; t += step) out.push({ t, ...signalAt(t, opts) })
  return out
}

describe('signal timing', () => {
  test('with myelin, the pulse on the axon is only ever at a node', () => {
    const onAxon = samples(myelinated).filter((s) => s.phase === 'axon')
    expect(onAxon.length).toBeGreaterThan(0)
    for (const s of onAxon) expect(nodes).toContain(s.d)
    expect(new Set(onAxon.map((s) => s.d))).toEqual(new Set(nodes))
  })
  test('without myelin, the pulse creeps smoothly along the axon', () => {
    const onAxon = samples(bare).filter((s) => s.phase === 'axon')
    expect(onAxon.some((s) => !nodes.includes(s.d))).toBe(true)
    for (let i = 1; i < onAxon.length; i++) expect(onAxon[i].d - onAxon[i - 1].d).toBeLessThan(0.05)
  })
  test('without myelin, the signal takes at least 3 times longer', () => {
    expect(signalDuration(bare)).toBeGreaterThanOrEqual(3 * signalDuration(myelinated))
  })
  test('the pulse goes through every phase in order, never backwards, and ends', () => {
    for (const opts of [myelinated, bare]) {
      const order = ['dendrite', 'soma', 'axon', 'terminal', 'done']
      const all = samples(opts)
      for (let i = 1; i < all.length; i++) {
        const a = all[i - 1], b = all[i]
        const ia = order.indexOf(a.phase), ib = order.indexOf(b.phase)
        expect(ib).toBeGreaterThanOrEqual(ia)
        if (ia === ib) expect(b.d).toBeGreaterThanOrEqual(a.d)
      }
      expect(all.map((s) => s.phase)).toEqual(expect.arrayContaining(order))
      expect(signalAt(signalDuration(opts) + 1, opts).phase).toBe('done')
    }
  })
})

describe('neuron shape', () => {
  test('myelin segments do not overlap and every node sits in a gap', () => {
    const m = NEURON.myelin
    for (let i = 1; i < m.length; i++) expect(m[i].from).toBeGreaterThan(m[i - 1].to)
    expect(NEURON.nodes).toHaveLength(m.length)
    NEURON.nodes.forEach((n, i) => {
      expect(n).toBeGreaterThan(m[i].to)
      if (m[i + 1]) expect(n).toBeLessThan(m[i + 1].from)
    })
    expect(NEURON.nodes.at(-1)!).toBeLessThan(polylineLength(NEURON.axon))
  })
  test('every part has its own colour, distinct from the grey base', () => {
    const colors = NEURON_PART_IDS.map((id) => PART_COLORS[id])
    expect(colors.every(Boolean)).toBe(true)
    expect(new Set([...colors, BASE]).size).toBe(NEURON_PART_IDS.length + 1)
  })
  test('pointAlong walks a polyline by distance', () => {
    const line: [number, number, number][] = [[0, 0, 0], [2, 0, 0], [2, 3, 0]]
    expect(polylineLength(line)).toBe(5)
    expect(pointAlong(line, 1)).toEqual([1, 0, 0])
    expect(pointAlong(line, 3)).toEqual([2, 1, 0])
    expect(pointAlong(line, 99)).toEqual([2, 3, 0])
  })
})
