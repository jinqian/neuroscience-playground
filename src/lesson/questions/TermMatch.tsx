import { useContent } from '../../content/ContentProvider'
import { LANG_LABEL } from '../../i18n/lang'
import { useLang } from '../../i18n/LanguageProvider'
import { t } from '../../i18n/t'
import { PairBoard } from './PairBoard'
import { seededShuffle } from './shuffle'
import type { QProps } from './types'

export function TermMatch({ question, response, onChange, disabled }: QProps<'termmatch'>) {
  const { lang } = useLang()
  const glossary = useContent().glossary
  const terms = question.terms.map((id) => glossary.find((g) => g.id === id)!).filter(Boolean)
  const label = (id: string, l: 'en' | 'fr' | 'zh') => {
    const term = terms.find((x) => x.id === id)
    return term?.[l] ?? term?.en ?? id
  }
  const pairs = response && 'pairs' in response ? response.pairs : {}
  return (
    <div className="q">
      <h2 className="q__prompt">{LANG_LABEL[question.from]} ↔ {LANG_LABEL[question.to]}</h2>
      <p className="q__sub">{t('matchHint', lang)}</p>
      <PairBoard
        left={terms.map((x) => ({ id: x.id, label: label(x.id, question.from) }))}
        right={seededShuffle(terms, question.id).map((x) => ({ id: x.id, label: label(x.id, question.to) }))}
        pairs={pairs}
        onChange={(p) => onChange({ pairs: p })}
        disabled={disabled}
      />
    </div>
  )
}
