import type { KeyboardEvent, ReactNode, SVGProps } from 'react'
import { useLang } from '../i18n/LanguageProvider'
import { artText } from './artText'

export type ArtProps = {
  /** Show text labels (card illustration) or not (tap question). */
  labels?: boolean
  onTap?(regionId: string): void
  picked?: string
}

/** A tappable part of a figure. Without onTap it's just a group. */
export function Region({ id, label, art, children }: { id: string; label: string; art: ArtProps; children: ReactNode }) {
  const { lang } = useLang()
  if (!art.onTap) return <g>{children}</g>
  const tap = () => art.onTap?.(id)
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap() }
  }
  return (
    <g role="button" tabIndex={0} aria-label={artText(label, lang)} aria-pressed={art.picked === id}
      className={`region ${art.picked === id ? 'region--picked' : ''}`} onClick={tap} onKeyDown={onKey}>
      {children}
    </g>
  )
}

/** Label text in the house style. */
export function Label({ x, y, children, anchor = 'middle' }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end' }) {
  return <text x={x} y={y} textAnchor={anchor} className="art-label">{typeof children === 'string' ? <ArtWord>{children}</ArtWord> : children}</text>
}

/** A piece of illustration text, shown in the current language. */
export function ArtWord({ children }: { children: string }) {
  const { lang } = useLang()
  return <>{artText(children, lang)}</>
}

/** An illustration's <svg>, with its accessible name in the current language. */
export function ArtSvg({ label, children, ...rest }: SVGProps<SVGSVGElement> & { label: string }) {
  const { lang } = useLang()
  return <svg {...rest} role="img" aria-label={artText(label, lang)}>{children}</svg>
}

export const INK = '#2b2f38'
