import { INK, Label } from './Region'

/** The shape of one spike, with its phases labelled. */
export function ActionPotentialArt() {
  // x: 0–30 ms → 50–500 px; y: −90…+50 mV → 220…20 px
  const x = (t: number) => 50 + (t / 10) * 450
  const y = (v: number) => 220 - ((v + 90) / 140) * 200
  const pts: Array<[number, number]> = [[0, -70], [2, -70], [2.6, -55], [3.4, 40], [4.6, -80], [5.5, -76], [7, -72], [10, -70]]
  const d = pts.map(([t, v], i) => `${i ? 'L' : 'M'}${x(t)} ${y(v)}`).join(' ')
  return (
    <svg viewBox="0 0 520 250" role="img" aria-label="Voltage during an action potential">
      <path d={`M50 ${y(-70)} H500`} stroke="#c9cdd4" strokeWidth="2" />
      <path d={`M50 ${y(-55)} H500`} stroke="#ffc93c" strokeWidth="2" strokeDasharray="6 6" />
      <path d={`M50 ${y(0)} H500`} stroke="#e3e6eb" strokeWidth="1.5" />
      <path d="M50 20 V228" stroke={INK} strokeWidth="2" />
      <text x="44" y={y(40) + 4} textAnchor="end" className="art-label">+40</text>
      <text x="44" y={y(0) + 4} textAnchor="end" className="art-label">0</text>
      <text x="44" y={y(-55) + 4} textAnchor="end" className="art-label">−55</text>
      <text x="44" y={y(-70) + 10} textAnchor="end" className="art-label">−70</text>
      <path d={d} fill="none" stroke="#ff4b6e" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      <Label x={x(2.9) - 10} y={y(10)} anchor="end">Na⁺ in</Label>
      <Label x={x(4.2) + 10} y={y(10)} anchor="start">K⁺ out</Label>
      <Label x={x(3.4)} y={y(40) - 8}>peak</Label>
      <Label x={x(5)} y={y(-80) + 18}>undershoot</Label>
      <Label x={x(8.6)} y={y(-55) - 6}>threshold</Label>
      <Label x={x(8.6)} y={y(-70) + 18}>rest</Label>
      <Label x={275} y={246}>time (about 1 ms per spike) →</Label>
    </svg>
  )
}
