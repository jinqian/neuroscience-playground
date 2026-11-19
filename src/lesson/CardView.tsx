import { useState } from 'react'
import { BRAIN_ENABLED } from '../config'
import type { Card } from '../content/schema'
import { ILLUSTRATIONS } from '../illustrations/registry'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { BrainModalSlot } from './brainSlot'
import { RichText } from './RichText'
import { VerifyBadge } from './VerifyBadge'

export function CardView({ card }: { card: Card }) {
  const { lang } = useLang()
  const [exploring, setExploring] = useState(false)
  const Illustration = card.illustration ? ILLUSTRATIONS[card.illustration] : undefined
  return (
    <article className="card">
      {Illustration && <div className="card__art"><Illustration /></div>}
      {card.verify && <VerifyBadge />}
      <p className="card__body"><RichText text={card.body} /></p>
      {BRAIN_ENABLED && card.explore3d?.length ? (
        <button type="button" className="btn btn--secondary card__explore" onClick={() => setExploring(true)}>
          {t('exploreIn3d', lang)}
        </button>
      ) : null}
      {exploring && card.explore3d && <BrainModalSlot structures={card.explore3d} onClose={() => setExploring(false)} />}
    </article>
  )
}
