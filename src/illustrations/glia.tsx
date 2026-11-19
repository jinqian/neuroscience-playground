import { INK, Label } from './Region'

/** Four glial cells: astrocyte on a blood vessel, oligodendrocyte, Schwann cell, microglia. */
export function GliaArt() {
  return (
    <svg viewBox="0 0 520 250" role="img" aria-label="Glial cells">
      {/* astrocyte touching a vessel */}
      <rect x="20" y="20" width="22" height="160" rx="11" fill="#ffb3c4" stroke={INK} strokeWidth="3" />
      <g stroke="#14b8a6" strokeWidth="5" strokeLinecap="round">
        <path d="M80 100 44 80 M80 100 44 120 M80 100 110 64 M80 100 116 128 M80 100 90 150" />
      </g>
      <circle cx="80" cy="100" r="16" fill="#9ae6d8" stroke={INK} strokeWidth="3" />
      <Label x={70} y={200}>astrocyte</Label>

      {/* oligodendrocyte wrapping 3 axons */}
      <g stroke={INK} strokeWidth="4"><path d="M170 40 H320 M170 100 H320 M170 160 H320" /></g>
      <g stroke="#7b5cf0" strokeWidth="3"><path d="M246 100 246 54 M246 100 246 146 M246 100 210 104" /></g>
      <g fill="#ffd98a" stroke={INK} strokeWidth="2.5">
        <rect x="226" y="30" width="40" height="20" rx="10" /><rect x="190" y="90" width="40" height="20" rx="10" /><rect x="226" y="150" width="40" height="20" rx="10" />
      </g>
      <circle cx="246" cy="100" r="13" fill="#c9b8ff" stroke={INK} strokeWidth="3" />
      <Label x={246} y={200}>oligodendrocyte (CNS)</Label>

      {/* Schwann cell wrapping 1 axon */}
      <path d="M350 70 H500" stroke={INK} strokeWidth="4" />
      <rect x="400" y="56" width="58" height="28" rx="14" fill="#ffd98a" stroke={INK} strokeWidth="3" />
      <circle cx="429" cy="52" r="8" fill="#c9b8ff" stroke={INK} strokeWidth="2.5" />
      <Label x={430} y={110}>Schwann cell (PNS)</Label>

      {/* microglia */}
      <g stroke="#ff8a3d" strokeWidth="3" strokeLinecap="round"><path d="M430 170 412 156 M430 170 450 154 M430 170 446 190 M430 170 412 188" /></g>
      <circle cx="430" cy="170" r="10" fill="#ffd0b0" stroke={INK} strokeWidth="2.5" />
      <Label x={430} y={226}>microglia</Label>
    </svg>
  )
}
