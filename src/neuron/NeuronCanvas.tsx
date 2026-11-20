import { Html, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { toonGradient } from '../brain/toon'
import { BASE, lighten } from '../brain/visual'
import type { NeuronPart } from '../content/schema'
import { pick, type Lang } from '../i18n/lang'
import { choosePart, type NeuronPartId } from './parts'
import { NEURON, PART_COLORS, pointAlong, signalOptions, type Vec3 } from './shape'
import { signalAt, type Phase } from './signal'

export type NeuronCanvasProps = {
  /** The parts currently shown (myelin and nodes are left out when the myelin is removed). */
  parts: NeuronPart[]
  lang: Lang
  selected?: string
  myelin: boolean
  labels: boolean
  /** Changes to start a new signal; 0 means no signal. */
  run: number
  /** Playback speed multiplier. */
  speed: number
  /** Bump to re-frame the camera. */
  resetKey: number
  onPick(id: string): void
  onPhase(phase: Phase): void
  onError?(): void
}

class LoadBoundary extends Component<{ onError?(): void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError?.() }
  render() { return this.state.failed ? null : this.props.children }
}

const v = (p: Vec3) => new THREE.Vector3(...p)
const curve = (points: Vec3[]) => new THREE.CatmullRomCurve3(points.map(v))

/** Points of the axon between two distances along it. */
function axonSlice(from: number, to: number, steps = 8): Vec3[] {
  return Array.from({ length: steps + 1 }, (_, i) => pointAlong(NEURON.axon, from + ((to - from) * i) / steps))
}

type Shape = { part: NeuronPartId; geometry: THREE.BufferGeometry; position?: Vec3; quaternion?: THREE.Quaternion }

function buildShapes(): Shape[] {
  const out: Shape[] = []
  NEURON.dendrites.forEach((b, i) => {
    const main = i % 3 === 0
    out.push({ part: 'dendrites', geometry: new THREE.TubeGeometry(curve(b), 24, main ? 0.075 : 0.042, 8) })
  })
  out.push({ part: 'soma', geometry: new THREE.SphereGeometry(NEURON.soma.radius, 32, 24), position: NEURON.soma.center })
  out.push({ part: 'nucleus', geometry: new THREE.SphereGeometry(NEURON.nucleus.radius, 24, 16), position: NEURON.nucleus.center })

  const { from, to, r0, r1 } = NEURON.hillock
  const hillock = new THREE.CylinderGeometry(r1, r0, to[0] - from[0], 24)
  hillock.rotateZ(-Math.PI / 2)
  out.push({ part: 'axon-hillock', geometry: hillock, position: [(from[0] + to[0]) / 2, from[1], from[2]] })

  out.push({ part: 'axon', geometry: new THREE.TubeGeometry(curve(NEURON.axon), 160, 0.07, 10) })
  for (const m of NEURON.myelin) {
    out.push({ part: 'myelin', geometry: new THREE.TubeGeometry(curve(axonSlice(m.from + 0.02, m.to - 0.02)), 16, 0.17, 16, false) })
  }
  for (const d of NEURON.nodes) {
    const at = pointAlong(NEURON.axon, d)
    const ahead = pointAlong(NEURON.axon, d + 0.05)
    const tangent = v(ahead).sub(v(at)).normalize()
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent)
    out.push({ part: 'node-of-ranvier', geometry: new THREE.TorusGeometry(0.1, 0.035, 10, 24), position: at, quaternion: q })
  }
  for (const b of NEURON.terminals) {
    out.push({ part: 'axon-terminal', geometry: new THREE.TubeGeometry(curve(b), 12, 0.045, 8) })
    out.push({ part: 'axon-terminal', geometry: new THREE.SphereGeometry(0.1, 16, 12), position: b[b.length - 1] })
  }
  return out
}

/** Where each part's label sits. */
const LABEL_AT: Record<NeuronPartId, Vec3> = {
  dendrites: NEURON.dendrites[3][3],
  soma: [-0.35, -0.95, 0.2],
  nucleus: [-0.55, 0.95, 0.2],
  'axon-hillock': [0.95, 0.5, 0],
  axon: (() => { const p = pointAlong(NEURON.axon, 0.25); return [p[0] + 0.1, p[1] - 0.42, p[2]] as Vec3 })(),
  myelin: (() => { const m = NEURON.myelin[2]; const p = pointAlong(NEURON.axon, (m.from + m.to) / 2); return [p[0], p[1] + 0.45, p[2]] as Vec3 })(),
  'node-of-ranvier': (() => { const p = pointAlong(NEURON.axon, NEURON.nodes[3]); return [p[0], p[1] - 0.42, p[2]] as Vec3 })(),
  'axon-terminal': (() => { const e = NEURON.axon[NEURON.axon.length - 1]; return [e[0] + 0.2, e[1] + 0.85, e[2]] as Vec3 })(),
}

const PULSE = '#ff2e88'
/** Five pulse spheres: one for most of the route, one per terminal branch at the end. */
const PULSES = NEURON.terminals.length

function Neuron(props: NeuronCanvasProps & { controls: React.RefObject<OrbitControlsImpl | null> }) {
  const gradient = useMemo(toonGradient, [])
  const shapes = useMemo(buildShapes, [])
  const [hovered, setHovered] = useState<string>()
  const shown = new Set(props.parts.map((p) => p.id))

  // Camera framing.
  const { camera } = useThree()
  useEffect(() => {
    const target = new THREE.Vector3(3, 0, 0)
    camera.position.set(3, 2.4, 11.4)
    camera.lookAt(target)
    props.controls.current?.target.copy(target)
    props.controls.current?.update()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.resetKey])

  // The signal.
  const pulses = useRef<(THREE.Group | null)[]>([])
  const time = useRef(0)
  const lastPhase = useRef<Phase | null>(null)
  const opts = useMemo(() => signalOptions(props.myelin), [props.myelin])
  useEffect(() => {
    time.current = 0
    lastPhase.current = null
  }, [props.run, props.myelin])

  useFrame((_, delta) => {
    const groups = pulses.current
    if (!props.run) {
      groups.forEach((g) => g && (g.visible = false))
      return
    }
    if (lastPhase.current !== 'done') time.current += Math.min(delta, 0.1) * props.speed
    const { phase, d } = signalAt(time.current, opts)
    if (phase !== lastPhase.current) {
      lastPhase.current = phase
      props.onPhase(phase)
    }
    groups.forEach((g, i) => {
      if (!g) return
      let p: Vec3 | null = null
      if (phase === 'dendrite' && i === 0) p = pointAlong(NEURON.route.dendrite, d)
      else if (phase === 'soma' && i === 0) p = pointAlong(NEURON.route.soma, d)
      else if (phase === 'axon' && i === 0) p = pointAlong(NEURON.axon, d)
      else if (phase === 'terminal') p = pointAlong(NEURON.terminals[i], d)
      g.visible = !!p
      if (p) g.position.set(...p)
    })
  })

  const partAt = (e: ThreeEvent<PointerEvent | MouseEvent>) =>
    choosePart(e.intersections.map((i) => i.object.userData.part as string).filter((p) => p && shown.has(p)))

  return (
    <group
      onPointerMove={(e) => {
        e.stopPropagation()
        const p = partAt(e)
        setHovered(p)
        document.body.style.cursor = p ? 'pointer' : ''
      }}
      onPointerOut={() => { setHovered(undefined); document.body.style.cursor = '' }}
      onClick={(e) => {
        e.stopPropagation()
        const p = partAt(e)
        if (p) props.onPick(p)
      }}
    >
      {shapes.map((s, i) => {
        if (!shown.has(s.part)) return null
        const own = PART_COLORS[s.part]
        const color = props.selected === s.part ? own : hovered === s.part ? lighten(own, 0.4) : BASE
        const see = s.part === 'soma'
        return (
          <mesh key={i} geometry={s.geometry} position={s.position} quaternion={s.quaternion} userData={{ part: s.part }} renderOrder={see ? 2 : 1}>
            <meshToonMaterial color={color} gradientMap={gradient} transparent={see} opacity={see ? 0.45 : 1} depthWrite={!see} side={s.part === 'myelin' ? THREE.DoubleSide : THREE.FrontSide} />
          </mesh>
        )
      })}
      {Array.from({ length: PULSES }, (_, i) => (
        <group key={`pulse-${i}`} ref={(g) => { pulses.current[i] = g }} visible={false}>
          <mesh raycast={() => null} renderOrder={3}>
            <sphereGeometry args={[0.13, 16, 12]} />
            <meshBasicMaterial color={PULSE} depthTest={false} />
          </mesh>
          <mesh raycast={() => null} renderOrder={3}>
            <sphereGeometry args={[0.28, 16, 12]} />
            <meshBasicMaterial color={PULSE} transparent opacity={0.35} depthTest={false} />
          </mesh>
        </group>
      ))}
      {props.labels && props.parts.map((p) => (
        <Html key={`label-${p.id}`} position={LABEL_AT[p.id as NeuronPartId]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <span className="brain-label">{pick(p.name, props.lang)}</span>
        </Html>
      ))}
    </group>
  )
}

export default function NeuronCanvas(props: NeuronCanvasProps) {
  const controls = useRef<OrbitControlsImpl | null>(null)
  return (
    <LoadBoundary onError={props.onError}>
      <Canvas camera={{ fov: 35, near: 0.05, far: 80, position: [3, 2.4, 11.4] }} dpr={[1, 2]} className="brain-canvas">
        <ambientLight intensity={0.9} />
        <directionalLight position={[-2, 4, 6]} intensity={1.6} />
        <directionalLight position={[4, -2, -3]} intensity={0.5} />
        <Neuron {...props} controls={controls} />
        <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={1.5} maxDistance={22} />
      </Canvas>
    </LoadBoundary>
  )
}
