import { pick } from '../../i18n/lang'
import { useLang } from '../../i18n/LanguageProvider'
import { Options } from './Mc'
import type { QProps } from './types'

export function Gap({ question, response, onChange, disabled, result }: QProps<'gap'>) {
  const { lang } = useLang()
  const picked = response && 'optionId' in response ? response.optionId : undefined
  const chosen = question.options.find((o) => o.id === picked)
  const [before, after] = pick(question.prompt, lang).split('___')
  return (
    <div className="q">
      <h2 className="q__prompt">
        {before}
        <span className={`gap ${chosen ? 'gap--filled' : ''}`}>{chosen ? pick(chosen.text, lang) : ' '}</span>
        {after}
      </h2>
      <Options question={question} picked={picked} onPick={(id) => onChange({ optionId: id })} disabled={disabled} result={result} />
    </div>
  )
}
