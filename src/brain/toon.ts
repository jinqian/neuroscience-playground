import * as THREE from 'three'

/** A three-step light ramp that gives meshes their flat, illustrated look. */
export function toonGradient(): THREE.DataTexture {
  const tex = new THREE.DataTexture(new Uint8Array([110, 180, 255]), 3, 1, THREE.RedFormat)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}
