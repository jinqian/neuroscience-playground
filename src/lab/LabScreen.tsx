import { useEffect, useState } from 'react'
import type { Lab } from '../content/schema'
import { labReflectionPlan } from '../engine/lessonRun'
import { XP } from '../engine/xp'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { CompleteScreen } from '../lesson/CompleteScreen'
import { LessonFrame } from '../lesson/LessonFrame'
import { RichText } from '../lesson/RichText'
import { RunPlayer } from '../lesson/RunPlayer'
import { progressStore, useProgress } from '../progress/store'
import { Button } from '../ui/Button'
import { Dendri } from '../ui/Dendri'
import { SIMS } from './registry'

type Phase = 'intro' | 'sim' | 'reflect' | 'done'
type LabSnapshot = { phase: Phase; goalMet: boolean; earned: number }

function restoreLab(id: string): LabSnapshot | null {
  const s = progressStore.getState().lessonState[`${id}:lab`] as LabSnapshot | undefined
  return s && ['intro', 'sim', 'reflect'].includes(s.phase) ? s : null
}

export function LabScreen({ lesson }: { lesson: Lab }) {
  const { lang } = useLang()
  const addXp = useProgress((s) => s.addXp)
  const completeLesson = useProgress((s) => s.completeLesson)
  const saveLessonState = useProgress((s) => s.saveLessonState)
  const [saved] = useState(() => restoreLab(lesson.id))
  const [phase, setPhase] = useState<Phase>(saved?.phase ?? 'intro')
  const [goalMet, setGoalMet] = useState(saved?.goalMet ?? false)
  const [earned, setEarned] = useState(saved?.earned ?? 0)

  useEffect(() => {
    if (phase !== 'done') saveLessonState(`${lesson.id}:lab`, { phase, goalMet, earned } satisfies LabSnapshot)
  }, [lesson.id, phase, goalMet, earned, saveLessonState])
  const sim = SIMS[lesson.sim]

  if (phase === 'intro') {
    return (
      <RunPlayer
        saveKey={`${lesson.id}:intro`}
        steps={lesson.intro.map((c) => ({ kind: 'card' as const, id: c.id }))}
        cards={lesson.intro}
        questions={[]}
        onDone={() => setPhase('sim')}
      />
    )
  }

  if (phase === 'sim') {
    const onGoalMet = () => {
      if (goalMet) return
      setGoalMet(true)
      addXp(XP.labGoal)
      setEarned((e) => e + XP.labGoal)
    }
    return (
      <LessonFrame value={goalMet ? 1 : 0} max={1} variant="bench"
        footer={
          <div className={`feedback ${goalMet ? 'feedback--correct' : ''}`}>
            <div className="feedback__inner">
              <div className="feedback__text">
                {goalMet && <p className="feedback__title">{t('goalMet', lang, { n: XP.labGoal })}</p>}
              </div>
              <Button disabled={!goalMet} onClick={() => setPhase('reflect')}>{t('continue', lang)}</Button>
            </div>
          </div>
        }>
        <div className="bench">
          <div className="bench__goal">
            <span className="bench__eyebrow">{t('labGoal', lang)}</span>
            <h2><RichText text={lesson.goal} /></h2>
          </div>
          {sim && <sim.Component onGoalMet={onGoalMet} goalMet={goalMet} />}
          {goalMet && <div className="bench__cheer"><Dendri mood="cheer" size={64} /></div>}
          <aside className="bench__note">
            <b>{t('simplifiedModel', lang)}:</b> <RichText text={lesson.simplified} />
          </aside>
        </div>
      </LessonFrame>
    )
  }

  if (phase === 'reflect') {
    return (
      <RunPlayer
        saveKey={`${lesson.id}:reflect`}
        steps={labReflectionPlan(lesson)}
        cards={[]}
        questions={lesson.reflection}
        onDone={(run) => {
          completeLesson(lesson, run.missed, new Date())
          setEarned((e) => e + run.xp)
          setPhase('done')
        }}
      />
    )
  }

  return <CompleteScreen xp={earned} />
}
