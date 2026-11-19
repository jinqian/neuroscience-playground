import { FIGURES } from '../../illustrations/registry'
import { useLang } from '../../i18n/LanguageProvider'
import { t } from '../../i18n/t'
import { RichText } from '../RichText'
import type { QProps } from './types'

export function Tap2d({ question, response, onChange, disabled }: QProps<'tap2d'>) {
  const { lang } = useLang()
  const figure = FIGURES[question.figure]
  const picked = response && 'regionId' in response ? response.regionId : undefined
  return (
    <div className="q">
      <h2 className="q__prompt"><RichText text={question.prompt} /></h2>
      <p className="q__sub">{t('tapHint', lang)}</p>
      <div className={`figure ${disabled ? 'figure--locked' : ''}`}>
        {figure && <figure.Component picked={picked} onTap={(id) => { if (!disabled) onChange({ regionId: id }) }} />}
      </div>
    </div>
  )
}
