import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { pick } from '../../i18n/lang'
import { useLang } from '../../i18n/LanguageProvider'
import { t } from '../../i18n/t'
import { RichText } from '../RichText'
import { seededShuffle } from './shuffle'
import type { QProps } from './types'

/** Index of the row under the pointer (the nearest row if it's above or below the list). */
function rowAt(list: HTMLOListElement, clientY: number): number {
  const rows = Array.from(list.children) as HTMLElement[]
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i].getBoundingClientRect()
    if (clientY < r.bottom) return i
  }
  return rows.length - 1
}

export function Order({ question, response, onChange, disabled }: QProps<'order'>) {
  const { lang } = useLang()
  const order = response && 'order' in response ? response.order : seededShuffle(question.steps.map((s) => s.id), question.id)
  const list = useRef<HTMLOListElement>(null)
  const [dragging, setDragging] = useState<string | null>(null)

  useEffect(() => {
    if (!response) onChange({ order })
    // the initial shuffled order is itself a valid response
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  const moveTo = (id: string, to: number) => {
    const from = order.indexOf(id)
    if (from === to || to < 0 || to >= order.length) return
    const next = order.filter((x) => x !== id)
    next.splice(to, 0, id)
    onChange({ order: next })
  }

  const onPointerDown = (e: PointerEvent<HTMLLIElement>, id: string) => {
    if (disabled || e.button !== 0 || (e.target as HTMLElement).closest('button')) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDragging(id)
  }
  const onPointerMove = (e: PointerEvent<HTMLLIElement>) => {
    if (!dragging || !list.current) return
    moveTo(dragging, rowAt(list.current, e.clientY))
  }
  const endDrag = () => setDragging(null)

  return (
    <div className="q">
      <h2 className="q__prompt"><RichText text={question.prompt} /></h2>
      <p className="q__sub">{t('orderHint', lang)}</p>
      <ol className="order" ref={list}>
        {order.map((id, i) => {
          const step = question.steps.find((s) => s.id === id)!
          const label = pick(step.text, lang)
          return (
            <li
              key={id}
              className={`order__item ${dragging === id ? 'order__item--dragging' : ''} ${disabled ? 'order__item--locked' : ''}`}
              data-label={step.text.en}
              onPointerDown={(e) => onPointerDown(e, id)}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <span className="order__grip" aria-hidden="true">⠿</span>
              <span className="order__n" aria-hidden="true">{i + 1}</span>
              <span className="order__text">{label}</span>
              <span className="order__moves">
                <button type="button" className="order__btn" disabled={disabled || i === 0} aria-label={t('moveUp', lang, { item: label })} onClick={() => moveTo(id, i - 1)}>▲</button>
                <button type="button" className="order__btn" disabled={disabled || i === order.length - 1} aria-label={t('moveDown', lang, { item: label })} onClick={() => moveTo(id, i + 1)}>▼</button>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
