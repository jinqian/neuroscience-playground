import { pick } from '../../i18n/lang'
import { useLang } from '../../i18n/LanguageProvider'
import { t } from '../../i18n/t'
import { OptionButton } from '../../ui/Button'
import { RichText } from '../RichText'
import type { QProps } from './types'

export function TfWhy({ question, response, onChange, disabled }: QProps<'tfwhy'>) {
  const { lang } = useLang()
  const r = response && 'value' in response ? response : undefined
  const value = r?.value
  const reasonId = r?.reasonId ?? ''
  return (
    <div className="q">
      <h2 className="q__prompt"><RichText text={question.statement} /></h2>
      <div className="options options--row">
        <OptionButton state={value === true ? 'selected' : 'idle'} disabled={disabled} onClick={() => onChange({ value: true, reasonId })}>{t('trueLabel', lang)}</OptionButton>
        <OptionButton state={value === false ? 'selected' : 'idle'} disabled={disabled} onClick={() => onChange({ value: false, reasonId })}>{t('falseLabel', lang)}</OptionButton>
      </div>
      {value !== undefined && (
        <>
          <p className="q__sub">{t('why', lang)}</p>
          <div className="options">
            {question.reasons.map((o) => (
              <OptionButton key={o.id} state={reasonId === o.id ? 'selected' : 'idle'} disabled={disabled} onClick={() => onChange({ value, reasonId: o.id })}>
                {pick(o.text, lang)}
              </OptionButton>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
