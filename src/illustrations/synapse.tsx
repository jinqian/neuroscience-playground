import { ArtSvg, INK, Label, Region, type ArtProps } from './Region'

export const SYNAPSE_REGIONS = ['presynaptic-terminal', 'vesicle', 'cleft', 'receptor', 'postsynaptic', 'reuptake-transporter']

/** A chemical synapse: terminal on top, cleft, receiving cell below. */
export function SynapseArt(art: ArtProps) {
  return (
    <ArtSvg viewBox="0 0 520 300" label="A chemical synapse">
      <Region id="presynaptic-terminal" label="Presynaptic terminal" art={art}>
        <path d="M200 0 V40 C120 50 90 110 110 150 H410 C430 110 400 50 320 40 V0 Z" fill="#ffe1c7" stroke={INK} strokeWidth="3" />
      </Region>
      <Region id="vesicle" label="Vesicle" art={art}>
        {[[200, 90], [250, 75], [300, 92], [230, 122], [285, 126], [180, 128]].map(([cx, cy]) => (
          <g key={`${cx}${cy}`}>
            <circle cx={cx} cy={cy} r="16" fill="#ffd98a" stroke={INK} strokeWidth="2.5" />
            <circle cx={cx - 4} cy={cy - 2} r="2.5" fill="#7b5cf0" /><circle cx={cx + 4} cy={cy + 3} r="2.5" fill="#7b5cf0" />
          </g>
        ))}
      </Region>
      <Region id="reuptake-transporter" label="Reuptake transporter" art={art}>
        <rect x="378" y="138" width="22" height="22" rx="5" fill="#14b8a6" stroke={INK} strokeWidth="2.5" />
      </Region>
      <Region id="cleft" label="Synaptic cleft" art={art}>
        <rect x="90" y="152" width="340" height="40" fill="#eef7ff" />
        {[[180, 170], [240, 178], [300, 166], [350, 176]].map(([cx, cy]) => <circle key={`${cx}`} cx={cx} cy={cy} r="3" fill="#7b5cf0" />)}
      </Region>
      <Region id="postsynaptic" label="Postsynaptic cell" art={art}>
        <path d="M60 300 V230 C60 205 80 196 110 196 H410 C440 196 460 205 460 230 V300 Z" fill="#c9b8ff" stroke={INK} strokeWidth="3" />
      </Region>
      <Region id="receptor" label="Receptor" art={art}>
        {[170, 230, 290, 350].map((cx) => (
          <path key={cx} d={`M${cx - 10} 196 V184 H${cx - 4} V192 H${cx + 4} V184 H${cx + 10} V196`} fill="#ff4b6e" stroke={INK} strokeWidth="2" />
        ))}
      </Region>
      {art.labels && (
        <g>
          <Label x={260} y={30}>axon terminal</Label>
          <Label x={340} y={90} anchor="start">vesicles</Label>
          <Label x={470} y={176} anchor="end">cleft</Label>
          <Label x={408} y={136} anchor="start">reuptake</Label>
          <Label x={260} y={222}>receptors</Label>
          <Label x={260} y={270}>receiving cell</Label>
        </g>
      )}
    </ArtSvg>
  )
}
