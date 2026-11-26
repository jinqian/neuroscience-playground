import { ArtSvg, INK, Label, Region, type ArtProps } from './Region'

export const BLEED_REGIONS = ['epidural', 'subdural', 'subarachnoid']

const BLOOD = '#b3261e'

/** A cut from the skull down to the brain, with a bleed at each level: above the dura, under it, and in the fluid around the brain. */
export function BleedsArt(art: ArtProps) {
  return (
    <ArtSvg viewBox="0 0 520 290" label="Three kinds of bleed between the skull and the brain">
      <rect x="20" y="40" width="480" height="40" rx="8" fill="#efe6d2" stroke={INK} strokeWidth="3" />
      <path d="M20 86H60Q115 120 170 86H500V112H170Q115 146 60 112H20Z" fill="#ff9e7a" stroke={INK} strokeWidth="3" />
      <rect x="20" y="132" width="480" height="12" fill="#ffd0e0" stroke={INK} strokeWidth="2" />
      <rect x="20" y="144" width="480" height="40" fill="#cfefff" opacity=".7" />
      <path d="M20 184Q70 172 120 184T220 184T320 184T420 184T500 184V280H20Z" fill="#c9b8ff" stroke={INK} strokeWidth="3" />
      <path d="M20 180Q70 168 120 180T220 180T320 180T420 180T500 180" fill="none" stroke="#2f80ed" strokeWidth="4" />
      <Region id="epidural" label="Bleed between the skull and the dura" art={art}>
        <path d="M60 84Q115 118 170 84Q115 76 60 84Z" fill={BLOOD} stroke={INK} strokeWidth="1.5" />
      </Region>
      <Region id="subdural" label="Bleed under the dura" art={art}>
        <path d="M200 114Q270 138 340 114Q270 120 200 114Z" fill={BLOOD} stroke={INK} strokeWidth="1.5" />
        <rect x="200" y="112" width="140" height="18" fill="transparent" />
      </Region>
      <Region id="subarachnoid" label="Bleed in the fluid around the brain" art={art}>
        <path d="M370 146H490V176Q470 168 450 178T410 178T370 176Z" fill={BLOOD} opacity=".75" />
        <path d="M418 176Q422 196 430 200Q438 196 442 176Z" fill={BLOOD} opacity=".75" />
      </Region>
      {art.labels && (
        <g>
          <Label x={300} y={66}>skull</Label>
          <Label x={420} y={104}>dura mater</Label>
          <Label x={120} y={162}>arachnoid mater</Label>
          <Label x={260} y={240}>brain</Label>
          <Label x={150} y={206}>pia mater</Label>
          <Label x={115} y={28}>epidural</Label>
          <Label x={270} y={28}>subdural</Label>
          <Label x={430} y={28}>subarachnoid</Label>
          <g stroke="#9aa0aa" strokeWidth="1.2" fill="none">
            <path d="M115 32V92" /><path d="M270 32V120" /><path d="M430 32V158" />
          </g>
        </g>
      )}
    </ArtSvg>
  )
}
