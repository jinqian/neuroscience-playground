import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from '../i18n/LanguageSwitcher'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'

/** The focused lesson layout: quit, an optional back, progress bar, language switcher, then one idea on screen. */
export function LessonFrame({ value, max, children, footer, variant, onBack }: {
  value: number; max: number; children: ReactNode; footer?: ReactNode; variant?: 'bench' | 'paper'
  /** When set, a Back button returns to the previous page. */
  onBack?: () => void
}) {
  const { lang } = useLang()
  const navigate = useNavigate()
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div className={`lesson ${variant ? `lesson--${variant}` : ''}`}>
      <div className="lesson__top">
        <button type="button" className="lesson__quit" aria-label={t('quit', lang)} onClick={() => navigate('/')}>✕</button>
        {onBack && <button type="button" className="lesson__back" aria-label={t('back', lang)} onClick={onBack}>←</button>}
        <div className="bar" role="progressbar" aria-label={t('progress', lang)} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
          <i style={{ width: `${pct}%` }} />
        </div>
        <LanguageSwitcher />
      </div>
      <div className="lesson__body">{children}</div>
      {footer}
    </div>
  )
}
