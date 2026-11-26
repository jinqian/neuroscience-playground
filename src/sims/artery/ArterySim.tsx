import { useEffect, useRef, useState } from 'react'
import { ARTERIES, TERRITORY_COLOR, TerritoryViewsArt, type Artery } from '../../illustrations/territories'
import { useLang } from '../../i18n/LanguageProvider'
import { t, type UiKey } from '../../i18n/t'
import type { SimProps } from '../../lab/types'
import { Button } from '../../ui/Button'
import { allSolved, blockAt, PATIENTS, type ArteryState, type Miss, type Patient, type Side } from './model'

const NAME: Record<Artery, UiKey> = { aca: 'arteryAca', mca: 'arteryMca', pca: 'arteryPca' }
const SIDE: Record<Side, UiKey> = { left: 'sideLeft', right: 'sideRight' }
const BLOCK: Record<Artery, Record<Side, UiKey>> = {
  aca: { left: 'blockAcaLeft', right: 'blockAcaRight' },
  mca: { left: 'blockMcaLeft', right: 'blockMcaRight' },
  pca: { left: 'blockPcaLeft', right: 'blockPcaRight' },
}
const MISS_ARTERY: Record<Artery, UiKey> = { aca: 'missAca', mca: 'missMca', pca: 'missPca' }
const PATIENT_KEY = { p1: 'arteryP1', p2: 'arteryP2', p3: 'arteryP3' } as const satisfies Record<Patient['id'], UiKey>
const SOLVED_KEY = { p1: 'solvedP1', p2: 'solvedP2', p3: 'solvedP3' } as const satisfies Record<Patient['id'], UiKey>
const ALL_SOLVED: ArteryState = { index: PATIENTS.length - 1, solved: PATIENTS.map((p) => p.id) }

type Feedback = { kind: 'miss'; miss: Miss; artery: Artery } | { kind: 'solved'; id: Patient['id'] }

/** Pick an artery and a side to see the territory it feeds; then say which one is blocked for each patient. */
export function ArterySim({ onGoalMet, goalMet: reached }: SimProps) {
  const { lang } = useLang()
  const [state, setState] = useState<ArteryState>(reached ? ALL_SOLVED : { index: 0, solved: [] })
  const [artery, setArtery] = useState<Artery | null>(null)
  const [side, setSide] = useState<Side | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const goalSent = useRef(reached)
  const done = allSolved(state)
  const current = PATIENTS[state.index]

  useEffect(() => {
    if (done && !goalSent.current) { goalSent.current = true; onGoalMet() }
  }, [done, onGoalMet])

  const pickArtery = (a: Artery) => { setArtery(a); setFeedback(null) }
  const pickSide = (s: Side) => { setSide(s); setFeedback(null) }
  const submit = () => {
    if (!artery || !side || done) return
    const r = blockAt(state, artery, side)
    setState(r.state)
    setFeedback(r.correct ? { kind: 'solved', id: current.id } : { kind: 'miss', miss: r.miss ?? 'artery', artery })
  }

  const message = !feedback ? ''
    : feedback.kind === 'solved' ? t(SOLVED_KEY[feedback.id], lang)
    : t(feedback.miss === 'side' ? 'missSide' : MISS_ARTERY[feedback.artery], lang)

  return (
    <div className="sim artery">
      {done ? (
        <p className="lesion__case lesion__case--done">{t('arteryAllSolved', lang)}</p>
      ) : (
        <div className="lesion__case">
          <span className="bench__eyebrow">{t('lesionCase', lang, { n: state.index + 1, total: PATIENTS.length })}</span>
          <p>{t(PATIENT_KEY[current.id], lang)}</p>
          <p className="lesion__side">{t('arteryPrompt', lang)}</p>
        </div>
      )}
      <div className="artery__pickers">
        <div className="chips" role="group" aria-label={t('arteryPick', lang)}>
          {ARTERIES.map((a) => (
            <button key={a} type="button" className="chip artery__chip" aria-pressed={artery === a} onClick={() => pickArtery(a)}
              style={{ ['--swatch' as string]: TERRITORY_COLOR[a] }}>
              {t(NAME[a], lang)}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label={t('sidePick', lang)}>
          {(['left', 'right'] as const).map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={side === s} onClick={() => pickSide(s)}>{t(SIDE[s], lang)}</button>
          ))}
        </div>
      </div>
      <div className="unfold__art">
        <TerritoryViewsArt lit={artery ?? undefined} side={side ?? 'left'} />
      </div>
      {artery && side && <p className="artery__deficit">{t(BLOCK[artery][side], lang)}</p>}
      {!done && <Button disabled={!artery || !side} onClick={submit}>{t('blockedHere', lang)}</Button>}
      <p className={feedback?.kind === 'solved' ? 'lesion__ok' : 'sim__wrong'} role="status">{message}</p>
      <div className="sim__readout">{t('solvedCount', lang, { n: state.solved.length, total: PATIENTS.length })}</div>
    </div>
  )
}
