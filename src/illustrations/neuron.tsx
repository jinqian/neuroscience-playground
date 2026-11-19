import { INK, Label, Region, type ArtProps } from './Region'

export const NEURON_REGIONS = ['dendrites', 'soma', 'axon-hillock', 'axon', 'myelin', 'node-of-ranvier', 'terminal']

/** A neuron, left to right: dendrites, soma, hillock, myelinated axon, terminals. */
export function NeuronArt(art: ArtProps) {
  const L = art.labels
  return (
    <svg viewBox="0 0 520 230" role="img" aria-label="A neuron">
      <Region id="dendrites" label="Dendrites" art={art}>
        <g stroke="#7b5cf0" strokeWidth="7" strokeLinecap="round" fill="none">
          <path d="M84 104 40 62 M40 62 22 40 M40 62 14 70 M84 116 30 120 M30 120 10 106 M30 120 12 138 M90 130 52 176 M52 176 34 196 M52 176 60 204 M100 86 86 40 M86 40 70 22 M86 40 104 20" />
        </g>
        <rect x="0" y="10" width="96" height="200" fill="transparent" />
      </Region>
      <Region id="soma" label="Soma (cell body)" art={art}>
        <ellipse cx="112" cy="114" rx="36" ry="32" fill="#c9b8ff" stroke={INK} strokeWidth="3" />
        <circle cx="108" cy="112" r="11" fill="#7b5cf0" />
      </Region>
      <Region id="axon-hillock" label="Axon hillock" art={art}>
        <path d="M144 98 L176 108 L176 120 L144 130 Z" fill="#ffc93c" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      </Region>
      <Region id="axon" label="Axon" art={art}>
        <path d="M176 114 H430" stroke={INK} strokeWidth="6" />
        <rect x="176" y="96" width="254" height="36" fill="transparent" />
      </Region>
      <Region id="myelin" label="Myelin sheath" art={art}>
        {[188, 262, 336].map((x) => (
          <rect key={x} x={x} y="101" width="62" height="26" rx="13" fill="#ffd98a" stroke={INK} strokeWidth="3" />
        ))}
      </Region>
      <Region id="node-of-ranvier" label="Node of Ranvier" art={art}>
        {[256, 330].map((x) => (
          <g key={x}>
            <rect x={x - 6} y="94" width="12" height="40" fill="transparent" />
            <circle cx={x} cy="114" r="5" fill="#ff4b6e" />
          </g>
        ))}
      </Region>
      <Region id="terminal" label="Axon terminals" art={art}>
        <g stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M430 114 470 76 M430 114 480 114 M430 114 470 152" />
        </g>
        <g fill="#ff8a3d" stroke={INK} strokeWidth="3">
          <circle cx="474" cy="72" r="10" /><circle cx="486" cy="114" r="10" /><circle cx="474" cy="156" r="10" />
        </g>
      </Region>
      {L && (
        <g>
          <Label x={50} y={226}>dendrites</Label>
          <Label x={112} y={168}>soma</Label>
          <Label x={168} y={86}>axon hillock</Label>
          <Label x={219} y={152}>myelin</Label>
          <Label x={256} y={86}>node</Label>
          <Label x={360} y={152}>axon</Label>
          <Label x={480} y={190}>terminals</Label>
        </g>
      )}
    </svg>
  )
}
