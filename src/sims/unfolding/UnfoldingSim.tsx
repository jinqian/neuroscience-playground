import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { VESICLE_COLORS, VesiclesArt } from '../../illustrations/vesicles'
import { useLang } from '../../i18n/LanguageProvider'
import { t, type UiKey } from '../../i18n/t'
import type { SimProps } from '../../lab/types'
import { allMatched, canMatch, drop, STAGES, TARGETS, VESICLES, type Matches, type Stage, type Target, type Vesicle } from './model'

const STAGE_KEY: Record<Stage, UiKey> = { plate: 'stagePlate', groove: 'stageGroove', tube: 'stageTube', three: 'stageThree', five: 'stageFive' }
const VESICLE_KEY: Record<Vesicle, UiKey> = {
  telencephalon: 'vesTelencephalon', diencephalon: 'vesDiencephalon', mesencephalon: 'vesMesencephalon',
  metencephalon: 'vesMetencephalon', myelencephalon: 'vesMyelencephalon',
}
const TARGET_KEY: Record<Target, UiKey> = {
  hemispheres: 'tgtHemispheres', 'thalamus-hypothalamus': 'tgtThalamusHypothalamus', midbrain: 'tgtMidbrain',
  'pons-cerebellum': 'tgtPonsCerebellum', medulla: 'tgtMedulla',
}
/** A press that moves further than this (px) is a drag, not a tap. */
const DRAG_PX = 8

export function UnfoldingSim({ onGoalMet }: SimProps) {
  const { lang } = useLang()
  const [i, setI] = useState(0)
  const [matches, setMatches] = useState<Matches>({})
  const [selected, setSelected] = useState<Vesicle | null>(null)
  const [wrong, setWrong] = useState<Vesicle | null>(null)
  const drag = useRef<{ v: Vesicle; x: number; y: number; moved: boolean } | null>(null)
  const goalSent = useRef(false)
  const stage = STAGES[i]

  const place = (v: Vesicle, target: Target) => {
    const r = drop(matches, v, target)
    setMatches(r.matches)
    setSelected(null)
    setWrong(r.correct ? null : v)
  }

  useEffect(() => {
    if (allMatched(matches) && !goalSent.current) { goalSent.current = true; onGoalMet() }
  }, [matches, onGoalMet])

  const onDown = (e: PointerEvent<HTMLButtonElement>, v: Vesicle) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = { v, x: e.clientX, y: e.clientY, moved: false }
  }
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > DRAG_PX) d.moved = true
  }
  const onUp = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d?.moved) return
    const el = document.elementFromPoint?.(e.clientX, e.clientY)?.closest<HTMLElement>('[data-target]')
    if (el) place(d.v, el.dataset.target as Target)
  }
  const onTapVesicle = (v: Vesicle) => {
    const d = drag.current
    drag.current = null
    if (d?.moved || matches[v]) return
    setWrong(null)
    setSelected(selected === v ? null : v)
  }

  const matchedCount = VESICLES.filter((v) => matches[v]).length
  const vesicleFor = (target: Target) => VESICLES.find((v) => matches[v] === target)

  return (
    <div className="sim unfold">
      <label className="sim__label" htmlFor="stage">
        <span>{t('stageLabel', lang)}</span><b>{i + 1} / {STAGES.length}</b>
      </label>
      <input id="stage" aria-label={t('stageLabel', lang)} type="range" min={0} max={STAGES.length - 1} step={1} value={i} onChange={(e) => setI(Number(e.target.value))} />
      <div className="unfold__art" key={stage}>
        <VesiclesArt stage={stage} labels />
      </div>
      <p className="unfold__caption">{t(STAGE_KEY[stage], lang)}</p>

      {canMatch(stage) && (
        <div className="unfold__board" role="group" aria-label={t('matchPrompt', lang)}>
          <p className="unfold__prompt">{t('matchPrompt', lang)}</p>
          <div className="unfold__cols">
            <ul className="unfold__col">
              {VESICLES.map((v) => (
                <li key={v}>
                  <button type="button" className="unfold__ves" style={{ '--c': VESICLE_COLORS[v] } as React.CSSProperties}
                    aria-pressed={selected === v} data-matched={matches[v] ? 'true' : undefined} disabled={!!matches[v]}
                    onPointerDown={(e) => onDown(e, v)} onPointerMove={onMove} onPointerUp={onUp}
                    onClick={() => onTapVesicle(v)}>
                    {t(VESICLE_KEY[v], lang)}
                  </button>
                </li>
              ))}
            </ul>
            <ul className="unfold__col">
              {TARGETS.map((target) => {
                const v = vesicleFor(target)
                return (
                  <li key={target}>
                    <button type="button" className="unfold__tgt" data-target={target} disabled={!!v}
                      style={v ? ({ '--c': VESICLE_COLORS[v] } as React.CSSProperties) : undefined}
                      onClick={() => selected && place(selected, target)}>
                      {t(TARGET_KEY[target], lang)}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
          <p className="sim__wrong" role="status">{wrong ? t('wrongDropHint', lang, { vesicle: t(VESICLE_KEY[wrong], lang) }) : ''}</p>
        </div>
      )}
      <div className="sim__readout">{t('matchedCount', lang, { n: matchedCount })}</div>
    </div>
  )
}
