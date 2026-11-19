import { useState } from 'react'
import type { Case } from '../content/schema'
import { XP } from '../engine/xp'
import { pick, type LText } from '../i18n/lang'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { CompleteScreen } from '../lesson/CompleteScreen'
import { LessonFrame } from '../lesson/LessonFrame'
import { RichText } from '../lesson/RichText'
import { VerifyBadge } from '../lesson/VerifyBadge'
import { useProgress } from '../progress/store'
import { Button } from '../ui/Button'
import { Dendri } from '../ui/Dendri'
import { canMakeFinalCall, finalCall, startCase, unlockClue } from './caseRun'
import { ClueUnlock } from './ClueUnlock'
import { FinalCall } from './FinalCall'

export function CaseScreen({ lesson }: { lesson: Case }) {
  const { lang } = useLang()
  const addXp = useProgress((s) => s.addXp)
  const completeLesson = useProgress((s) => s.completeLesson)
  const [state, setState] = useState(() => startCase(lesson))
  const [opened, setOpened] = useState<string | null>(null)
  const [verdict, setVerdict] = useState<{ picked: string; correct: boolean; explanation: LText } | null>(null)
  const [finished, setFinished] = useState(false)

  if (finished) return <CompleteScreen xp={state.xp} />

  const ready = canMakeFinalCall(lesson, state)
  const steps = lesson.clues.length + 1

  const answerClue = (clueId: string, correct: boolean) => {
    setState((s) => unlockClue(s, clueId, correct))
    if (correct) { addXp(XP.correct); setOpened(null) }
  }

  const pickFinal = (id: string) => {
    if (state.solved) return
    const r = finalCall(lesson, state, id)
    setState(r.state)
    setVerdict({ picked: id, correct: r.correct, explanation: r.explanation })
    if (r.correct) {
      addXp(XP.caseSolved)
      completeLesson(lesson, r.state.missed, new Date())
    }
  }

  return (
    <LessonFrame value={state.unlocked.size + (state.solved ? 1 : 0)} max={steps} variant="paper"
      footer={state.solved ? (
        <div className="feedback feedback--correct" role="status">
          <div className="feedback__inner">
            <div className="feedback__text">
              <p className="feedback__title">{t('caseSolved', lang, { n: XP.caseSolved })}</p>
              <p className="feedback__explain"><RichText text={lesson.solved} /></p>
            </div>
            <Button onClick={() => setFinished(true)} autoFocus>{t('finish', lang)}</Button>
          </div>
        </div>
      ) : undefined}>
      <article className="casefile">
        <span className="casefile__tab">{t('caseFile', lang)}</span>
        <h1 className="casefile__title">{pick(lesson.title, lang)}</h1>
        <p className="casefile__story"><RichText text={lesson.story} /></p>

        <h2 className="casefile__h">{t('clues', lang)}</h2>
        <ol className="clues">
          {lesson.clues.map((clue, i) => {
            const open = state.unlocked.has(clue.id)
            return (
              <li key={clue.id} className={`clue ${open ? '' : 'clue--locked'}`}>
                <span className="clue__n">{i + 1}</span>
                <div className="clue__body">
                  {open ? (
                    <>
                      {clue.verify && <VerifyBadge />}
                      <p><RichText text={clue.text} /></p>
                    </>
                  ) : opened === clue.id && clue.unlock ? (
                    <ClueUnlock question={clue.unlock} onAnswer={(ok) => answerClue(clue.id, ok)} />
                  ) : (
                    <div className="clue__locked">
                      <p>{t('lockedClue', lang)}</p>
                      <Button variant="secondary" onClick={() => setOpened(clue.id)} aria-label={t('unlockClue', lang, { n: i + 1 })}>
                        {t('unlockClue', lang, { n: i + 1 })}
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>

        <section className="call">
          <h2 className="casefile__h">{t('makeTheCall', lang)}</h2>
          {ready ? (
            <>
              <p className="call__prompt"><RichText text={lesson.final.prompt} /></p>
              <FinalCall lesson={lesson} picked={verdict?.picked} correct={verdict?.correct} disabled={state.solved} onPick={pickFinal} />
              {verdict && !verdict.correct && (
                <div className="call__wrong" role="status">
                  <Dendri mood="oops" size={48} />
                  <p><RichText text={verdict.explanation} /></p>
                </div>
              )}
            </>
          ) : (
            <p className="muted">{t('allCluesFirst', lang)}</p>
          )}
        </section>
      </article>
    </LessonFrame>
  )
}
