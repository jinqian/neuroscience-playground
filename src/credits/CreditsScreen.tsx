import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'

/** Required attribution for third-party material. The BodyParts3D line must stay word-for-word. */
export const BODYPARTS3D_ATTRIBUTION =
  'BodyParts3D, Copyright© The Database Center for Life Science licensed by CC Attribution-Share Alike 2.1 Japan'

export function CreditsScreen() {
  const { lang } = useLang()
  return (
    <div className="credits">
      <h1>{t('credits', lang)}</h1>

      <section>
        <h2>{t('creditsModelTitle', lang)}</h2>
        <p className="credits__attribution">{BODYPARTS3D_ATTRIBUTION}</p>
        <p>{t('creditsModelBody', lang)}</p>
        <p>
          {t('creditsLicense', lang)}{' '}
          <a href="https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en" target="_blank" rel="noopener noreferrer">CC BY-SA 2.1 JP</a>
          {' · '}
          <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html" target="_blank" rel="noopener noreferrer">BodyParts3D</a>
        </p>
        <p className="credits__cite">{t('creditsCite', lang)}</p>
      </section>

      <section>
        <h2>{t('creditsWikiTitle', lang)}</h2>
        <p>{t('creditsWikiBody', lang)}</p>
      </section>

      <section>
        <h2>{t('creditsContentTitle', lang)}</h2>
        <p>{t('creditsContentBody', lang)}</p>
      </section>

      <section>
        <h2>{t('creditsFontTitle', lang)}</h2>
        <p>{t('creditsFontBody', lang)}</p>
      </section>

      <section>
        <h2>{t('creditsCodeTitle', lang)}</h2>
        <p>{t('creditsCodeBody', lang)}</p>
      </section>
    </div>
  )
}
