import { ArtSvg, INK, Label, Region, type ArtProps } from './Region'

export const AUTONOMIC_REGIONS = ['brainstem-vagus', 'thoracolumbar-chain', 'sacral-outflow', 'heart', 'gut', 'pupil']

const SYM = '#ff8a3d'
const PARA = '#14b8a6'

/** Where each autonomic branch leaves the CNS, and three organs they both reach. */
export function AutonomicArt(art: ArtProps) {
  return (
    <ArtSvg viewBox="0 0 520 330" label="Sympathetic and parasympathetic outflow">
      <ellipse cx="120" cy="40" rx="62" ry="32" fill="#c9b8ff" stroke={INK} strokeWidth="3" />
      <rect x="111" y="70" width="18" height="250" rx="9" fill="#e9e3ff" stroke={INK} strokeWidth="2.5" />
      <Region id="brainstem-vagus" label="Brainstem and vagus nerve" art={art}>
        <rect x="108" y="66" width="24" height="34" rx="8" fill={PARA} stroke={INK} strokeWidth="2.5" />
        <path d="M132 84 C220 90 300 100 370 120 M300 102 C340 150 360 200 380 210" stroke={PARA} strokeWidth="4" fill="none" strokeDasharray="8 5" />
        <path d="M132 84 C220 90 300 100 370 120" stroke="transparent" strokeWidth="18" fill="none" />
      </Region>
      <Region id="thoracolumbar-chain" label="Thoracic and lumbar cord (sympathetic)" art={art}>
        <rect x="108" y="120" width="24" height="110" rx="8" fill={SYM} stroke={INK} strokeWidth="2.5" />
        <g fill="#ffd0b0" stroke={INK} strokeWidth="2">{[130, 152, 174, 196, 218].map((y) => <circle key={y} cx="160" cy={y} r="6" />)}</g>
        <path d="M166 140 C260 120 320 60 380 54 M166 170 C260 160 330 130 380 132 M166 210 C260 220 330 220 380 214" stroke={SYM} strokeWidth="3" fill="none" />
      </Region>
      <Region id="sacral-outflow" label="Sacral cord (parasympathetic)" art={art}>
        <rect x="108" y="262" width="24" height="44" rx="8" fill={PARA} stroke={INK} strokeWidth="2.5" />
        <path d="M132 284 C250 290 330 260 384 226" stroke={PARA} strokeWidth="4" fill="none" strokeDasharray="8 5" />
      </Region>
      <Region id="pupil" label="Eye (pupil)" art={art}>
        <circle cx="400" cy="50" r="20" fill="#fff" stroke={INK} strokeWidth="3" />
        <circle cx="400" cy="50" r="8" fill={INK} />
      </Region>
      <Region id="heart" label="Heart" art={art}>
        <path d="M400 150 C370 128 372 104 390 104 C398 104 400 112 400 116 C400 112 402 104 410 104 C428 104 430 128 400 150 Z" fill="#ff4b6e" stroke={INK} strokeWidth="3" />
      </Region>
      <Region id="gut" label="Gut" art={art}>
        <path d="M384 200 C384 186 420 186 420 200 C420 212 392 210 392 222 C392 234 428 232 428 246" fill="none" stroke="#ffb3c4" strokeWidth="14" strokeLinecap="round" />
        <path d="M384 200 C384 186 420 186 420 200 C420 212 392 210 392 222 C392 234 428 232 428 246" fill="none" stroke={INK} strokeWidth="2" />
      </Region>
      {art.labels && (
        <g>
          <Label x={140} y={100} anchor="start">brainstem → vagus</Label>
          <Label x={176} y={252} anchor="start">sympathetic chain</Label>
          <Label x={140} y={322} anchor="start">sacral</Label>
          <Label x={428} y={56} anchor="start">pupil</Label>
          <Label x={436} y={132} anchor="start">heart</Label>
          <Label x={440} y={226} anchor="start">gut</Label>
          <Label x={24} y={150} anchor="start">orange =</Label>
          <Label x={24} y={168} anchor="start">sympathetic</Label>
          <Label x={24} y={192} anchor="start">green =</Label>
          <Label x={24} y={210} anchor="start">parasym-</Label>
          <Label x={24} y={228} anchor="start">pathetic</Label>
        </g>
      )}
    </ArtSvg>
  )
}
