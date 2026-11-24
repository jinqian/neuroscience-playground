import { useEffect, useRef, useState } from 'react'
import { LateralBrainArt } from '../../illustrations/lateralBrain'
import { useLang } from '../../i18n/LanguageProvider'
import { t, type UiKey } from '../../i18n/t'
import type { SimProps } from '../../lab/types'
import { allSolved, CASES, tapZone, type LesionState, type Zone } from './model'

const WHY_KEY: Record<Zone, UiKey> = {
  prefrontal: 'whyPrefrontal', 'motor-strip': 'whyMotorStrip', broca: 'whyBroca', 'sensory-strip': 'whySensoryStrip',
  'parietal-association': 'whyParietalAssociation', wernicke: 'whyWernicke', auditory: 'whyAuditory', visual: 'whyVisual',
  cerebellum: 'whyCerebellum', brainstem: 'whyBrainstem',
}
const CASE_KEY = { c1: 'lesionC1', c2: 'lesionC2', c3: 'lesionC3', c4: 'lesionC4', c5: 'lesionC5', c6: 'lesionC6' } as const satisfies Record<string, UiKey>
const SOLVED_KEY = { c1: 'solvedC1', c2: 'solvedC2', c3: 'solvedC3', c4: 'solvedC4', c5: 'solvedC5', c6: 'solvedC6' } as const satisfies Record<string, UiKey>
const ALL_SOLVED: LesionState = { index: CASES.length - 1, solved: CASES.map((c) => c.id) }

type Feedback = { kind: 'wrong'; zone: Zone } | { kind: 'solved'; caseId: keyof typeof SOLVED_KEY }

export function LesionSim({ onGoalMet, goalMet: reached }: SimProps) {
  const { lang } = useLang()
  const [state, setState] = useState<LesionState>(reached ? ALL_SOLVED : { index: 0, solved: [] })
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const goalSent = useRef(reached)
  const done = allSolved(state)
  const current = CASES[state.index]

  useEffect(() => {
    if (done && !goalSent.current) { goalSent.current = true; onGoalMet() }
  }, [done, onGoalMet])

  const tap = (zoneId: string) => {
    if (done) return
    const zone = zoneId as Zone
    const r = tapZone(state, zone)
    setState(r.state)
    setFeedback(r.correct ? { kind: 'solved', caseId: current.id } : { kind: 'wrong', zone })
  }

  const message = feedback?.kind === 'wrong' ? t(WHY_KEY[feedback.zone], lang) : feedback ? t(SOLVED_KEY[feedback.caseId], lang) : ''

  return (
    <div className="sim lesion">
      {done ? (
        <p className="lesion__case lesion__case--done">{t('lesionAllSolved', lang)}</p>
      ) : (
        <div className="lesion__case">
          <span className="bench__eyebrow">{t('lesionCase', lang, { n: state.index + 1, total: CASES.length })}</span>
          <p>{t(CASE_KEY[current.id], lang)}</p>
          <p className="lesion__side">{t(current.side === 'left' ? 'lesionSideLeft' : 'lesionSideRight', lang)} · {t('lesionPrompt', lang)}</p>
        </div>
      )}
      <div className="unfold__art">
        <LateralBrainArt side={current.side} onTap={tap} picked={feedback?.kind === 'wrong' ? feedback.zone : undefined} />
      </div>
      <p className={feedback?.kind === 'solved' ? 'lesion__ok' : 'sim__wrong'} role="status">{message}</p>
      <div className="sim__readout">{t('solvedCount', lang, { n: state.solved.length, total: CASES.length })}</div>
    </div>
  )
}
