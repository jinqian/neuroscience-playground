import type { ContentError } from '../content/schema'
import { t } from '../i18n/t'
import { Dendri } from './Dendri'

/** Shown instead of the app when content files don't parse or validate. English only: it's a developer screen. */
export function ErrorScreen({ errors }: { errors: ContentError[] }) {
  return (
    <main className="main">
      <div className="notice">
        <Dendri mood="oops" />
        <h1>{t('contentErrorsTitle', 'en')}</h1>
        <p>{t('contentErrorsHelp', 'en')}</p>
        <ul className="errors">
          {errors.map((e, i) => (
            <li key={i}>
              <b>{e.file}</b>{e.path ? ` — ${e.path}` : ''}: {e.message}
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
