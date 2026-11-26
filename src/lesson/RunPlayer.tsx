import { useEffect, useState } from 'react'
import type { Card, Question } from '../content/schema'
import { isCorrect, type Response } from '../engine/check'
import { back, canGoBack, emptyHistory, forward, leave, reviewing, type History, type Page } from '../engine/history'
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
  /** Back on the first page, before anything has been seen, leaves to the previous part (e.g. a Lab's sim). */
  onBackFromStart?: () => void
  /** Cards only: open on the last card, with the earlier cards behind it, as when coming back to a Lab's intro. */
  startAtEnd?: boolean
}

type Result = 'idle' | 'correct' | 'wrong'
type Snapshot = { run: RunState; drafts: Record<string, Response | undefined>; result: Result; history: History }

/** A saved place, if it still matches this lesson's cards and questions. */
function restore(saveKey: string | undefined, cards: Card[], questions: Question[]): Snapshot | null {
  if (!saveKey) return null
  const s = progressStore.getState().lessonState[saveKey] as Snapshot | undefined
  if (!s?.run?.steps || s.run.done || s.run.index >= s.run.steps.length) return null
  const fits = s.run.steps.every((st) => (st.kind === 'card' ? cards : questions).some((x) => x.id === st.id))
  if (!fits) return null
  // Places saved before going back existed have no history; a saved place always reopens on the live page.
  return { ...s, history: { pages: s.history?.pages ?? [], at: null } }
}

/** The opening place for a cards-only plan entered from its end. */
function atEnd(steps: Step[]): Snapshot {
  return {
    run: { ...startRun(steps), index: Math.max(0, steps.length - 1) },
    drafts: {},
    result: 'idle',
    history: { pages: steps.slice(0, -1).map((st) => ({ kind: 'card' as const, id: st.id })), at: null },
  }
}

/** Plays cards and questions in order; wrong answers come back at the end. */
export function RunPlayer({ steps, cards, questions, onDone, variant, saveKey, onBackFromStart, startAtEnd }: Props) {
  const { lang } = useLang()
  const addXp = useProgress((s) => s.addXp)
  const saveLessonState = useProgress((s) => s.saveLessonState)
  const [saved] = useState(() => (startAtEnd ? atEnd(steps) : restore(saveKey, cards, questions)))
  const [run, setRun] = useState<RunState>(() => saved?.run ?? startRun(steps))
  const [drafts, setDrafts] = useState<Record<string, Response | undefined>>(() => saved?.drafts ?? {})
  const [result, setResult] = useState<Result>(() => saved?.result ?? 'idle')
  const [history, setHistory] = useState<History>(() => saved?.history ?? emptyHistory)

  useEffect(() => {
    if (saveKey && !run.done) saveLessonState(saveKey, { run, drafts, result, history } satisfies Snapshot)
  }, [saveKey, run, drafts, result, history, saveLessonState])

  useEffect(() => {
    if (run.done) onDone(run)
    // onDone fires once, when the run finishes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.done])

  if (run.done) return null
  const step = run.steps[run.index]
  const correctCount = Object.keys(run.correct).length

  const onBack = canGoBack(history) ? () => setHistory(back) : onBackFromStart
  const past = reviewing(history)
  if (past) return <PastPage page={past} cards={cards} questions={questions} value={correctCount} max={questions.length} variant={variant}
    onBack={onBack} onContinue={() => setHistory(forward)} />

  const next = () => {
    const response = drafts[step.id]
    const page: Page | null = step.kind === 'card' ? { kind: 'card', id: step.id }
      : response && result !== 'idle' ? { kind: 'question', id: step.id, response, result } : null
    if (page) setHistory((h) => leave(h, page))
    if (step.kind === 'question' && result === 'wrong') setDrafts((d) => ({ ...d, [step.id]: undefined }))
    setResult('idle')
    setRun((r) => advance(r))
  }

  if (step.kind === 'card') {
    const card = cards.find((c) => c.id === step.id)!
    return (
      <LessonFrame value={correctCount} max={questions.length} variant={variant} onBack={onBack}
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
    <LessonFrame value={correctCount} max={questions.length} variant={variant} onBack={onBack}
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

type PastProps = {
  page: Page; cards: Card[]; questions: Question[]; value: number; max: number; variant?: 'bench' | 'paper'
  onBack?: () => void; onContinue(): void
}

/** A page already seen, shown as it was: a card, or a checked answer that can't be changed. */
function PastPage({ page, cards, questions, value, max, variant, onBack, onContinue }: PastProps) {
  const { lang } = useLang()
  const card = page.kind === 'card' ? cards.find((c) => c.id === page.id) : undefined
  const q = page.kind === 'question' ? questions.find((x) => x.id === page.id) : undefined
  if (page.kind === 'question' && q) {
    return (
      <LessonFrame value={value} max={max} variant={variant} onBack={onBack}
        footer={<FeedbackBar review state={page.result} explain={q.explain} canCheck={false} onCheck={() => {}} onContinue={onContinue} />}>
        <div className="q-wrap">
          <QuestionView question={q} response={page.response} onChange={() => {}} disabled result={page.result} />
        </div>
      </LessonFrame>
    )
  }
  return (
    <LessonFrame value={value} max={max} variant={variant} onBack={onBack}
      footer={<div className="feedback"><div className="feedback__inner"><span /><Button onClick={onContinue}>{t('continue', lang)}</Button></div></div>}>
      {card && <CardView card={card} />}
    </LessonFrame>
  )
}
