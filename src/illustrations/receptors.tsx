import { ArtSvg, INK, Label } from './Region'

/** Ionotropic (a channel) vs metabotropic (G-protein cascade). */
export function ReceptorsArt() {
  return (
    <ArtSvg viewBox="0 0 520 230" label="Ionotropic and metabotropic receptors">
      <rect x="0" y="80" width="520" height="30" fill="#ffd0e0" stroke={INK} strokeWidth="2" />
      {/* ionotropic channel */}
      <rect x="92" y="70" width="18" height="50" rx="6" fill="#ff4b6e" stroke={INK} strokeWidth="2.5" />
      <rect x="130" y="70" width="18" height="50" rx="6" fill="#ff4b6e" stroke={INK} strokeWidth="2.5" />
      <circle cx="120" cy="56" r="6" fill="#7b5cf0" />
      <g fill="#ffd98a" stroke={INK} strokeWidth="1.5"><circle cx="120" cy="30" r="8" /><circle cx="120" cy="96" r="8" /><circle cx="120" cy="150" r="8" /></g>
      <path d="M120 40 V176" stroke="#ff8a3d" strokeWidth="3" strokeDasharray="5 5" />
      <Label x={120} y={204}>ionotropic: ions flow at once</Label>
      {/* metabotropic */}
      <path d="M330 70 C320 90 340 100 330 120 M346 70 C356 90 336 100 346 120" stroke="#14b8a6" strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="338" cy="56" r="6" fill="#7b5cf0" />
      <ellipse cx="380" cy="132" rx="18" ry="12" fill="#9ae6d8" stroke={INK} strokeWidth="2" />
      <text x="380" y="136" textAnchor="middle" className="ion">G</text>
      <g fill="none" stroke="#14b8a6" strokeWidth="3"><path d="M398 140 Q420 160 440 150" /><path d="M440 150 Q460 170 480 162" /></g>
      <g fill="#ffd98a" stroke={INK} strokeWidth="1.5"><circle cx="442" cy="150" r="6" /><circle cx="482" cy="162" r="6" /><circle cx="470" cy="190" r="6" /><circle cx="496" cy="186" r="6" /></g>
      <Label x={400} y={220}>metabotropic: a slower cascade</Label>
      <Label x={260} y={74}>membrane</Label>
    </ArtSvg>
  )
}
