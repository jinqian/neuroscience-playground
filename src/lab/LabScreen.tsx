import { useState } from 'react'
import type { Lab } from '../content/schema'
import { labReflectionPlan } from '../engine/lessonRun'
import { XP } from '../engine/xp'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { CompleteScreen } from '../lesson/CompleteScreen'
import { LessonFrame } from '../lesson/LessonFrame'
import { RichText } from '../lesson/RichText'
import { RunPlayer } from '../lesson/RunPlayer'
import { useProgress } from '../progress/store'
import { Button } from '../ui/Button'
import { Dendri } from '../ui/Dendri'
import { SIMS } from './registry'

type Phase = 'intro' | 'sim' | 'reflect' | 'done'

export function LabScreen({ lesson }: { lesson: Lab }) {
  const { lang } = useLang()
  const addXp = useProgress((s) => s.addXp)
  const completeLesson = useProgress((s) => s.completeLesson)
  const [phase, setPhase] = useState<Phase>('intro')
  const [goalMet, setGoalMet] = useState(false)
  const [earned, setEarned] = useState(0)
  const sim = SIMS[lesson.sim]

  if (phase === 'intro') {
    return (
      <RunPlayer
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
