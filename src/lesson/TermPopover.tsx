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
  const ref = useRef<HTMLDivElement>(null)

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
    <div ref={ref} className="term-pop" role="dialog" aria-label={term.en}>
      <dl className="term-pop__langs">
        {ALL_LANGUAGES.map((l) => (
          <div key={l} className="term-pop__row">
            <dt>{LANG_LABEL[l]}</dt>
            {term[l] ? <dd>{term[l]}</dd> : <dd className="term-pop__soon">{t('comingSoon', lang)}</dd>}
          </div>
        ))}
      </dl>
      {term.abbr && <p className="term-pop__extra"><b>{t('abbreviation', lang)}:</b> {term.abbr}</p>}
      {term.roots && <p className="term-pop__extra"><b>{t('roots', lang)}:</b> {term.roots}</p>}
    </div>
  )
}
