import { ArtSvg, INK, Label } from './Region'

const LEFT_FIELD = '#ff8a3d'
const RIGHT_FIELD = '#1cb0f6'

/** The brain seen from above, with the corpus callosum cut. Each visual field reaches the opposite hemisphere only. */
export function SplitBrainArt() {
  return (
    <ArtSvg viewBox="0 0 440 320" label="A split brain seen from above">
      <g fill="#eceff3" stroke={INK} strokeWidth="2">
        <ellipse cx="140" cy="100" rx="62" ry="74" />
        <ellipse cx="300" cy="100" rx="62" ry="74" />
      </g>
      <path d="M200 64H240V136H200Z" fill="#e05a2b" opacity=".35" />
      <path d="M206 86L234 114M234 86L206 114" stroke="#e05a2b" strokeWidth="4" strokeLinecap="round" />
      <g fill="#fff" stroke={INK} strokeWidth="2">
        <circle cx="200" cy="214" r="11" />
        <circle cx="240" cy="214" r="11" />
      </g>
      <g fill="none" strokeWidth="4" strokeLinecap="round">
        <path d="M96 286L200 214L300 124" stroke={LEFT_FIELD} />
        <path d="M344 286L240 214L140 124" stroke={RIGHT_FIELD} />
      </g>
      <path d="M86 272l8 -14l8 14z" fill={LEFT_FIELD} />
      <circle cx="344" cy="286" r="8" fill={RIGHT_FIELD} />
      <g>
        <Label x={140} y={16}>left hemisphere</Label>
        <Label x={300} y={16}>right hemisphere</Label>
        <Label x={118} y={96}>speech</Label>
        <Label x={220} y={256}>corpus callosum cut</Label>
        <Label x={96} y={308}>left visual field</Label>
        <Label x={344} y={308}>right visual field</Label>
      </g>
    </ArtSvg>
  )
}
