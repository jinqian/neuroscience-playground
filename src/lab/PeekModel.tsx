import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'

/** The simulation's real TypeScript model, for the curious developer. */
export function PeekModel({ source }: { source: string }) {
  const { lang } = useLang()
  return (
    <details className="peek">
      <summary>{t('peekModel', lang)}</summary>
      <pre className="peek__code"><code>{source}</code></pre>
    </details>
  )
}
