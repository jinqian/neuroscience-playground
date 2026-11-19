import { INK, Label } from './Region'

/** Three neuron shapes side by side. */
export function NeuronTypesArt() {
  const soma = (cx: number, cy: number) => <ellipse cx={cx} cy={cy} rx="16" ry="14" fill="#c9b8ff" stroke={INK} strokeWidth="3" />
  return (
    <svg viewBox="0 0 520 240" role="img" aria-label="Multipolar, bipolar and pseudounipolar neurons">
      <g stroke="#7b5cf0" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M80 70 52 40 M80 70 96 34 M80 70 120 52 M80 70 40 78 M80 70 46 104" />
      </g>
      <path d="M86 84 V200" stroke={INK} strokeWidth="5" />
      <g fill="#ff8a3d" stroke={INK} strokeWidth="2.5"><circle cx="76" cy="206" r="6" /><circle cx="96" cy="206" r="6" /></g>
      {soma(82, 72)}

      <path d="M260 30 V68" stroke="#7b5cf0" strokeWidth="5" strokeLinecap="round" />
      <path d="M248 22 260 34 272 22" stroke="#7b5cf0" strokeWidth="5" strokeLinecap="round" fill="none" />
      {soma(260, 84)}
      <path d="M260 98 V200" stroke={INK} strokeWidth="5" />
      <circle cx="260" cy="206" r="6" fill="#ff8a3d" stroke={INK} strokeWidth="2.5" />

      <path d="M360 120 H500" stroke={INK} strokeWidth="5" />
      <path d="M430 120 V92" stroke={INK} strokeWidth="5" />
      {soma(430, 78)}
      <path d="M500 120 l12 -12 M500 120 l12 0 M500 120 l12 12" stroke="#7b5cf0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="356" cy="120" r="6" fill="#ff8a3d" stroke={INK} strokeWidth="2.5" />

      <Label x={84} y={236}>multipolar</Label>
      <Label x={260} y={236}>bipolar</Label>
      <Label x={430} y={160}>pseudounipolar</Label>
      <Label x={490} y={100} anchor="end">from skin</Label>
      <Label x={370} y={146} anchor="start">to spinal cord</Label>
    </svg>
  )
}
