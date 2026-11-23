import { ArtSvg, INK, Label, Region, type ArtProps } from './Region'

export const FOREBRAIN_TRACT_REGIONS = ['cortex', 'corpus-callosum', 'internal-capsule', 'lateral-ventricle', 'thalamus']

const GREY = '#ffb48a'
const WHITE = '#f3eee6'

/** A front-on (coronal) slice through the forebrain: the corpus callosum crossing the midline and the internal capsule running down beside the thalamus. */
export function ForebrainTractsArt(art: ArtProps) {
  return (
    <ArtSvg viewBox={art.labels ? '0 0 560 260' : '30 10 380 245'} label="The two big forebrain tracts (front-on slice)">
      <Region id="cortex" label="Cortex" art={art}>
        <path d="M216 30C150 20 60 50 50 130C45 190 100 235 160 230C190 228 208 215 216 200Z" fill={WHITE} stroke={GREY} strokeWidth="12" strokeLinejoin="round" />
        <path d="M224 30C290 20 380 50 390 130C395 190 340 235 280 230C250 228 232 215 224 200Z" fill={WHITE} stroke={GREY} strokeWidth="12" strokeLinejoin="round" />
      </Region>
      <Region id="internal-capsule" label="Internal capsule" art={art}>
        <path d="M172 104L186 204M268 104L254 204" stroke="#7b5cf0" strokeWidth="11" strokeLinecap="round" />
        <path d="M172 104L186 204M268 104L254 204" stroke="transparent" strokeWidth="24" />
      </Region>
      <Region id="lateral-ventricle" label="Lateral ventricle" art={art}>
        <path d="M206 98C190 100 184 116 194 132C200 126 206 114 206 98ZM234 98C250 100 256 116 246 132C240 126 234 114 234 98Z" fill="#2f6fde" stroke={INK} strokeWidth="1.5" />
        <rect x="182" y="96" width="76" height="40" fill="transparent" />
      </Region>
      <Region id="thalamus" label="Thalamus" art={art}>
        <ellipse cx="202" cy="168" rx="17" ry="24" fill="#f5b700" stroke={INK} strokeWidth="2" />
        <ellipse cx="238" cy="168" rx="17" ry="24" fill="#f5b700" stroke={INK} strokeWidth="2" />
      </Region>
      <Region id="corpus-callosum" label="Corpus callosum" art={art}>
        <path d="M146 96Q220 64 294 96" fill="none" stroke="#e05a2b" strokeWidth="12" strokeLinecap="round" />
        <path d="M146 96Q220 64 294 96" fill="none" stroke="transparent" strokeWidth="26" />
      </Region>
      {art.labels && (
        <g>
          <g stroke="#9aa0aa" strokeWidth="1.5" fill="none">
            <path d="M402 62H300L286 88" /><path d="M402 108H252" /><path d="M402 150H264" /><path d="M402 192H256" /><path d="M402 232H384L374 200" />
          </g>
          <Label x={408} y={66} anchor="start">corpus callosum</Label>
          <Label x={408} y={112} anchor="start">lateral ventricle</Label>
          <Label x={408} y={154} anchor="start">internal capsule</Label>
          <Label x={408} y={196} anchor="start">thalamus</Label>
          <Label x={408} y={236} anchor="start">cortex (grey matter)</Label>
          <Label x={136} y={252}>white matter</Label>
        </g>
      )}
    </ArtSvg>
  )
}
