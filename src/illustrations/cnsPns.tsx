import { ArtSvg, INK, Label, Region, type ArtProps } from './Region'

export const CNS_PNS_REGIONS = ['brain', 'spinal-cord', 'peripheral-nerve']

/** A body outline: brain and spinal cord (CNS) in purple, nerves (PNS) in orange. */
export function CnsPnsArt(art: ArtProps) {
  return (
    <ArtSvg viewBox="0 0 320 330" label="Central and peripheral nervous system">
      <path d="M160 18c26 0 40 18 40 40s-14 40-40 40-40-18-40-40 14-40 40-40zM110 108h100l34 110-20 6-24-80v180h-28l-12-112-12 112h-28v-180l-24 80-20-6z"
        fill="#f6f8f7" stroke="#c9cdd4" strokeWidth="3" strokeLinejoin="round" />
      <Region id="peripheral-nerve" label="Peripheral nerves" art={art}>
        <g stroke="#ff8a3d" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M160 130 Q120 130 104 200 L84 230" /><path d="M160 130 Q200 130 216 200 L236 230" />
          <path d="M160 200 Q140 240 144 310" /><path d="M160 200 Q180 240 176 310" />
        </g>
        <g stroke="transparent" strokeWidth="18" fill="none">
          <path d="M160 130 Q120 130 104 200 L84 230" /><path d="M160 130 Q200 130 216 200 L236 230" />
          <path d="M160 200 Q140 240 144 310" /><path d="M160 200 Q180 240 176 310" />
        </g>
      </Region>
      <Region id="spinal-cord" label="Spinal cord" art={art}>
        <path d="M160 92 V206" stroke="#7b5cf0" strokeWidth="9" strokeLinecap="round" />
        <path d="M160 92 V206" stroke="transparent" strokeWidth="22" />
      </Region>
      <Region id="brain" label="Brain" art={art}>
        <ellipse cx="160" cy="54" rx="30" ry="24" fill="#c9b8ff" stroke={INK} strokeWidth="3" />
      </Region>
      {art.labels && (
        <g>
          <Label x={204} y={44} anchor="start">brain</Label>
          <Label x={172} y={160} anchor="start">spinal cord</Label>
          <Label x={244} y={250} anchor="start">nerves</Label>
          <Label x={30} y={300} anchor="start">CNS = purple</Label>
          <Label x={30} y={318} anchor="start">PNS = orange</Label>
        </g>
      )}
    </ArtSvg>
  )
}
