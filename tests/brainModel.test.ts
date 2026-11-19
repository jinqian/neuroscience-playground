import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { getBounds } from '@gltf-transform/core'
import { load } from 'js-yaml'
import { MeshoptDecoder } from 'meshoptimizer'
import { describe, expect, test } from 'vitest'

const root = join(__dirname, '..')
const glb = join(root, 'public/models/brain.glb')
type Structure = { id: string; meshNodes: string[]; twoDOnly?: boolean }
const structures = load(readFileSync(join(root, 'content/structures.yaml'), 'utf8')) as Structure[]

describe('brain model', () => {
  test('structures.yaml is consistent: 2D-only means no mesh nodes, otherwise at least one', () => {
    for (const s of structures) {
      if (s.twoDOnly) expect(s.meshNodes, s.id).toEqual([])
      else expect(s.meshNodes.length, s.id).toBeGreaterThan(0)
    }
  })

  test('brain.glb matches structures.yaml, is centred, oriented and small enough', async () => {
    expect(existsSync(glb)).toBe(true)
    expect(statSync(glb).size).toBeLessThanOrEqual(20 * 1024 * 1024)

    await MeshoptDecoder.ready
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder })
    const doc = await io.read(glb)
    const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0]
    const meshNodes = doc.getRoot().listNodes().filter((n) => n.getMesh())
    const names = new Set(meshNodes.map((n) => n.getName()))
    const expected = new Set(structures.flatMap((s) => s.meshNodes))
    expect([...names].sort()).toEqual([...expected].sort())

    for (const n of meshNodes) {
      const { min, max } = getBounds(n)
      const cx = (min[0] + max[0]) / 2
      if (n.getName().endsWith('_L')) expect(cx, n.getName()).toBeLessThan(0)
      if (n.getName().endsWith('_R')) expect(cx, n.getName()).toBeGreaterThan(0)
    }

    const { min, max } = getBounds(scene)
    const longest = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2])
    expect(longest).toBeGreaterThan(1.95)
    expect(longest).toBeLessThan(2.05)
  })
})
