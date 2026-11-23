import { ArtSvg, INK, Label, Region, type ArtProps } from './Region'

export const TUBE_DEFECT_REGIONS = ['head-end', 'tail-end']

const TUBE = '#c9b8ff'
const OPEN = '#ffd0e0'

/** The neural tube seen from the back, closing from the middle towards both ends. The ends are the last to close. */
export function TubeDefectsArt(art: ArtProps) {
  return (
    <ArtSvg viewBox="0 0 460 180" label="Where the neural tube can stay open">
      {/* closed middle */}
      <path d="M120 80C150 76 300 82 340 84V100C300 102 150 108 120 104Z" fill={TUBE} stroke={INK} strokeWidth="2.5" />
      <path d="M150 92H330" stroke={INK} strokeWidth="1.5" strokeDasharray="4 4" />
      <Region id="head-end" label="Head end" art={art}>
        <path d="M120 80C90 70 40 56 30 92C40 128 90 114 120 104" fill={OPEN} stroke={INK} strokeWidth="2.5" />
        <path d="M118 84C90 78 54 74 46 92C54 110 90 106 118 100" fill="#fff" stroke={TUBE} strokeWidth="4" />
        <rect x="24" y="52" width="100" height="80" fill="transparent" />
      </Region>
      <Region id="tail-end" label="Tail end" art={art}>
        <path d="M340 84C370 82 410 78 434 86V98C410 106 370 102 340 100" fill={OPEN} stroke={INK} strokeWidth="2.5" />
        <path d="M344 89C372 88 404 86 426 90V94C404 98 372 96 344 95" fill="#fff" stroke={TUBE} strokeWidth="3" />
        <rect x="336" y="60" width="104" height="64" fill="transparent" />
      </Region>
      <path d="M200 120h-50" stroke={INK} strokeWidth="2.5" markerEnd="url(#td-arrow)" />
      <path d="M260 120h50" stroke={INK} strokeWidth="2.5" markerEnd="url(#td-arrow)" />
      <defs>
        <marker id="td-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0L10 5L0 10z" fill={INK} />
        </marker>
      </defs>
      {art.labels && (
        <g>
          <Label x={230} y={124}>closes</Label>
          <Label x={74} y={40}>head end</Label>
          <Label x={390} y={50}>tail end</Label>
          <Label x={74} y={158}>open: anencephaly</Label>
          <Label x={390} y={140}>open: spina bifida</Label>
        </g>
      )}
    </ArtSvg>
  )
}
