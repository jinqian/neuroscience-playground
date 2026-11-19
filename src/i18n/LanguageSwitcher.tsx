import { ALL_LANGUAGES } from '../config'
import { LANG_LABEL } from './lang'
import { useLang } from './LanguageProvider'
import { t } from './t'

export function LanguageSwitcher() {
  const { lang, setLang, enabled } = useLang()
  return (
    <div className="lang-switch" role="group" aria-label={t('language', lang)}>
      {ALL_LANGUAGES.map((l) => {
        const on = enabled.includes(l)
        return (
          <button
            key={l}
            type="button"
            className="lang-switch__btn"
            aria-pressed={l === lang}
            disabled={!on}
            title={on ? undefined : t('comingSoon', lang)}
            onClick={() => setLang(l)}
          >
            {LANG_LABEL[l]}
          </button>
        )
      })}
    </div>
  )
}
