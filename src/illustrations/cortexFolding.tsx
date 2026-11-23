import { ArtSvg, INK, Label } from './Region'

const CORTEX = '#ffb48a'
const WHITE = '#f3eee6'

/** Left: a smooth vs a folded cortex, in section. Right: a hemisphere from the side, growing in a C. */
export function CortexFoldingArt() {
  return (
    <ArtSvg viewBox="0 0 470 232" label="How the cortex grows and folds">
      {/* smooth */}
      <rect x="20" y="40" width="180" height="40" fill={WHITE} />
      <rect x="20" y="40" width="180" height="12" fill={CORTEX} stroke={INK} strokeWidth="1.5" />
      {/* folded */}
      <path d="M20 140 Q35 118 50 140 V170 Q55 178 60 170 V140 Q75 118 90 140 V172 Q95 180 100 172 V140 Q115 118 130 140 V168 Q135 176 140 168 V140 Q155 118 170 140 V170 Q175 178 180 170 V140 Q190 124 200 140 V190 H20Z"
        fill={WHITE} />
      <path d="M20 140 Q35 118 50 140 V170 Q55 178 60 170 V140 Q75 118 90 140 V172 Q95 180 100 172 V140 Q115 118 130 140 V168 Q135 176 140 168 V140 Q155 118 170 140 V170 Q175 178 180 170 V140 Q190 124 200 140"
        fill="none" stroke={CORTEX} strokeWidth="11" strokeLinejoin="round" />

      {/* hemisphere, side view, front on the left */}
      <path d="M262 112C252 62 312 32 372 38C428 44 456 84 448 116C444 142 420 156 398 150C392 176 350 186 318 170C300 162 296 146 300 136C278 134 264 126 262 112Z"
        fill="#eceff3" stroke={INK} strokeWidth="2.5" />
      <path d="M300 136C318 130 352 126 398 150" fill="none" stroke={INK} strokeWidth="1.5" />
      <path d="M296 92C312 56 388 48 418 78C442 102 430 132 398 136C370 140 340 140 318 150"
        fill="none" stroke="#7b5cf0" strokeWidth="5" strokeLinecap="round" markerEnd="url(#cf-arrow)" />
      <defs>
        <marker id="cf-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0L10 5L0 10z" fill="#7b5cf0" />
        </marker>
      </defs>

      <g>
        <Label x={110} y={28}>smooth (early)</Label>
        <Label x={110} y={110}>folded (adult)</Label>
        <Label x={110} y={206}>gyrus = ridge</Label>
        <Label x={110} y={226}>sulcus = groove</Label>
        <Label x={360} y={22}>grows in a C</Label>
        <Label x={256} y={206} anchor="start">front</Label>
        <Label x={372} y={206}>temporal lobe</Label>
      </g>
    </ArtSvg>
  )
}
