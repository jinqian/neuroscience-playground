// Builds public/models/brain.glb from BodyParts3D OBJ meshes listed in sources.yaml.
// One mesh node per entry, named after it. Output frame: +Y up, +Z anterior, anatomical left = −X,
// centred at the origin and scaled so the longest side is 2 units.
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Document, NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions'
import { dedup, meshopt, prune, simplify, weld } from '@gltf-transform/functions'
import { load } from 'js-yaml'
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')
const config = load(readFileSync(join(here, 'sources.yaml'), 'utf8'))
const objDir = join(here, 'raw', 'obj', config.dataset)
const out = join(root, 'public', 'models', 'brain.glb')

/** Reads an OBJ's vertices and triangles (BodyParts3D uses `f a//a b//b c//c`). Coordinates in mm. */
function readObj(id) {
  const text = readFileSync(join(objDir, `${id}.obj`), 'utf8')
  const v = []
  const f = []
  for (const line of text.split('\n')) {
    if (line.startsWith('v ')) {
      const [, x, y, z] = line.trim().split(/\s+/).map(Number)
      v.push([x, y, z])
    } else if (line.startsWith('f ')) {
      const idx = line.trim().split(/\s+/).slice(1).map((s) => parseInt(s, 10) - 1)
      for (let i = 1; i + 1 < idx.length; i++) f.push([idx[0], idx[i], idx[i + 1]])
    }
  }
  return { v, f }
}

// BodyParts3D frame (mm): +Z up; anterior = −Y. Which X sign is anatomical left is measured below.
const parts = Object.entries(config.nodes).map(([name, spec]) => ({ name, spec, meshes: spec.files.map(readObj) }))

const centroidX = (meshes) => {
  let s = 0, n = 0
  for (const m of meshes) for (const p of m.v) { s += p[0]; n++ }
  return s / n
}
const leftPart = parts.find((p) => p.name.endsWith('_L') && !p.spec.split)
const leftIsPositiveX = centroidX(leftPart.meshes) > 0
const sideOf = (x) => ((x > 0) === leftIsPositiveX ? 'left' : 'right')

// Raw → output axes (before centring/scaling): X' = left negative, Y' = up, Z' = anterior.
const toOut = ([x, y, z]) => [leftIsPositiveX ? -x : x, z, -y]

// Gather triangles per node, applying midline splits.
const geoms = parts.map(({ name, spec, meshes }) => {
  const pos = []
  for (const m of meshes) {
    for (const [a, b, c] of m.f) {
      const tri = [m.v[a], m.v[b], m.v[c]]
      if (spec.split) {
        const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3
        if (sideOf(cx) !== spec.split) continue
      }
      for (const p of tri) pos.push(...toOut(p))
    }
  }
  return { name, spec, pos }
})

// Centre and scale on the union bounding box.
const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity]
for (const g of geoms) for (let i = 0; i < g.pos.length; i += 3) for (let k = 0; k < 3; k++) {
  min[k] = Math.min(min[k], g.pos[i + k]); max[k] = Math.max(max[k], g.pos[i + k])
}
const centre = min.map((m, k) => (m + max[k]) / 2)
const scale = 2 / Math.max(...max.map((m, k) => m - min[k]))

const doc = new Document()
const buffer = doc.createBuffer()
const scene = doc.createScene('brain')
for (const g of geoms) {
  const p = new Float32Array(g.pos.length)
  for (let i = 0; i < g.pos.length; i += 3) for (let k = 0; k < 3; k++) p[i + k] = (g.pos[i + k] - centre[k]) * scale
  const indices = new Uint32Array(p.length / 3).map((_, i) => i)
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(p).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(indices).setBuffer(buffer))
  const mesh = doc.createMesh(g.name).addPrimitive(prim)
  scene.addChild(doc.createNode(g.name).setMesh(mesh))
}

await MeshoptSimplifier.ready
await MeshoptEncoder.ready
await doc.transform(weld())
// Keep the shape within a small error; ratio is the target share of triangles kept.
await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: config.simplify.ratio, error: config.simplify.error }), dedup(), prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }))

let triangles = 0
for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) triangles += prim.getIndices().getCount() / 3

mkdirSync(dirname(out), { recursive: true })
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder })
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE })
await io.write(out, doc)
console.log(`left hemisphere is ${leftIsPositiveX ? '+X' : '−X'} in BodyParts3D; wrote ${out} with ${triangles.toFixed(0)} triangles`)
