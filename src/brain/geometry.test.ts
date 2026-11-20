import * as THREE from 'three'
import { describe, expect, test } from 'vitest'
import { bakeGeometry } from './geometry'
import { BASE, STRUCTURE_COLORS, hoverColor, zoneColor } from './visual'

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

describe('zone colours', () => {
  const ids = ['frontal-lobe', 'parietal-lobe', 'temporal-lobe', 'occipital-lobe', 'cerebellum', 'brainstem', 'hypothalamus']
  test('every zone not in focus shares one uniform base colour, met or not', () => {
    const base = ids.flatMap((id) => [zoneColor(id, 'discovered'), zoneColor(id, 'undiscovered')])
    expect(new Set(base)).toEqual(new Set([BASE]))
    expect(BASE).toBe('#d5d9e0')
  })
  test('hovering shows a lighter tint of the zone\'s own colour', () => {
    const lum = (hex: string) => [1, 3, 5].reduce((s, i) => s + parseInt(hex.slice(i, i + 2), 16), 0)
    for (const id of ids) {
      const hover = hoverColor(id)
      expect(hover).not.toBe(STRUCTURE_COLORS[id])
      expect(lum(hover)).toBeGreaterThan(lum(STRUCTURE_COLORS[id]))
    }
  })
  test('the highlighted zone lights up in its own colour', () => {
    const lit = ids.map((id) => zoneColor(id, 'highlight'))
    expect(lit).toEqual(ids.map((id) => STRUCTURE_COLORS[id]))
    expect(new Set([...lit, BASE]).size).toBe(ids.length + 1)
  })
  test('a highlighted zone without its own colour falls back to the given unit colour', () => {
    expect(zoneColor('thalamus', 'highlight', '#123456')).toBe('#123456')
  })
})
