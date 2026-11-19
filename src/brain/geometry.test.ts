import * as THREE from 'three'
import { describe, expect, test } from 'vitest'
import { bakeGeometry } from './geometry'
import { STRUCTURE_COLORS, HIGHLIGHT } from './visual'

describe('bakeGeometry', () => {
  test('turns quantized local positions into world-space floats', () => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Int16Array([32767, 0, 0, 0, 32767, 0, 0, 0, -32767]), 3, true))
    const mesh = new THREE.Mesh(g)
    const parent = new THREE.Group()
    parent.position.set(1, 2, 3)
    parent.scale.setScalar(0.5)
    parent.add(mesh)
    const baked = bakeGeometry(mesh)
    const p = baked.getAttribute('position')
    expect(p.array).toBeInstanceOf(Float32Array)
    expect([p.getX(0), p.getY(0), p.getZ(0)].map((v) => +v.toFixed(3))).toEqual([1.5, 2, 3])
    expect([p.getX(2), p.getY(2), p.getZ(2)].map((v) => +v.toFixed(3))).toEqual([1, 2, 2.5])
    expect(baked.getAttribute('normal')).toBeDefined()
    expect(g.getAttribute('position').array).toBeInstanceOf(Int16Array)
  })
})

test('each Phase 1 structure has its own colour, distinct from the highlight', () => {
  const ids = ['frontal-lobe', 'parietal-lobe', 'temporal-lobe', 'occipital-lobe', 'cerebellum', 'brainstem', 'hypothalamus']
  const colors = ids.map((id) => STRUCTURE_COLORS[id])
  expect(colors.every(Boolean)).toBe(true)
  expect(new Set([...colors, HIGHLIGHT]).size).toBe(ids.length + 1)
})
