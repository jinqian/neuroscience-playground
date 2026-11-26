import { useId } from 'react'
import { ArtSvg, INK, Label, Region, type ArtProps } from './Region'

export const ARTERIES = ['aca', 'mca', 'pca'] as const
export type Artery = (typeof ARTERIES)[number]

export const TERRITORY_COLOR: Record<Artery, string> = { aca: '#7cc4ff', mca: '#ff9f6b', pca: '#b48cff' }

/** Outlines shared with the side-view brain (front on the left). */
const W = 470
const CEREBRUM = 'M50 170C40 90 120 34 220 32C320 30 410 70 428 140C440 190 410 222 370 222L330 222C310 248 250 256 200 238C160 226 130 214 110 206C70 200 54 190 50 170Z'
const CEREBELLUM = 'M300 236C330 222 390 226 404 248C410 276 370 292 330 284C304 278 292 254 300 236Z'
const BRAINSTEM = 'M236 236L272 240L268 318L244 318Z'

/** Where each artery's territory lies, as shapes clipped to the hemisphere's outline. A simplification. */
const SIDE_AREAS: Record<Artery, string> = {
  mca: 'M0 0H470V330H0Z',
  aca: 'M40 150C60 70 140 26 230 24C300 22 340 34 362 50L352 74C318 56 280 52 232 54C160 56 100 90 72 150Z',
  pca: 'M386 70L470 110V330H230L246 238L330 214L360 150Z',
}
const MIDDLE_AREAS: Record<Artery, string> = {
  mca: '', // the middle cerebral artery barely reaches the inner surface
  aca: 'M0 0H340L320 120L250 150H170L120 210H0Z',
  pca: 'M340 0H470V330H0V210H120L170 150H250L320 120Z',
}

/** `front`: which way the front of the brain points in this drawing. */
type ViewProps = { lit?: Artery; front: 'left' | 'right' }

function View({ areas, extra, lit, front, x, title, view }: ViewProps & { areas: Record<Artery, string>; extra?: React.ReactNode; x: number; title: string; view: 'side' | 'middle' }) {
  const clip = useId()
  const mirror = front === 'right'
  const lx = (v: number) => (mirror ? W - v : v)
  return (
    <g transform={`translate(${x},10)`} data-view={view} data-front={front}>
      <defs><clipPath id={clip}><path d={CEREBRUM} /></clipPath></defs>
      <g transform={mirror ? `translate(${W},0) scale(-1,1)` : undefined}>
        <path d={CEREBRUM} fill="#eef0f4" />
        <g clipPath={`url(#${clip})`}>
          {(['mca', 'aca', 'pca'] as const).map((a) => (
            <path key={a} d={areas[a]} data-artery={a} data-lit={!lit || lit === a ? 'true' : 'false'}
              fill={TERRITORY_COLOR[a]} opacity={!lit || lit === a ? 1 : 0.22} />
          ))}
        </g>
        {extra}
        <path d={CEREBRUM} fill="none" stroke={INK} strokeWidth="2.5" />
        <path d={CEREBELLUM} fill="#e3e5ea" stroke={INK} strokeWidth="1.5" />
        <path d={BRAINSTEM} fill="#e3e5ea" stroke={INK} strokeWidth="1.5" />
      </g>
      <Label x={lx(60)} y={30} size={24}>front</Label>
      <Label x={W / 2} y={340} size={26}>{title}</Label>
    </g>
  )
}

/**
 * One hemisphere seen from the side and from the middle (cut down the midline), each artery's territory in its colour.
 * Seen from the midline, a hemisphere's front points the other way from its side view, as in anatomy books.
 * `lit` brings one territory forward and fades the others. `side="right"` shows the right hemisphere.
 */
export function TerritoryViewsArt({ lit, side = 'left' }: { lit?: Artery; side?: 'left' | 'right' }) {
  const callosum = <path d="M150 140C190 104 300 100 340 136C320 128 200 124 170 150Z" fill="#fbfbfd" stroke={INK} strokeWidth="1.5" />
  return (
    <ArtSvg viewBox="0 0 960 360" label="Artery territories, from the side and from the middle" data-side={side}>
      {side === 'left'
        ? <>
            <View view="side" areas={SIDE_AREAS} lit={lit} front="left" x={0} title="side view" />
            <View view="middle" areas={MIDDLE_AREAS} extra={callosum} lit={lit} front="right" x={490} title="middle view" />
          </>
        : <>
            <View view="middle" areas={MIDDLE_AREAS} extra={callosum} lit={lit} front="left" x={0} title="middle view" />
            <View view="side" areas={SIDE_AREAS} lit={lit} front="right" x={490} title="side view" />
          </>}
    </ArtSvg>
  )
}

export const TERRITORY_REGIONS = ['aca-left', 'mca-left', 'pca-left', 'aca-right', 'mca-right', 'pca-right']

const HEMI_LEFT = 'M204 40C120 30 58 92 54 200C50 300 110 376 204 370Z'
const HEMI_RIGHT = 'M216 40C300 30 362 92 366 200C370 300 310 376 216 370Z'

/** Both hemispheres seen from above, front at the top, the left hemisphere on the left. */
export function TerritoriesTopArt(art: ArtProps) {
  const id = useId()
  const L = `${id}l`
  const R = `${id}r`
  const area = (clip: string, d: string, a: Artery) => <path d={d} clipPath={`url(#${clip})`} fill={TERRITORY_COLOR[a]} stroke={INK} strokeWidth="1" />
  return (
    <ArtSvg viewBox="0 0 420 410" label="Artery territories, both hemispheres seen from above">
      <defs>
        <clipPath id={L}><path d={HEMI_LEFT} /></clipPath>
        <clipPath id={R}><path d={HEMI_RIGHT} /></clipPath>
      </defs>
      <Region id="mca-left" label="Left middle cerebral artery territory" art={art}>{area(L, 'M0 0H162V306H0Z', 'mca')}</Region>
      <Region id="aca-left" label="Left anterior cerebral artery territory" art={art}>{area(L, 'M162 0H210V306H162Z', 'aca')}</Region>
      <Region id="pca-left" label="Left posterior cerebral artery territory" art={art}>{area(L, 'M0 306H210V410H0Z', 'pca')}</Region>
      <Region id="mca-right" label="Right middle cerebral artery territory" art={art}>{area(R, 'M258 0H420V306H258Z', 'mca')}</Region>
      <Region id="aca-right" label="Right anterior cerebral artery territory" art={art}>{area(R, 'M210 0H258V306H210Z', 'aca')}</Region>
      <Region id="pca-right" label="Right posterior cerebral artery territory" art={art}>{area(R, 'M210 306H420V410H210Z', 'pca')}</Region>
      <path d={HEMI_LEFT} fill="none" stroke={INK} strokeWidth="2.5" pointerEvents="none" />
      <path d={HEMI_RIGHT} fill="none" stroke={INK} strokeWidth="2.5" pointerEvents="none" />
      <Label x={210} y={24}>front</Label>
      <Label x={60} y={398}>left</Label>
      <Label x={360} y={398}>right</Label>
      {art.labels && (
        <g>
          <Label x={110} y={190}>MCA</Label>
          <Label x={310} y={190}>MCA</Label>
          <Label x={186} y={150}>ACA</Label>
          <Label x={234} y={150}>ACA</Label>
          <Label x={150} y={345}>PCA</Label>
          <Label x={270} y={345}>PCA</Label>
        </g>
      )}
    </ArtSvg>
  )
}
