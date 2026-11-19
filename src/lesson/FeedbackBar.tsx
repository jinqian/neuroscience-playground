import type { LText } from '../i18n/lang'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { XP } from '../engine/xp'
import { Button } from '../ui/Button'
import { RichText } from './RichText'

type Props = { state: 'idle' | 'correct' | 'wrong'; explain?: LText; canCheck: boolean; onCheck(): void; onContinue(): void }

export function FeedbackBar({ state, explain, canCheck, onCheck, onContinue }: Props) {
  const { lang } = useLang()
  return (
    <div className={`feedback feedback--${state}`} role={state === 'idle' ? undefined : 'status'}>
      <div className="feedback__inner">
        <div className="feedback__text">
          {state === 'correct' && <p className="feedback__title">{t('correctTitle', lang, { n: XP.correct })}</p>}
          {state === 'wrong' && <p className="feedback__title">{t('wrongTitle', lang)}</p>}
          {state !== 'idle' && explain && <p className="feedback__explain"><RichText text={explain} /></p>}
          {state === 'wrong' && <p className="feedback__hint">{t('wrongHint', lang)}</p>}
        </div>
        {state === 'idle' ? (
          <Button onClick={onCheck} disabled={!canCheck}>{t('check', lang)}</Button>
        ) : (
          <Button variant={state === 'wrong' ? 'danger' : 'primary'} onClick={onContinue} autoFocus>{t('continue', lang)}</Button>
        )}
      </div>
    </div>
  )
}
