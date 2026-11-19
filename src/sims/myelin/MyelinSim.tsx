import { useEffect, useRef, useState } from 'react'
import type { SimProps } from '../../lab/types'
import { useLang } from '../../i18n/LanguageProvider'
import { t } from '../../i18n/t'
import { GOAL_MS, goalMet, travelTimeMs, velocity, type AxonParams } from './model'

/** Real impulses take milliseconds; the animation slows time down so you can see the race. */
const SLOW_MOTION = 40
const MAX_ANIM_MS = 4000

export function MyelinSim({ onGoalMet, goalMet: reached }: SimProps) {
  const { lang } = useLang()
  const [p, setP] = useState<AxonParams>({ diameterUm: 2, myelinated: false, demyelinatedFraction: 0 })
  const [run, setRun] = useState<{ id: number; ms: number | null } | null>(null)
  const dot = useRef<HTMLSpanElement>(null)
  const ms = travelTimeMs(p)
  const v = velocity(p)

  const send = () => {
    setRun({ id: Date.now(), ms })
    if (goalMet(p)) onGoalMet()
  }

  useEffect(() => {
    const el = dot.current
    if (!el || !run) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const end = run.ms === null ? '45%' : '100%'
    const duration = run.ms === null ? 1200 : Math.min(run.ms * SLOW_MOTION, MAX_ANIM_MS)
    if (reduce || !el.animate) { el.style.left = end; return }
    el.animate([{ left: '0%' }, { left: end }], { duration, fill: 'forwards', easing: 'linear' })
  }, [run])

  return (
    <div className="sim">
      <label className="sim__label" htmlFor="diameter">
        <span>{t('axonDiameter', lang)}</span><b>{p.diameterUm} µm</b>
      </label>
      <input id="diameter" type="range" min={0.5} max={20} step={0.5} value={p.diameterUm}
        onChange={(e) => setP({ ...p, diameterUm: Number(e.target.value) })} />

      <div className="seg" role="group" aria-label={t('myelin', lang)}>
        <button type="button" aria-pressed={!p.myelinated} onClick={() => setP({ ...p, myelinated: false })}>{t('myelinOff', lang)}</button>
        <button type="button" aria-pressed={p.myelinated} onClick={() => setP({ ...p, myelinated: true })}>{t('myelinOn', lang)}</button>
      </div>

      {p.myelinated && (
        <>
          <label className="sim__label" htmlFor="damage">
            <span>{t('demyelination', lang)}</span><b>{Math.round(p.demyelinatedFraction * 100)} %</b>
          </label>
          <input id="damage" type="range" min={0} max={1} step={0.1} value={p.demyelinatedFraction}
            onChange={(e) => setP({ ...p, demyelinatedFraction: Number(e.target.value) })} />
        </>
      )}

      <div className="race" aria-hidden="true">
        <span className="race__end">{t('spinalCord', lang)}</span>
        <div className={`race__track ${p.myelinated ? 'race__track--myelin' : ''}`} style={{ '--damage': p.demyelinatedFraction } as React.CSSProperties}>
          <span ref={dot} key={run?.id} className="race__dot" />
        </div>
        <span className="race__end">{t('bigToe', lang)}</span>
      </div>

      <button type="button" className="btn btn--primary" onClick={send}>{t('sendImpulse', lang)}</button>
      <p className="sim__console" aria-live="polite">
        {run === null
          ? '> ready'
          : run.ms === null
            ? t('conductionBlock', lang)
            : `${t('travelTime', lang, { ms: run.ms.toFixed(1), v: (1000 / run.ms).toFixed(1) })}${!reached && run.ms >= GOAL_MS ? `\n${t('tooSlow', lang, { goal: GOAL_MS })}` : ''}`}
      </p>
      <p className="sim__hint">{v === null ? t('conductionBlock', lang) : `≈ ${ms!.toFixed(1)} ms`}</p>
    </div>
  )
}
