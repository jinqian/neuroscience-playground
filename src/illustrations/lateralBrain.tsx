import { ArtSvg, INK, Label, Region, type ArtProps } from './Region'

export const LATERAL_REGIONS = ['prefrontal', 'motor-strip', 'broca', 'sensory-strip', 'parietal-association', 'wernicke', 'auditory', 'visual', 'cerebellum', 'brainstem']

const W = 470
const FILL: Record<string, string> = {
  prefrontal: '#cfe8ff', 'motor-strip': '#ffb3bd', broca: '#ffcf8a', 'sensory-strip': '#a8e6e0',
  'parietal-association': '#d9f2b4', wernicke: '#dcc6ff', auditory: '#fff1a8', visual: '#ffd0e6',
  cerebellum: '#bfe9dc', brainstem: '#e6d3f5',
}

/**
 * One hemisphere seen from the side, front on the left (left hemisphere).
 * `side="right"` mirrors the drawing so the front is on the right, as when looking at the right hemisphere.
 * A schematic: the zones are simplified outlines, not exact borders.
 */
export function LateralBrainArt({ side = 'left', ...art }: ArtProps & { side?: 'left' | 'right' }) {
  const mirror = side === 'right'
  const lx = (x: number) => (mirror ? W - x : x)
  const flip = (a: 'start' | 'end') => (mirror ? (a === 'start' ? 'end' : 'start') : a)
  const zone = (id: string, label: string, d: string) => (
    <Region id={id} label={label} art={art}>
      <path d={d} fill={FILL[id]} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    </Region>
  )
  return (
    <ArtSvg viewBox={`0 0 ${W} 330`} label="A hemisphere from the side" data-side={side}>
      <g transform={mirror ? `translate(${W},0) scale(-1,1)` : undefined}>
        <path d="M50 170C40 90 120 34 220 32C320 30 410 70 428 140C440 190 410 222 370 222L330 222C310 248 250 256 200 238C160 226 130 214 110 206C70 200 54 190 50 170Z" fill="#eef0f4" stroke={INK} strokeWidth="2.5" />
        {zone('prefrontal', 'Prefrontal cortex', 'M52 168C42 92 112 40 172 35L150 150L106 160L110 205C70 200 54 190 52 168Z')}
        {zone('broca', "Broca's area", 'M106 160L150 150L146 192L112 204Z')}
        {zone('motor-strip', 'Motor strip', 'M172 35L204 33L176 198L146 192Z')}
        {zone('sensory-strip', 'Sensory strip', 'M204 33L236 34L208 204L176 198Z')}
        {zone('parietal-association', 'Parietal association cortex', 'M236 34C300 32 360 52 392 92L340 180L300 186L212 178Z')}
        {zone('visual', 'Visual cortex', 'M392 92C420 118 438 170 412 210L370 222L340 180Z')}
        {zone('auditory', 'Auditory cortex', 'M178 204L250 198L252 216L184 224Z')}
        {zone('wernicke', "Wernicke's area", 'M252 198L330 190L336 212L254 218Z')}
        {zone('cerebellum', 'Cerebellum', 'M300 236C330 222 390 226 404 248C410 276 370 292 330 284C304 278 292 254 300 236Z')}
        {zone('brainstem', 'Brainstem', 'M236 236L272 240L268 318L244 318Z')}
      </g>
      {art.labels && (
        <g>
          <Label x={lx(96)} y={112}>prefrontal</Label>
          <Label x={lx(188)} y={22} anchor={flip('end')}>motor strip</Label>
          <Label x={lx(222)} y={22} anchor={flip('start')}>sensory strip</Label>
          <Label x={lx(126)} y={226}>Broca</Label>
          <Label x={lx(300)} y={110}>parietal</Label>
          <Label x={lx(404)} y={160}>visual</Label>
          <Label x={lx(215)} y={216}>auditory</Label>
          <Label x={lx(294)} y={209}>Wernicke</Label>
          <Label x={lx(356)} y={262}>cerebellum</Label>
          <Label x={lx(226)} y={300} anchor={flip('end')}>brainstem</Label>
          <Label x={lx(52)} y={56}>front</Label>
        </g>
      )}
    </ArtSvg>
  )
}
