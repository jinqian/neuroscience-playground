import { INK, Label, Region, type ArtProps } from './Region'

export const SPINAL_LEVEL_REGIONS = ['cervical', 'thoracic', 'lumbar', 'sacral']

const LEVELS = [
  { id: 'cervical', label: 'Cervical (neck): arms, diaphragm', count: 7, color: '#9b82ff' },
  { id: 'thoracic', label: 'Thoracic (chest): trunk', count: 12, color: '#1cb0f6' },
  { id: 'lumbar', label: 'Lumbar (lower back): legs', count: 5, color: '#3dbe5a' },
  { id: 'sacral', label: 'Sacral: bladder, bowel, sex organs', count: 5, color: '#ff8a3d' },
]

/** The spine as stacked vertebrae, coloured by level. */
export function SpinalLevelsArt(art: ArtProps) {
  let y = 20
  return (
    <svg viewBox="0 0 520 380" role="img" aria-label="Levels of the spinal cord">
      {LEVELS.map((lv) => {
        const top = y
        const h = lv.count * 11
        y += h + 6
        return (
          <Region key={lv.id} id={lv.id} label={lv.label} art={art}>
            <rect x="150" y={top - 3} width="70" height={h + 6} fill="transparent" />
            {Array.from({ length: lv.count }, (_, i) => (
              <rect key={i} x={lv.id === 'sacral' ? 166 - i * -1 : 160} y={top + i * 11} width={lv.id === 'sacral' ? 50 - i * 6 : 50} height="9" rx="3"
                fill={lv.color} stroke={INK} strokeWidth="1.5" />
            ))}
            {art.labels && <Label x={240} y={top + h / 2 + 5} anchor="start">{lv.label}</Label>}
          </Region>
        )
      })}
      <ellipse cx="185" cy="12" rx="40" ry="10" fill="#c9b8ff" stroke={INK} strokeWidth="2" />
    </svg>
  )
}
