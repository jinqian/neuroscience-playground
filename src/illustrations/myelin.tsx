import { INK, Label } from './Region'

/** A myelinated axon with the signal jumping node to node. */
export function MyelinArt() {
  const segs = [40, 150, 260, 370]
  return (
    <svg viewBox="0 0 520 170" role="img" aria-label="Saltatory conduction along a myelinated axon">
      <path d="M10 110 H510" stroke={INK} strokeWidth="6" />
      {segs.map((x) => <rect key={x} x={x} y="94" width="96" height="32" rx="16" fill="#ffd98a" stroke={INK} strokeWidth="3" />)}
      {[143, 253, 363].map((x) => <circle key={x} cx={x} cy="110" r="6" fill="#ff4b6e" />)}
      <g fill="none" stroke="#ff4b6e" strokeWidth="3" strokeDasharray="6 6">
        <path d="M33 92 Q88 30 143 92" /><path d="M143 92 Q198 30 253 92" /><path d="M253 92 Q308 30 363 92" />
      </g>
      <Label x={198} y={40}>the signal "jumps"</Label>
      <Label x={88} y={152}>myelin</Label>
      <Label x={253} y={152}>node of Ranvier</Label>
    </svg>
  )
}
