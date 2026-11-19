import type { KeyboardEvent, ReactNode } from 'react'

export type ArtProps = {
  /** Show text labels (card illustration) or not (tap question). */
  labels?: boolean
  onTap?(regionId: string): void
  picked?: string
}

/** A tappable part of a figure. Without onTap it's just a group. */
export function Region({ id, label, art, children }: { id: string; label: string; art: ArtProps; children: ReactNode }) {
  if (!art.onTap) return <g>{children}</g>
  const tap = () => art.onTap?.(id)
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap() }
  }
  return (
    <g role="button" tabIndex={0} aria-label={label} aria-pressed={art.picked === id}
      className={`region ${art.picked === id ? 'region--picked' : ''}`} onClick={tap} onKeyDown={onKey}>
      {children}
    </g>
  )
}

/** Label text in the house style. */
export function Label({ x, y, children, anchor = 'middle' }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end' }) {
  return <text x={x} y={y} textAnchor={anchor} className="art-label">{children}</text>
}

export const INK = '#2b2f38'
