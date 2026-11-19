import { pick } from '../../i18n/lang'
import { useLang } from '../../i18n/LanguageProvider'
import { t } from '../../i18n/t'
import { RichText } from '../RichText'
import { PairBoard } from './PairBoard'
import { seededShuffle } from './shuffle'
import type { QProps } from './types'

export function Match({ question, response, onChange, disabled }: QProps<'match'>) {
  const { lang } = useLang()
  const pairs = response && 'pairs' in response ? response.pairs : {}
  const left = question.pairs.map((p) => ({ id: p.id, label: pick(p.left, lang) }))
  const right = seededShuffle(question.pairs, question.id).map((p) => ({ id: p.id, label: pick(p.right, lang) }))
  return (
    <div className="q">
      <h2 className="q__prompt"><RichText text={question.prompt} /></h2>
      <p className="q__sub">{t('matchHint', lang)}</p>
      <PairBoard left={left} right={right} pairs={pairs} onChange={(p) => onChange({ pairs: p })} disabled={disabled} />
    </div>
  )
}
