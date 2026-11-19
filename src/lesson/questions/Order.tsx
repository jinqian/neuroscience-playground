import { useEffect } from 'react'
import { pick } from '../../i18n/lang'
import { useLang } from '../../i18n/LanguageProvider'
import { t } from '../../i18n/t'
import { RichText } from '../RichText'
import { seededShuffle } from './shuffle'
import type { QProps } from './types'

export function Order({ question, response, onChange, disabled }: QProps<'order'>) {
  const { lang } = useLang()
  const order = response && 'order' in response ? response.order : seededShuffle(question.steps.map((s) => s.id), question.id)
  useEffect(() => {
    if (!response) onChange({ order })
    // the initial shuffled order is itself a valid response
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  const move = (i: number, d: -1 | 1) => {
    const next = [...order]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange({ order: next })
  }

  return (
    <div className="q">
      <h2 className="q__prompt"><RichText text={question.prompt} /></h2>
      <p className="q__sub">{t('orderHint', lang)}</p>
      <ol className="order">
        {order.map((id, i) => {
          const step = question.steps.find((s) => s.id === id)!
          const label = pick(step.text, lang)
          return (
            <li key={id} className="order__item" data-label={step.text.en}>
              <span className="order__n" aria-hidden="true">{i + 1}</span>
              <span className="order__text">{label}</span>
              <span className="order__moves">
                <button type="button" className="order__btn" disabled={disabled || i === 0} aria-label={t('moveUp', lang, { item: label })} onClick={() => move(i, -1)}>▲</button>
                <button type="button" className="order__btn" disabled={disabled || i === order.length - 1} aria-label={t('moveDown', lang, { item: label })} onClick={() => move(i, 1)}>▼</button>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
