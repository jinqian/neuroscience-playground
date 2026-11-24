import { ArtSvg, INK, Label } from './Region'

const PATH = '#7b5cf0'

/** The classic language circuit on a left hemisphere seen from the side: hear → understand → arcuate fasciculus → plan speech → move the mouth. */
export function LanguageCircuitArt() {
  return (
    <ArtSvg viewBox="0 0 470 300" label="The classic language circuit">
      <path d="M50 170C40 90 120 34 220 32C320 30 410 70 428 140C440 190 410 222 370 222L330 222C310 248 250 256 200 238C160 226 130 214 110 206C70 200 54 190 50 170Z" fill="#eef0f4" stroke={INK} strokeWidth="2.5" />
      <path d="M172 35L204 33L176 198L146 192Z" fill="#ffb3bd" stroke={INK} strokeWidth="1.5" />
      <path d="M106 160L150 150L146 192L112 204Z" fill="#ffcf8a" stroke={INK} strokeWidth="1.5" />
      <path d="M178 204L250 198L252 216L184 224Z" fill="#fff1a8" stroke={INK} strokeWidth="1.5" />
      <path d="M252 198L330 190L336 212L254 218Z" fill="#dcc6ff" stroke={INK} strokeWidth="1.5" />
      <path d="M296 196C300 120 190 110 132 166" fill="none" stroke={PATH} strokeWidth="5" strokeLinecap="round" markerEnd="url(#lc-arrow)" />
      <path d="M214 268V226" stroke={PATH} strokeWidth="4" markerEnd="url(#lc-arrow)" />
      <path d="M238 210H262" stroke={PATH} strokeWidth="4" markerEnd="url(#lc-arrow)" />
      <path d="M146 176L160 172" stroke={PATH} strokeWidth="4" markerEnd="url(#lc-arrow)" />
      <path d="M172 204L124 254" stroke={PATH} strokeWidth="4" markerEnd="url(#lc-arrow)" />
      <defs>
        <marker id="lc-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0L10 5L0 10z" fill={PATH} />
        </marker>
      </defs>
      <g>
        <Label x={214} y={286}>1 hear</Label>
        <Label x={336} y={244}>2 understand (Wernicke)</Label>
        <Label x={262} y={118} anchor="start">3 arcuate fasciculus</Label>
        <Label x={100} y={176} anchor="end">4 plan (Broca)</Label>
        <Label x={190} y={24}>5 motor strip</Label>
        <Label x={110} y={274}>6 speak</Label>
      </g>
    </ArtSvg>
  )
}
