import { pick } from '../../i18n/lang'
import { useLang } from '../../i18n/LanguageProvider'
import { OptionButton } from '../../ui/Button'
import { RichText } from '../RichText'
import type { QProps } from './types'

export function Mc({ question, response, onChange, disabled, result }: QProps<'mc'>) {
  const picked = response && 'optionId' in response ? response.optionId : undefined
  return (
    <div className="q">
      <h2 className="q__prompt"><RichText text={question.prompt} /></h2>
      <Options question={question} picked={picked} onPick={(id) => onChange({ optionId: id })} disabled={disabled} result={result} />
    </div>
  )
}

export function Options({ question, picked, onPick, disabled, result }: {
  question: QProps<'mc'>['question'] | QProps<'gap'>['question']; picked?: string; onPick(id: string): void; disabled: boolean; result?: 'correct' | 'wrong'
}) {
  const { lang } = useLang()
  return (
    <div className="options">
      {question.options.map((o) => {
        const state = o.id !== picked ? 'idle' : result === 'correct' ? 'correct' : result === 'wrong' ? 'wrong' : 'selected'
        return (
          <OptionButton key={o.id} state={state} disabled={disabled} onClick={() => onPick(o.id)}>
            {pick(o.text, lang)}
          </OptionButton>
        )
      })}
    </div>
  )
}
