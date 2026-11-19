import { useEffect, useState } from 'react'
import { useContent } from '../content/ContentProvider'
import { pick } from '../i18n/lang'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { Button } from '../ui/Button'
import { BrainView, NoWebGL } from './BrainView'
import { CORTEX } from './visual'

/** Full-screen 3D view focused on a lesson's structures, with "find it" prompts. */
export function BrainModal({ structures: ids, onClose }: { structures: string[]; onClose(): void }) {
  const { lang } = useLang()
  const all = useContent().structures
  const meshed = ids.filter((id) => all.find((s) => s.id === id && !s.twoDOnly))
  const twoD = ids.filter((id) => !meshed.includes(id))
  const [i, setI] = useState(0)
  const [result, setResult] = useState<'found' | string | null>(null)
  const name = (id: string) => pick(all.find((s) => s.id === id)?.name ?? { en: id }, lang)
  const target = meshed[i % Math.max(meshed.length, 1)]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={t('exploreTitle', lang)}>
      <div className="modal__box">
        <div className="modal__head">
          <h2>{t('exploreTitle', lang)}</h2>
          <button type="button" className="lesson__quit" aria-label={t('close', lang)} onClick={onClose}>✕</button>
        </div>
        {target && (
          <div className={`quiz-banner ${result === 'found' ? 'quiz-banner--ok' : result ? 'quiz-banner--wrong' : ''}`} role="status">
            <span>
              {!result && t('findPrompt', lang, { name: name(target) })}
              {result === 'found' && `✓ ${name(target)}`}
              {result && result !== 'found' && t('notThat', lang, { name: name(result) })}
            </span>
            {result === 'found' && meshed.length > 1 && (
              <Button variant="secondary" onClick={() => { setI((n) => n + 1); setResult(null) }}>{t('nextPart', lang)}</Button>
            )}
          </div>
        )}
        <BrainView
          labels={result === 'found'}
          translucentCortex={meshed.some((id) => !CORTEX.includes(id))}
          hemisphere="both"
          highlight={result === 'found' ? [target] : []}
          focus={meshed}
          onPick={(id) => { if (result !== 'found') setResult(id === target ? 'found' : id) }}
          fallback={<NoWebGL />}
        />
        {twoD.length > 0 && (
          <p className="muted-strong">{t('twoDOnlyHelp', lang)} {twoD.map(name).join(', ')}</p>
        )}
      </div>
    </div>
  )
}
