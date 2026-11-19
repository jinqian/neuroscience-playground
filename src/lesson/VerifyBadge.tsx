import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'

export function VerifyBadge() {
  const { lang } = useLang()
  return <span className="verify">{t('verifyBadge', lang)}</span>
}
