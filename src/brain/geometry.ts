import * as THREE from 'three'

/**
 * A float, world-space copy of a mesh's geometry with normals.
 * The GLB stores compressed (quantized) positions and relies on the node transform,
 * so we bake that transform in before drawing each part on its own.
 */
export function bakeGeometry(mesh: THREE.Mesh): THREE.BufferGeometry {
  mesh.updateWorldMatrix(true, false)
  const src = mesh.geometry.getAttribute('position')
  const pos = new Float32Array(src.count * 3)
  for (let i = 0; i < src.count; i++) {
    pos[i * 3] = src.getX(i)
    pos[i * 3 + 1] = src.getY(i)
    pos[i * 3 + 2] = src.getZ(i)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  if (mesh.geometry.index) g.setIndex(Array.from(mesh.geometry.index.array))
  g.applyMatrix4(mesh.matrixWorld)
  g.computeVertexNormals()
  g.computeBoundingBox()
  return g
}
