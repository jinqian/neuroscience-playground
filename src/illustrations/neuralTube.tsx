import { ArtSvg, INK, Label } from './Region'

const PLATE = '#c9b8ff'
const CREST = '#ff8a3d'
const SKIN = '#c9cdd4'

/** Three cross-sections of the embryo's back: the neural plate folds, closes into a tube, and neural crest cells leave its edges. */
export function NeuralTubeArt() {
  return (
    <ArtSvg viewBox="0 0 450 190" label="Folding the neural tube (cross-sections)">
      {/* 1. flat plate */}
      <path d="M10 70H140" stroke={SKIN} strokeWidth="4" />
      <rect x="40" y="70" width="70" height="11" rx="3" fill={PLATE} stroke={INK} strokeWidth="2" />
      <circle cx="38" cy="75" r="6" fill={CREST} stroke={INK} strokeWidth="1.5" />
      <circle cx="112" cy="75" r="6" fill={CREST} stroke={INK} strokeWidth="1.5" />
      <path d="M146 90h14" stroke={INK} strokeWidth="3" markerEnd="url(#nt-arrow)" />

      {/* 2. groove and folds */}
      <path d="M165 60H192Q203 60 208 100Q218 128 228 100Q233 60 244 60H290" fill="none" stroke={SKIN} strokeWidth="4" />
      <path d="M192 64Q203 64 208 100Q218 125 228 100Q233 64 244 64" fill="none" stroke={PLATE} strokeWidth="11" />
      <circle cx="192" cy="60" r="6" fill={CREST} stroke={INK} strokeWidth="1.5" />
      <circle cx="244" cy="60" r="6" fill={CREST} stroke={INK} strokeWidth="1.5" />
      <path d="M296 90h14" stroke={INK} strokeWidth="3" markerEnd="url(#nt-arrow)" />

      {/* 3. closed tube, crest cells leaving */}
      <path d="M315 58H445" stroke={SKIN} strokeWidth="4" />
      <circle cx="380" cy="104" r="22" fill="#fff" stroke={PLATE} strokeWidth="11" />
      <circle cx="380" cy="104" r="22" fill="none" stroke={INK} strokeWidth="1.5" />
      <circle cx="352" cy="76" r="6" fill={CREST} stroke={INK} strokeWidth="1.5" />
      <circle cx="408" cy="76" r="6" fill={CREST} stroke={INK} strokeWidth="1.5" />
      <circle cx="338" cy="100" r="5" fill={CREST} stroke={INK} strokeWidth="1.5" />
      <circle cx="422" cy="100" r="5" fill={CREST} stroke={INK} strokeWidth="1.5" />

      <defs>
        <marker id="nt-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0L10 5L0 10z" fill={INK} />
        </marker>
      </defs>

      <g>
        <Label x={75} y={30}>1</Label>
        <Label x={218} y={30}>2</Label>
        <Label x={380} y={30}>3</Label>
        <Label x={75} y={110}>neural plate</Label>
        <Label x={218} y={150}>neural groove</Label>
        <Label x={380} y={150}>neural tube</Label>
        <Label x={380} y={50}>skin (ectoderm)</Label>
        <Label x={225} y={180}>orange = neural crest</Label>
      </g>
    </ArtSvg>
  )
}
