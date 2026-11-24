import { ArtSvg, INK, Label } from './Region'

const NERVE = '#f5b700'
const LOBE = '#eceff3'

/** The brain seen from below, with seven cranial nerves labelled on the right. Nerves leave both sides; only the right ones are named. */
export function CranialNervesArt() {
  return (
    <ArtSvg viewBox="0 0 540 360" label="Cranial nerves seen from below">
      <g fill={LOBE} stroke={INK} strokeWidth="2">
        <ellipse cx="170" cy="300" rx="58" ry="42" />
        <ellipse cx="290" cy="300" rx="58" ry="42" />
        <ellipse cx="190" cy="92" rx="40" ry="62" />
        <ellipse cx="270" cy="92" rx="40" ry="62" />
        <ellipse cx="130" cy="192" rx="45" ry="70" />
        <ellipse cx="330" cy="192" rx="45" ry="70" />
        <path d="M204 160H256L252 250Q246 300 240 336H220Q214 300 208 250Z" fill="#e6d3f5" />
      </g>
      <g stroke={NERVE} strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M205 112V44M255 112V44" />
        <path d="M188 116L230 150L272 116" />
        <path d="M214 184L176 178M246 184L284 178" />
        <path d="M206 214L156 228M254 214L304 228" strokeWidth="8" />
        <path d="M208 250L164 264M252 250L296 264" />
        <path d="M212 278L158 302M248 278L302 302" />
        <path d="M222 302L196 330M238 302L264 330" />
      </g>
      <g fill={NERVE} stroke={INK} strokeWidth="1.5">
        <ellipse cx="205" cy="42" rx="7" ry="11" />
        <ellipse cx="255" cy="42" rx="7" ry="11" />
      </g>
      <g stroke="#9aa0aa" strokeWidth="1.2" fill="none">
        <path d="M262 42H392" /><path d="M276 116H392" /><path d="M288 178H392" /><path d="M308 228H392" />
        <path d="M300 264H392" /><path d="M306 302H392" /><path d="M268 330H392" />
      </g>
      <g>
        <Label x={398} y={46} anchor="start">I olfactory: smell</Label>
        <Label x={398} y={120} anchor="start">II optic: sight</Label>
        <Label x={398} y={182} anchor="start">III oculomotor: eye</Label>
        <Label x={398} y={232} anchor="start">V trigeminal: face, jaw</Label>
        <Label x={398} y={268} anchor="start">VII facial: expression</Label>
        <Label x={398} y={306} anchor="start">X vagus: heart, gut</Label>
        <Label x={398} y={334} anchor="start">XII hypoglossal: tongue</Label>
        <Label x={230} y={196}>brainstem</Label>
        <Label x={190} y={16}>front</Label>
      </g>
    </ArtSvg>
  )
}
