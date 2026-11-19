import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { Button } from '../ui/Button'
import { Dendri } from '../ui/Dendri'

export function CompleteScreen({ xp, children }: { xp: number; children?: React.ReactNode }) {
  const { lang } = useLang()
  const navigate = useNavigate()
  return (
    <div className="complete">
      <Dendri mood="cheer" size={140} />
      <h1>{t('lessonComplete', lang)}</h1>
      <p className="complete__xp">{t('xpEarned', lang, { n: xp })}</p>
      {children}
      <Button onClick={() => navigate('/')} autoFocus>{t('continue', lang)}</Button>
    </div>
  )
}
