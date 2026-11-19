import { INK, Label, Region, type ArtProps } from './Region'

export const MENINGES_REGIONS = ['skull', 'dura', 'arachnoid', 'pia']

/** A cross-section from skull down to the brain surface. */
export function MeningesArt(art: ArtProps) {
  return (
    <svg viewBox="0 0 520 260" role="img" aria-label="The meninges in cross-section">
      <Region id="skull" label="Skull" art={art}>
        <rect x="20" y="16" width="480" height="40" rx="8" fill="#efe6d2" stroke={INK} strokeWidth="3" />
      </Region>
      <Region id="dura" label="Dura mater" art={art}>
        <rect x="20" y="62" width="480" height="28" fill="#ff9e7a" stroke={INK} strokeWidth="3" />
      </Region>
      <Region id="arachnoid" label="Arachnoid mater" art={art}>
        <rect x="20" y="94" width="480" height="14" fill="#ffd0e0" stroke={INK} strokeWidth="2.5" />
        <g stroke="#d97aa6" strokeWidth="2">
          {Array.from({ length: 16 }, (_, i) => 36 + i * 29).map((x) => <path key={x} d={`M${x} 108 L${x + 8} 146`} />)}
        </g>
      </Region>
      <rect x="20" y="108" width="480" height="40" fill="#cfefff" opacity=".7" />
      <Region id="pia" label="Pia mater" art={art}>
        <path d="M20 150 Q70 138 120 150 T220 150 T320 150 T420 150 T500 150" fill="none" stroke="#2f80ed" strokeWidth="5" />
        <rect x="20" y="140" width="480" height="18" fill="transparent" />
      </Region>
      <path d="M20 156 Q70 144 120 156 T220 156 T320 156 T420 156 T500 156 V244 H20 Z" fill="#c9b8ff" stroke={INK} strokeWidth="3" />
      {art.labels && (
        <g>
          <Label x={260} y={42}>skull</Label>
          <Label x={260} y={82}>dura mater</Label>
          <Label x={120} y={104}>arachnoid mater</Label>
          <Label x={380} y={132}>cerebrospinal fluid</Label>
          <Label x={260} y={178}>pia mater</Label>
          <Label x={260} y={218}>brain</Label>
        </g>
      )}
    </svg>
  )
}
