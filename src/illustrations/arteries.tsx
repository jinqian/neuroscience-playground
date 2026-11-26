import { ArtSvg, INK, Label } from './Region'

const ART = '#d8343f'

/** The brain from below, front at the top: carotid and vertebral arteries feeding the circle of Willis and the three cerebral arteries. */
export function ArteriesArt() {
  return (
    <ArtSvg viewBox="0 0 800 420" label="The brain's arteries seen from below">
      <g fill="#eef0f4" stroke={INK} strokeWidth="2">
        <path d="M228 24C130 20 60 90 56 200C52 300 120 390 228 390Z" />
        <path d="M232 24C330 20 400 90 404 200C408 300 340 390 232 390Z" />
      </g>
      <path d="M210 230H250L246 330Q240 380 236 404H224Q220 380 214 330Z" fill="#e6d3f5" stroke={INK} strokeWidth="1.5" />
      <g fill="none" stroke={ART} strokeLinecap="round" strokeLinejoin="round">
        {/* vertebral arteries join into the basilar */}
        <path d="M206 404Q210 360 230 330M254 404Q250 360 230 330" strokeWidth="6" />
        <path d="M230 330V246" strokeWidth="8" />
        {/* posterior cerebral arteries */}
        <path d="M230 246Q200 236 186 238Q150 250 120 300M230 246Q260 236 274 238Q310 250 340 300" strokeWidth="6" />
        {/* posterior communicating links */}
        <path d="M188 238L184 196M272 238L276 196" strokeWidth="4" />
        {/* internal carotids, then middle and anterior cerebral arteries */}
        <path d="M184 196Q140 186 80 176M276 196Q320 186 380 176" strokeWidth="7" />
        <path d="M184 196Q200 170 216 146V56M276 196Q260 170 244 146V56" strokeWidth="6" />
        <path d="M216 146H244" strokeWidth="4" />
      </g>
      <g fill={ART} stroke={INK} strokeWidth="1.5">
        <circle cx="184" cy="196" r="9" />
        <circle cx="276" cy="196" r="9" />
      </g>
      <ellipse cx="230" cy="192" rx="64" ry="62" fill="none" stroke="#9aa0aa" strokeWidth="1.2" strokeDasharray="5 4" />
      <g stroke="#9aa0aa" strokeWidth="1.2" fill="none">
        <path d="M246 80H452" /><path d="M370 180H452" /><path d="M285 196Q360 214 452 214" />
        <path d="M292 160H452" /><path d="M336 286H452" /><path d="M232 320H452" /><path d="M252 390H452" />
      </g>
      <Label x={458} y={86} anchor="start" size={21}>anterior cerebral artery</Label>
      <Label x={458} y={160} anchor="start" size={21}>circle of Willis</Label>
      <Label x={458} y={186} anchor="start" size={21}>middle cerebral artery</Label>
      <Label x={458} y={220} anchor="start" size={21}>internal carotid artery</Label>
      <Label x={458} y={292} anchor="start" size={21}>posterior cerebral artery</Label>
      <Label x={458} y={326} anchor="start" size={21}>basilar artery</Label>
      <Label x={458} y={396} anchor="start" size={21}>vertebral artery</Label>
      <Label x={230} y={16} size={20}>front</Label>
    </ArtSvg>
  )
}
