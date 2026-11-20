import { Html, OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber'
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Structure, Unit } from '../content/schema'
import { pick, type Lang } from '../i18n/lang'
import { bakeGeometry } from './geometry'
import { CORTEX, hoverColor, nodeToStructure, visualState, zoneColor, type Hemisphere } from './visual'

export const MODEL_URL = `${import.meta.env.BASE_URL}models/brain.glb`


export type BrainCanvasProps = {
  structures: Structure[]
  units: Unit[]
  lang: Lang
  discovered: string[]
  highlight?: string[]
  only?: string[]
  focus?: string[]
  labels: boolean
  translucentCortex: boolean
  hemisphere: Hemisphere
  /** Bump to re-frame the camera. */
  resetKey?: number
  onPick?(structureId: string): void
  onError?(): void
}

class LoadBoundary extends Component<{ onError?(): void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError?.() }
  render() { return this.state.failed ? null : this.props.children }
}

function toonGradient() {
  const tex = new THREE.DataTexture(new Uint8Array([110, 180, 255]), 3, 1, THREE.RedFormat)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}

type Part = { node: string; structure: string; geometry: THREE.BufferGeometry; box: THREE.Box3 }

function Brain(props: BrainCanvasProps & { controls: React.RefObject<OrbitControlsImpl | null> }) {
  const { scene } = useGLTF(MODEL_URL)
  const gradient = useMemo(toonGradient, [])
  const [hovered, setHovered] = useState<string | null>(null)
  const map = useMemo(() => nodeToStructure(props.structures), [props.structures])

  const parts = useMemo(() => {
    const out: Part[] = []
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const node = mesh.name || mesh.parent?.name || ''
      const structure = map[node]
      if (!structure) return
      const geometry = bakeGeometry(mesh)
      out.push({ node, structure, geometry, box: geometry.boundingBox!.clone() })
    })
    return out
  }, [scene, map])

  const discovered = useMemo(() => new Set(props.discovered), [props.discovered])
  const unitColorOf = (structureId: string) => {
    const s = props.structures.find((x) => x.id === structureId)
    return props.units.find((u) => u.id === s?.units[0])?.color
  }

  const visible = parts.map((p) => ({
    ...p,
    state: visualState(p.structure, { discovered, highlight: props.highlight ?? [], only: props.only, hemisphere: props.hemisphere, node: p.node }),
  }))

  // Frame the camera on the focus parts (or everything).
  const { camera } = useThree()
  const focusKey = `${(props.focus ?? []).join(',')}|${props.resetKey ?? 0}`
  useEffect(() => {
    const box = new THREE.Box3()
    const targets = props.focus?.length ? parts.filter((p) => props.focus!.includes(p.structure)) : parts
    for (const p of targets.length ? targets : parts) box.union(p.box)
    if (box.isEmpty()) return
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3()).length()
    const dir = new THREE.Vector3(-1, 0.35, 0.55).normalize()
    camera.position.copy(center).addScaledVector(dir, Math.max(size, 2.4) * 1.15)
    camera.lookAt(center)
    props.controls.current?.target.copy(center)
    props.controls.current?.update()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey, parts])

  const labelled = new Map<string, Part>()
  if (props.labels) {
    for (const p of visible) {
      if (p.state === 'hidden' || p.state === 'undiscovered') continue
      if (!labelled.has(p.structure) || p.node.endsWith('_L')) labelled.set(p.structure, p)
    }
  }

  return (
    <group>
      {visible.map((p) => {
        if (p.state === 'hidden') return null
        const isCortex = CORTEX.includes(p.structure)
        const see = props.translucentCortex && isCortex
        const color = hovered === p.structure && props.onPick ? hoverColor(p.structure, unitColorOf(p.structure)) : zoneColor(p.structure, p.state, unitColorOf(p.structure))
        return (
          <mesh
            key={p.node}
            geometry={p.geometry}
            renderOrder={see ? 2 : 1}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(p.structure); document.body.style.cursor = props.onPick ? 'pointer' : '' }}
            onPointerOut={() => { setHovered((h) => (h === p.structure ? null : h)); document.body.style.cursor = '' }}
            onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); props.onPick?.(p.structure) }}
          >
            <meshToonMaterial key={see ? 'see-through' : 'solid'} color={color} gradientMap={gradient} transparent={see} opacity={see ? 0.22 : 1} depthWrite={!see} />
          </mesh>
        )
      })}
      {[...labelled.values()].map((p) => {
        const s = props.structures.find((x) => x.id === p.structure)!
        return (
          <Html key={`label-${p.structure}`} position={p.box.getCenter(new THREE.Vector3())} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
            <span className="brain-label">{pick(s.name, props.lang)}</span>
          </Html>
        )
      })}
    </group>
  )
}

export default function BrainCanvas(props: BrainCanvasProps) {
  const controls = useRef<OrbitControlsImpl | null>(null)
  return (
    <LoadBoundary onError={props.onError}>
      <Canvas camera={{ fov: 35, near: 0.01, far: 50, position: [-3, 1, 2] }} dpr={[1, 2]} className="brain-canvas">
        <ambientLight intensity={0.9} />
        <directionalLight position={[-2, 3, 3]} intensity={1.6} />
        <directionalLight position={[3, -1, -2]} intensity={0.5} />
        <Suspense fallback={null}>
          <Brain {...props} controls={controls} />
        </Suspense>
        <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={0.6} maxDistance={8} />
      </Canvas>
    </LoadBoundary>
  )
}
