import * as THREE from 'three'
import { describe, expect, test } from 'vitest'
import { bakeGeometry } from './geometry'
import { HIGHLIGHT, STRUCTURE_COLORS, zoneColor } from './visual'

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

describe('zone colours', () => {
  const ids = ['frontal-lobe', 'parietal-lobe', 'temporal-lobe', 'occipital-lobe', 'cerebellum', 'brainstem', 'hypothalamus']
  test('every zone has its own colour even before it is discovered, never plain grey', () => {
    const pale = ids.map((id) => zoneColor(id, 'undiscovered'))
    expect(new Set(pale).size).toBe(ids.length)
    expect(pale).not.toContain('#d5d9e0')
  })
  test('undiscovered zones are a paler version of their discovered colour', () => {
    const lum = (hex: string) => [1, 3, 5].reduce((s, i) => s + parseInt(hex.slice(i, i + 2), 16), 0)
    for (const id of ids) {
      expect(zoneColor(id, 'discovered')).toBe(STRUCTURE_COLORS[id])
      expect(lum(zoneColor(id, 'undiscovered'))).toBeGreaterThan(lum(zoneColor(id, 'discovered')))
    }
  })
  test('the highlighted zone is gold', () => {
    expect(zoneColor('cerebellum', 'highlight')).toBe(HIGHLIGHT)
  })
  test('a zone without its own colour falls back to the given unit colour', () => {
    expect(zoneColor('thalamus', 'discovered', '#123456')).toBe('#123456')
  })
})
