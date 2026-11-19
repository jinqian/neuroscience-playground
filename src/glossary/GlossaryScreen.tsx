import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ALL_LANGUAGES } from '../config'
import { useContent } from '../content/ContentProvider'
import { LANG_LABEL } from '../i18n/lang'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { useProgress } from '../progress/store'
import { Dendri } from '../ui/Dendri'
import { filterTerms, firstLessonForTerm } from './glossaryIndex'

export function GlossaryScreen() {
  const bundle = useContent()
  const { lang } = useLang()
  const metTerms = useProgress((s) => s.metTerms)
  const [query, setQuery] = useState('')
  const [unit, setUnit] = useState<string>('all')
  const firstLesson = useMemo(() => firstLessonForTerm(bundle), [bundle])

  const met = bundle.glossary.filter((g) => metTerms.includes(g.id))
  const shown = filterTerms(met, query, unit).sort((a, b) => a.en.localeCompare(b.en))
  const unitsWithTerms = bundle.units.filter((u) => met.some((g) => g.unit === u.id))

  return (
    <div className="glossary">
      <h1>{t('glossaryTitle', lang)}</h1>
      <p className="glossary__intro">{t('glossaryIntro', lang)}</p>
      {met.length === 0 ? (
        <div className="empty">
          <Dendri />
          <p>{t('glossaryEmpty', lang)}</p>
        </div>
      ) : (
        <>
          <div className="glossary__tools">
            <input
              id="glossary-search"
              type="search"
              className="input"
              placeholder={t('glossarySearch', lang)}
              aria-label={t('glossarySearch', lang)}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="chips" role="group">
              <button type="button" className="chip" aria-pressed={unit === 'all'} onClick={() => setUnit('all')}>{t('allUnits', lang)}</button>
              {unitsWithTerms.map((u) => (
                <button key={u.id} type="button" className="chip" aria-pressed={unit === u.id} onClick={() => setUnit(u.id)}>
                  {t('unitShort', lang, { n: u.number })}
                </button>
              ))}
            </div>
          </div>
          <div className="table-wrap">
            <table className="gloss-table">
              <thead>
                <tr>{ALL_LANGUAGES.map((l) => <th key={l} scope="col">{LANG_LABEL[l]}</th>)}</tr>
              </thead>
              <tbody>
                {shown.map((term) => (
                  <tr key={term.id}>
                    {ALL_LANGUAGES.map((l, i) => (
                      <td key={l}>
                        {i === 0 && firstLesson[term.id] ? (
                          <Link to={`/lesson/${firstLesson[term.id]}`}>{term.en}</Link>
                        ) : (
                          term[l] ?? <span className="muted">—</span>
                        )}
                        {i === 0 && term.abbr && <span className="abbr"> ({term.abbr})</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {shown.length === 0 && <p className="muted">{t('noMatches', lang)}</p>}
          </div>
        </>
      )}
    </div>
  )
}
