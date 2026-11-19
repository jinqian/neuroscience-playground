import { INK, Label } from './Region'

/** Length-dependent neuropathy: the longest axons fail first, at their far ends. */
export function NerveArt() {
  return (
    <svg viewBox="0 0 520 220" role="img" aria-label="Long axons to the feet are damaged first">
      <rect x="20" y="20" width="44" height="180" rx="22" fill="#c9b8ff" stroke={INK} strokeWidth="3" />
      <Label x={42} y={214}>spinal cord</Label>
      <path d="M64 50 H200" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <Label x={210} y={56} anchor="start">to the hand (shorter)</Label>
      <path d="M64 120 H360" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M360 120 H470" stroke="#ff4b6e" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 8" />
      <Label x={470} y={100} anchor="end">to the foot (longest)</Label>
      <g fill="#ff4b6e"><circle cx="410" cy="150" r="4" /><circle cx="440" cy="158" r="4" /><circle cx="470" cy="148" r="4" /></g>
      <Label x={420} y={186}>tingling starts here</Label>
    </svg>
  )
}
