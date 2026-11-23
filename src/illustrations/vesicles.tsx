import type { Stage, Vesicle } from '../sims/unfolding/model'
import { ArtSvg, INK, Label } from './Region'

/** One colour per secondary vesicle, shared by the drawing and the Lab's buttons. */
export const VESICLE_COLORS: Record<Vesicle, string> = {
  telencephalon: '#ff6b9a',
  diencephalon: '#ffa33d',
  mesencephalon: '#3dbe5a',
  metencephalon: '#1cb0f6',
  myelencephalon: '#9b82ff',
}
const PROS = '#ff8fb0'
const RHOMB = '#6bb8ff'
const PLATE = '#c9b8ff'
const CREST = '#ff8a3d'
const CORD = '#c9cdd4'

/** The developing nervous system seen from the back (head on the left), with a cross-section for the early stages. */
export function VesiclesArt({ stage = 'five', labels }: { stage?: Stage; labels?: boolean }) {
  const early = stage === 'plate' || stage === 'groove' || stage === 'tube'
  return (
    <ArtSvg viewBox="0 0 440 200" label="From neural plate to five vesicles">
      {stage === 'plate' && <path d="M30 100C30 50 130 56 150 80L290 84V116L150 120C130 144 30 150 30 100Z" fill={PLATE} stroke={INK} strokeWidth="2.5" />}
      {stage === 'groove' && (
        <g>
          <path d="M32 100C32 58 128 64 148 84L290 88V112L148 116C128 136 32 142 32 100Z" fill={PLATE} stroke={INK} strokeWidth="2.5" />
          <path d="M44 100H290" stroke={INK} strokeWidth="3" strokeDasharray="7 5" />
        </g>
      )}
      {stage === 'tube' && <path d="M30 100C30 70 110 74 130 92H290V108H130C110 126 30 130 30 100Z" fill={PLATE} stroke={INK} strokeWidth="2.5" />}
      {stage === 'three' && (
        <g stroke={INK} strokeWidth="2.5">
          <rect x="222" y="93" width="68" height="14" rx="7" fill={CORD} />
          <ellipse cx="192" cy="100" rx="36" ry="20" fill={RHOMB} />
          <ellipse cx="140" cy="100" rx="22" ry="22" fill={VESICLE_COLORS.mesencephalon} />
          <ellipse cx="72" cy="100" rx="46" ry="36" fill={PROS} />
        </g>
      )}
      {stage === 'five' && (
        <g stroke={INK} strokeWidth="2.5">
          <rect x="224" y="93" width="66" height="14" rx="7" fill={CORD} />
          <ellipse cx="212" cy="100" rx="18" ry="16" fill={VESICLE_COLORS.myelencephalon} />
          <ellipse cx="177" cy="100" rx="19" ry="20" fill={VESICLE_COLORS.metencephalon} />
          <ellipse cx="141" cy="100" rx="18" ry="20" fill={VESICLE_COLORS.mesencephalon} />
          <ellipse cx="104" cy="100" rx="20" ry="25" fill={VESICLE_COLORS.diencephalon} />
          <ellipse cx="55" cy="100" rx="32" ry="36" fill={VESICLE_COLORS.telencephalon} />
        </g>
      )}

      {early && (
        <g>
          <path d="M318 40V170" stroke="#e2e5ea" strokeWidth="2" />
          {stage === 'plate' && (
            <g>
              <path d="M330 86H436" stroke={CORD} strokeWidth="3" />
              <rect x="352" y="86" width="60" height="10" rx="3" fill={PLATE} stroke={INK} strokeWidth="2" />
              <circle cx="350" cy="91" r="5" fill={CREST} /><circle cx="414" cy="91" r="5" fill={CREST} />
            </g>
          )}
          {stage === 'groove' && (
            <g>
              <path d="M330 74H356Q366 74 371 112Q382 138 393 112Q398 74 408 74H436" fill="none" stroke={CORD} strokeWidth="3" />
              <path d="M356 77Q366 77 371 112Q382 136 393 112Q398 77 408 77" fill="none" stroke={PLATE} strokeWidth="9" />
              <circle cx="356" cy="74" r="5" fill={CREST} /><circle cx="408" cy="74" r="5" fill={CREST} />
            </g>
          )}
          {stage === 'tube' && (
            <g>
              <path d="M330 72H436" stroke={CORD} strokeWidth="3" />
              <circle cx="382" cy="112" r="19" fill="none" stroke={PLATE} strokeWidth="9" />
              <circle cx="370" cy="86" r="5" fill={CREST} /><circle cx="394" cy="86" r="5" fill={CREST} />
            </g>
          )}
        </g>
      )}

      {labels && (
        <g>
          <Label x={40} y={186} anchor="start">head end</Label>
          <Label x={290} y={186} anchor="end">tail end</Label>
          {stage === 'plate' && <Label x={210} y={140}>neural plate</Label>}
          {stage === 'groove' && <><Label x={210} y={140}>neural groove</Label><Label x={210} y={72}>neural folds</Label></>}
          {stage === 'tube' && <Label x={210} y={130}>neural tube</Label>}
          {early && <><Label x={382} y={34}>cross-section</Label><Label x={382} y={164}>neural crest (orange)</Label></>}
          {stage === 'three' && (
            <g>
              <Label x={318} y={60} anchor="start">prosencephalon</Label>
              <Label x={318} y={84} anchor="start">mesencephalon</Label>
              <Label x={318} y={108} anchor="start">rhombencephalon</Label>
              <Label x={318} y={132} anchor="start">spinal cord</Label>
            </g>
          )}
          {stage === 'five' && (
            <g>
              <Label x={318} y={48} anchor="start">telencephalon</Label>
              <Label x={318} y={72} anchor="start">diencephalon</Label>
              <Label x={318} y={96} anchor="start">mesencephalon</Label>
              <Label x={318} y={120} anchor="start">metencephalon</Label>
              <Label x={318} y={144} anchor="start">myelencephalon</Label>
              <Label x={318} y={168} anchor="start">spinal cord</Label>
            </g>
          )}
          {stage === 'three' && [PROS, VESICLE_COLORS.mesencephalon, RHOMB, CORD].map((c, i) => <circle key={c} cx={306} cy={55 + i * 24} r={6} fill={c} stroke={INK} strokeWidth="1.5" />)}
          {stage === 'five' && [...Object.values(VESICLE_COLORS), CORD].map((c, i) => <circle key={c} cx={306} cy={43 + i * 24} r={6} fill={c} stroke={INK} strokeWidth="1.5" />)}
        </g>
      )}
    </ArtSvg>
  )
}
