import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { FlatMapAxis, SLOT_BOX, SLOT_COLOR } from '../../illustrations/flatMap'
import { INK } from '../../illustrations/Region'
import { useLang } from '../../i18n/LanguageProvider'
import { t, type UiKey } from '../../i18n/t'
import type { SimProps } from '../../lab/types'
import { useDragToTarget } from '../shared/useDragToTarget'
import { allPlaced, place, SLOTS, type Hint, type Placed, type Slot } from './model'

const NAME_KEY: Record<Slot, UiKey> = {
  'spinal-cord': 'fmSpinalCord', medulla: 'fmMedulla', pons: 'fmPons', cerebellum: 'fmCerebellum', midbrain: 'fmMidbrain',
  thalamus: 'fmThalamus', hypothalamus: 'fmHypothalamus', frontal: 'fmFrontal', parietal: 'fmParietal', temporal: 'fmTemporal', occipital: 'fmOccipital',
}
const HINT_KEY: Record<Hint, UiKey> = { higher: 'flatmapHintHigher', lower: 'flatmapHintLower', 'same-level': 'flatmapHintSame' }
/** The labels start in a fixed mixed-up order, so the bank doesn't give the answer away. */
const BANK_ORDER: Slot[] = ['thalamus', 'cerebellum', 'frontal', 'medulla', 'occipital', 'midbrain', 'spinal-cord', 'temporal', 'hypothalamus', 'parietal', 'pons']
const ALL_PLACED = Object.fromEntries(SLOTS.map((s) => [s, s])) as Placed

export function FlatMapSim({ onGoalMet, goalMet: reached }: SimProps) {
  const { lang } = useLang()
  const [placed, setPlaced] = useState<Placed>(reached ? ALL_PLACED : {})
  const [selected, setSelected] = useState<Slot | null>(null)
  const [hint, setHint] = useState<{ label: Slot; hint: Hint } | null>(null)
  const goalSent = useRef(reached)

  const put = (label: Slot, slot: Slot) => {
    const r = place(placed, label, slot)
    setPlaced(r.placed)
    setSelected(null)
    setHint(r.hint ? { label, hint: r.hint } : null)
  }
  const { drag, over, handlers, swallowClick } = useDragToTarget<Slot, Slot>(put)

  useEffect(() => {
    if (allPlaced(placed) && !goalSent.current) { goalSent.current = true; onGoalMet() }
  }, [placed, onGoalMet])

  const name = (s: Slot) => t(NAME_KEY[s], lang)
  const tapSlot = (slot: Slot) => { if (selected && !placed[slot]) put(selected, slot) }
  const onKey = (e: KeyboardEvent, slot: Slot) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapSlot(slot) }
  }
  const bank = BANK_ORDER.filter((s) => !placed[s])
  const count = SLOTS.filter((s) => placed[s]).length

  return (
    <div className="sim flatmap">
      <p className="unfold__prompt">{t('flatmapPrompt', lang)}</p>
      <div className="unfold__art">
        <svg viewBox="0 0 442 364" role="group" aria-label={t('flatmapPrompt', lang)}>
          <FlatMapAxis />
          {SLOTS.map((s, i) => {
            const [x, y, w, h] = SLOT_BOX[s]
            const label = placed[s]
            const title = t('fmSlot', lang, { n: i + 1 })
            return (
              <g key={s} role="button" tabIndex={0} data-target={s} aria-label={label ? `${title}: ${name(label)}` : title}
                className={`flatmap__slot ${label ? 'flatmap__slot--done' : ''} ${over === s ? 'flatmap__slot--over' : ''}`}
                onClick={() => tapSlot(s)} onKeyDown={(e) => onKey(e, s)}>
                <rect x={x} y={y} width={w} height={h} rx="10" fill={label ? SLOT_COLOR[s] : '#fff'} stroke={label ? INK : SLOT_COLOR[s]}
                  strokeWidth={label ? 2 : 3} strokeDasharray={label ? undefined : '6 4'} />
                <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" className="art-label">{label ? name(label) : i + 1}</text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="flatmap__bank" role="group" aria-label={t('flatmapBank', lang)}>
        {bank.map((s) => (
          <button key={s} type="button" className={`unfold__ves ${drag?.item === s ? 'unfold__ves--dragging' : ''}`}
            style={{ '--c': '#e9e4ff', ...(drag?.item === s ? { transform: `translate(${drag.dx}px, ${drag.dy}px)` } : {}) } as React.CSSProperties}
            aria-pressed={selected === s} {...handlers(s)}
            onClick={() => { if (swallowClick(s)) return; setHint(null); setSelected(selected === s ? null : s) }}>
            {name(s)}
          </button>
        ))}
      </div>
      <p className="sim__wrong" role="status">{hint ? t(HINT_KEY[hint.hint], lang, { label: name(hint.label) }) : ''}</p>
      <div className="sim__readout">{t('placedCount', lang, { n: count, total: SLOTS.length })}</div>
    </div>
  )
}
