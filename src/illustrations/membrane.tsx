import { INK, Label } from './Region'

/** Ions on both sides of the membrane, and the Na⁺/K⁺ pump. */
export function MembraneArt() {
  const na = (x: number, y: number) => <g key={`na${x}${y}`}><circle cx={x} cy={y} r="13" fill="#ffd98a" stroke={INK} strokeWidth="2" /><text x={x} y={y + 4} textAnchor="middle" className="ion">Na⁺</text></g>
  const k = (x: number, y: number) => <g key={`k${x}${y}`}><circle cx={x} cy={y} r="13" fill="#9ae6d8" stroke={INK} strokeWidth="2" /><text x={x} y={y + 4} textAnchor="middle" className="ion">K⁺</text></g>
  const cl = (x: number, y: number) => <g key={`cl${x}${y}`}><circle cx={x} cy={y} r="11" fill="#d7dcf5" stroke={INK} strokeWidth="2" /><text x={x} y={y + 4} textAnchor="middle" className="ion">Cl⁻</text></g>
  return (
    <svg viewBox="0 0 520 250" role="img" aria-label="Ions inside and outside a neuron's membrane">
      <rect x="0" y="0" width="520" height="110" fill="#fff7e0" />
      <rect x="0" y="134" width="520" height="116" fill="#eafaf6" />
      <rect x="0" y="110" width="520" height="24" fill="#ffd0e0" stroke={INK} strokeWidth="2" />
      {[na(40, 40), na(110, 74), na(190, 30), na(300, 60), na(470, 40), cl(150, 40), cl(250, 84), cl(240, 30)]}
      {[k(60, 180), k(140, 210), k(220, 170), k(320, 214), k(460, 190), k(400, 224)]}
      <rect x="352" y="104" width="44" height="36" rx="10" fill="#7b5cf0" stroke={INK} strokeWidth="2" />
      <text x="374" y="127" textAnchor="middle" className="ion ion--light">pump</text>
      <path d="M368 102 V80" stroke="#ff8a3d" strokeWidth="3" markerEnd="url(#arr)" />
      <path d="M382 140 V160" stroke="#14b8a6" strokeWidth="3" markerEnd="url(#arr2)" />
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#ff8a3d" /></marker>
        <marker id="arr2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#14b8a6" /></marker>
      </defs>
      <Label x={14} y={100} anchor="start">outside: more Na⁺, Cl⁻</Label>
      <Label x={14} y={152} anchor="start">inside: more K⁺ (−70 mV)</Label>
      <Label x={408} y={72} anchor="start">3 Na⁺ out</Label>
      <Label x={396} y={164} anchor="start">2 K⁺ in</Label>
    </svg>
  )
}
