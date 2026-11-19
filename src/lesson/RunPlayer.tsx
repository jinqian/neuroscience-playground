import { useEffect, useState } from 'react'
import type { Card, Question } from '../content/schema'
import { isCorrect, type Response } from '../engine/check'
import { advance, answer, startRun, type RunState, type Step } from '../engine/lessonRun'
import { XP } from '../engine/xp'
import { useLang } from '../i18n/LanguageProvider'
import { t } from '../i18n/t'
import { progressStore, useProgress } from '../progress/store'
import { Button } from '../ui/Button'
import { Dendri } from '../ui/Dendri'
import { CardView } from './CardView'
import { FeedbackBar } from './FeedbackBar'
import { LessonFrame } from './LessonFrame'
import { QuestionView } from './questions/QuestionView'
import { isComplete } from './questions/types'

type Props = {
  steps: Step[]; cards: Card[]; questions: Question[]; onDone(run: RunState): void; variant?: 'bench' | 'paper'
  /** Where to remember the learner's place, so leaving mid-lesson resumes here. */
  saveKey?: string
}

type Result = 'idle' | 'correct' | 'wrong'
type Snapshot = { run: RunState; drafts: Record<string, Response | undefined>; result: Result }

/** A saved place, if it still matches this lesson's cards and questions. */
function restore(saveKey: string | undefined, cards: Card[], questions: Question[]): Snapshot | null {
  if (!saveKey) return null
  const s = progressStore.getState().lessonState[saveKey] as Snapshot | undefined
  if (!s?.run?.steps || s.run.done || s.run.index >= s.run.steps.length) return null
  const fits = s.run.steps.every((st) => (st.kind === 'card' ? cards : questions).some((x) => x.id === st.id))
  return fits ? s : null
}

/** Plays cards and questions in order; wrong answers come back at the end. */
export function RunPlayer({ steps, cards, questions, onDone, variant, saveKey }: Props) {
  const { lang } = useLang()
  const addXp = useProgress((s) => s.addXp)
  const saveLessonState = useProgress((s) => s.saveLessonState)
  const [saved] = useState(() => restore(saveKey, cards, questions))
  const [run, setRun] = useState<RunState>(() => saved?.run ?? startRun(steps))
  const [drafts, setDrafts] = useState<Record<string, Response | undefined>>(() => saved?.drafts ?? {})
  const [result, setResult] = useState<Result>(() => saved?.result ?? 'idle')

  useEffect(() => {
    if (saveKey && !run.done) saveLessonState(saveKey, { run, drafts, result } satisfies Snapshot)
  }, [saveKey, run, drafts, result, saveLessonState])

  useEffect(() => {
    if (run.done) onDone(run)
    // onDone fires once, when the run finishes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.done])

  if (run.done) return null
  const step = run.steps[run.index]
  const correctCount = Object.keys(run.correct).length

  const next = () => {
    if (step.kind === 'question' && result === 'wrong') setDrafts((d) => ({ ...d, [step.id]: undefined }))
    setResult('idle')
    setRun((r) => advance(r))
  }

  if (step.kind === 'card') {
    const card = cards.find((c) => c.id === step.id)!
    return (
      <LessonFrame value={correctCount} max={questions.length} variant={variant}
        footer={<div className="feedback"><div className="feedback__inner"><span /><Button onClick={next}>{t('continue', lang)}</Button></div></div>}>
        <CardView card={card} />
      </LessonFrame>
    )
  }

  const q = questions.find((x) => x.id === step.id)!
  const response = drafts[q.id]
  const onCheck = () => {
    if (!response) return
    const ok = isCorrect(q, response)
    setResult(ok ? 'correct' : 'wrong')
    setRun((r) => answer(r, q.id, ok))
    if (ok) addXp(XP.correct)
  }

  return (
    <LessonFrame value={correctCount} max={questions.length} variant={variant}
      footer={<FeedbackBar state={result} explain={q.explain} canCheck={isComplete(q, response)} onCheck={onCheck} onContinue={next} />}>
      <div className="q-wrap">
        <QuestionView
          key={`${q.id}:${run.index}`}
          question={q}
          response={response}
          onChange={(r) => setDrafts((d) => ({ ...d, [q.id]: r }))}
          disabled={result !== 'idle'}
          result={result === 'idle' ? undefined : result}
        />
        {result !== 'idle' && <div className="q-mascot"><Dendri mood={result === 'correct' ? 'happy' : 'oops'} size={64} /></div>}
      </div>
    </LessonFrame>
  )
}
