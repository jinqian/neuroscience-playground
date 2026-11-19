import { useEffect, useRef } from 'react'
import { useContent } from '../content/ContentProvider'
import { ALL_LANGUAGES } from '../config'
import { LANG_LABEL } from '../i18n/lang'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'

/** The term in all three languages, plus roots and abbreviation. */
export function TermPopover({ termId, onClose }: { termId: string; onClose(): void }) {
  const { lang } = useLang()
  const term = useContent().glossary.find((g) => g.id === termId)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [onClose])

  if (!term) return null
  return (
    // Only inline elements: the popover opens inside running text (a <p>).
    <span ref={ref} className="term-pop" role="dialog" aria-label={term.en}>
      <span className="term-pop__langs">
        {ALL_LANGUAGES.map((l) => (
          <span key={l} className="term-pop__row">
            <span className="term-pop__lang">{LANG_LABEL[l]}</span>
            {term[l] ? <span className="term-pop__value">{term[l]}</span> : <span className="term-pop__value term-pop__soon">{t('comingSoon', lang)}</span>}
          </span>
        ))}
      </span>
      {term.abbr && <span className="term-pop__extra"><b>{t('abbreviation', lang)}:</b> {term.abbr}</span>}
      {term.roots && <span className="term-pop__extra"><b>{t('roots', lang)}:</b> {term.roots}</span>}
      <a className="term-pop__wiki" href={term.wiki[lang] ?? term.wiki.en} target="_blank" rel="noopener noreferrer">
        {t('readOnWikipedia', lang)} ↗
      </a>
    </span>
  )
}
